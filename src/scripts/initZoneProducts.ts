import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

// Load environment variables
dotenv.config();

// MongoDB connection
const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/warehouse2";

// Import models
import '../models/User';
import '../models/Product';
import '../models/Zone';
import '../models/ZoneProduct';
import '../models/InventoryAlert';
import '../models/ProductMovement';

// Get model references
const User = mongoose.model('User');
const Product = mongoose.model('Product');
const Zone = mongoose.model('Zone');
const ZoneProduct = mongoose.model('ZoneProduct');
const InventoryAlert = mongoose.model('InventoryAlert');
const ProductMovement = mongoose.model('ProductMovement');

// Helper function to get random element from array
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper function to get random elements from array
const getRandomElements = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Initialize database with ZoneProduct data
const initZoneProducts = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to MongoDB!');

    // Clear existing ZoneProduct data
    console.log('Clearing existing ZoneProduct data...');
    await ZoneProduct.deleteMany({});
    await ProductMovement.deleteMany({ type: { $in: ['receipt', 'transfer'] } });
    await InventoryAlert.deleteMany({});

    // Get existing data
    const products = await Product.find({});
    const zones = await Zone.find({});
    const admin = await User.findOne({ username: 'admin' });

    if (!admin) {
      console.error('Admin user not found. Create users first.');
      process.exit(1);
    }

    if (products.length === 0) {
      console.error('No products found. Create products first.');
      process.exit(1);
    }

    if (zones.length === 0) {
      console.error('No zones found. Create zones first.');
      process.exit(1);
    }

    console.log('Creating ZoneProduct records...');

    // Categorize zones by type
    const salesZones = zones.filter(z => z.type === 'sales');
    const warehouseZones = zones.filter(z => z.type === 'warehouse');
    const receivingZones = zones.filter(z => z.type === 'receiving');
    const pickupZones = zones.filter(z => z.type === 'pickup');
    
    // For each product, create at least one ZoneProduct record
    const zoneProductRecords = [];
    const productMovementRecords = [];
    const inventoryAlertRecords = [];

    for (const product of products) {
      // 1. Warehouse zone placement (for all products)
      if (warehouseZones.length > 0) {
        const warehouseZone = getRandomElement(warehouseZones);
        const warehouseQuantity = faker.number.int({ min: 5, max: 100 });
        
        // Calculate expiry date (optional)
        const hasExpiry = faker.datatype.boolean(0.7); // 70% chance of having expiry date
        let expiryDate = undefined;
        
        if (hasExpiry) {
          const today = new Date();
          // Random expiry from 1 month to 2 years in the future
          expiryDate = faker.date.between({ 
            from: new Date(today.setMonth(today.getMonth() + 1)), 
            to: new Date(today.setFullYear(today.getFullYear() + 2))
          });
        }

        // Check if we need to create a near-expiry record
        const isNearExpiry = faker.datatype.boolean(0.15); // 15% chance
        if (isNearExpiry && hasExpiry) {
          // Set expiry date to within next 7 days
          const today = new Date();
          expiryDate = faker.date.between({ 
            from: today, 
            to: new Date(today.setDate(today.getDate() + 7))
          });
        }

        // Create zone product record
        const warehouseZoneProduct = {
          zone: warehouseZone._id,
          product: product._id,
          quantity: warehouseQuantity,
          status: 'available',
          expiryDate,
          isPromotion: false,
          lastUpdated: {
            by: admin._id,
            reason: 'Initial stocking'
          }
        };

        zoneProductRecords.push(warehouseZoneProduct);

        // Create movement record
        productMovementRecords.push({
          product: product._id,
          type: 'receipt',
          quantity: warehouseQuantity,
          toZone: warehouseZone._id,
          performedBy: admin._id,
          reason: 'Initial inventory setup',
          reference: `Initial stocking of ${product.name}`
        });

        // Update zone occupancy
        await Zone.findByIdAndUpdate(
          warehouseZone._id,
          { $inc: { currentOccupancy: warehouseQuantity } }
        );

        // Create inventory alert for near-expiry products
        if (isNearExpiry && expiryDate) {
          inventoryAlertRecords.push({
            type: 'expiring_soon',
            productId: product._id,
            zoneId: warehouseZone._id,
            message: `Product "${product.name}" in zone "${warehouseZone.name}" expires on ${expiryDate.toLocaleDateString()}`,
            level: 'warning',
            isResolved: false
          });
        }
      }

      // 2. Some products in sales zones (50% chance)
      if (salesZones.length > 0 && faker.datatype.boolean(0.5)) {
        const salesZone = getRandomElement(salesZones);
        const salesQuantity = faker.number.int({ min: 1, max: 20 });
        
        // Determine if it's a promotional item
        const isPromotion = faker.datatype.boolean(0.3); // 30% chance
        let promotionEndDate = undefined;
        
        if (isPromotion) {
          // Promotion ends in 1-30 days
          const today = new Date();
          promotionEndDate = faker.date.between({ 
            from: new Date(today.setDate(today.getDate() + 1)), 
            to: new Date(today.setDate(today.getDate() + 30))
          });
        }

        // Create zone product record
        const salesZoneProduct = {
          zone: salesZone._id,
          product: product._id,
          quantity: salesQuantity,
          status: 'available',
          isPromotion,
          promotionEndDate,
          lastUpdated: {
            by: admin._id,
            reason: isPromotion ? 'Initial promotion setup' : 'Initial sales floor stocking'
          }
        };

        zoneProductRecords.push(salesZoneProduct);

        // Create movement record (transfer from warehouse to sales)
        if (warehouseZones.length > 0) {
          const sourceWarehouse = getRandomElement(warehouseZones);
          
          productMovementRecords.push({
            product: product._id,
            type: 'transfer',
            quantity: salesQuantity,
            fromZone: sourceWarehouse._id,
            toZone: salesZone._id,
            performedBy: admin._id,
            reason: 'Transfer to sales floor',
            reference: `Moving ${salesQuantity} units to sales floor`
          });
        } else {
          // Direct receipt to sales floor
          productMovementRecords.push({
            product: product._id,
            type: 'receipt',
            quantity: salesQuantity,
            toZone: salesZone._id,
            performedBy: admin._id,
            reason: 'Initial sales floor stocking',
            reference: `Initial stocking of ${product.name} to sales floor`
          });
        }

        // Update zone occupancy
        await Zone.findByIdAndUpdate(
          salesZone._id,
          { $inc: { currentOccupancy: salesQuantity } }
        );

        // Create low stock alert if quantity is low
        if (salesQuantity <= 3) {
          inventoryAlertRecords.push({
            type: 'low_stock',
            productId: product._id,
            zoneId: salesZone._id,
            message: `Low stock of "${product.name}" in sales zone "${salesZone.name}"`,
            level: 'info',
            isResolved: false
          });
        }
      }

      // 3. Some products in pickup zone (10% chance - representing reserved items)
      if (pickupZones.length > 0 && faker.datatype.boolean(0.1)) {
        const pickupZone = getRandomElement(pickupZones);
        const pickupQuantity = faker.number.int({ min: 1, max: 3 });
        
        // Create zone product record
        const pickupZoneProduct = {
          zone: pickupZone._id,
          product: product._id,
          quantity: pickupQuantity,
          status: 'reserved', // These are reserved for pickup
          lastUpdated: {
            by: admin._id,
            reason: 'Reserved for customer pickup'
          }
        };

        zoneProductRecords.push(pickupZoneProduct);

        // Create movement record
        if (warehouseZones.length > 0) {
          const sourceWarehouse = getRandomElement(warehouseZones);
          
          productMovementRecords.push({
            product: product._id,
            type: 'transfer',
            quantity: pickupQuantity,
            fromZone: sourceWarehouse._id,
            toZone: pickupZone._id,
            performedBy: admin._id,
            reason: 'Reserved for pickup',
            reference: `Reserving ${pickupQuantity} units for customer pickup`
          });
        } else {
          productMovementRecords.push({
            product: product._id,
            type: 'receipt',
            quantity: pickupQuantity,
            toZone: pickupZone._id,
            performedBy: admin._id,
            reason: 'Reserved for pickup',
            reference: `Reserving ${pickupQuantity} units for customer pickup`
          });
        }

        // Update zone occupancy
        await Zone.findByIdAndUpdate(
          pickupZone._id,
          { $inc: { currentOccupancy: pickupQuantity } }
        );

        // Create alert for uncollected orders (50% chance)
        if (faker.datatype.boolean(0.5)) {
          inventoryAlertRecords.push({
            type: 'uncollected_order',
            productId: product._id,
            zoneId: pickupZone._id,
            message: `Order containing "${product.name}" has been uncollected for over 3 days`,
            level: 'warning',
            isResolved: false
          });
        }
      }
    }

    // Create the zone product records in batch
    await ZoneProduct.insertMany(zoneProductRecords);
    await ProductMovement.insertMany(productMovementRecords);
    await InventoryAlert.insertMany(inventoryAlertRecords);

    console.log('Database initialization completed successfully!');
    console.log('Stats:');
    console.log(`- ZoneProduct records: ${zoneProductRecords.length}`);
    console.log(`- Movement records: ${productMovementRecords.length}`);
    console.log(`- Alert records: ${inventoryAlertRecords.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Run the initialization
initZoneProducts(); 