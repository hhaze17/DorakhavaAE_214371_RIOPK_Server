import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

// MongoDB connection
const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/warehouse2";

// Models import
import '../models/User';
import '../models/Product';
import '../models/Zone';
import '../models/Batch';
import '../models/ProductMovement';
import '../models/OnlineOrder';

// Get model references
const User = mongoose.model('User');
const Product = mongoose.model('Product');
const Zone = mongoose.model('Zone');
const Batch = mongoose.model('Batch');
const ProductMovement = mongoose.model('ProductMovement');
const OnlineOrder = mongoose.model('OnlineOrder');

// Configuration
const USERS_COUNT = 50;
const PRODUCTS_COUNT = 200;
const ZONES_COUNT = 20;
const BATCHES_COUNT = 300;
const MOVEMENTS_COUNT = 500;
const ORDERS_COUNT = 100;

// Helper function to generate a random date between two dates
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to get random element from array
const getRandomElement = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

// Helper function to get multiple random elements from array
const getRandomElements = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Initialize database with sample data
const initDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to MongoDB!');

    // Clear all collections first
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Zone.deleteMany({});
    await Batch.deleteMany({});
    await ProductMovement.deleteMany({});
    await OnlineOrder.deleteMany({});

    console.log('Creating users...');
    // Create admin user first
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@warehouse.com',
      password: adminPassword,
      contactNumber: faker.phone.number('+7 ### ### ## ##'),
      address: 'Главный офис',
      levelOfAccess: 'Администратор',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create regular users
    const users = await Promise.all(
      Array.from({ length: USERS_COUNT - 1 }).map(async (_, index) => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const username = faker.internet.userName({ firstName, lastName }).toLowerCase();
        const password = await bcrypt.hash('password123', 10);
        
        const levelOfAccess = getRandomElement([
          'Администратор', 
          'Сотрудник', 
          'Клиент'
        ]);

        return User.create({
          username,
          firstName,
          lastName,
          email: faker.internet.email({ firstName, lastName }),
          password,
          contactNumber: faker.phone.number('+7 ### ### ## ##'),
          address: faker.location.streetAddress(),
          levelOfAccess,
          birthDate: randomDate(new Date(1970, 0, 1), new Date(2000, 0, 1)),
          createdAt: faker.date.past(),
          updatedAt: new Date()
        });
      })
    );
    users.push(admin);

    console.log('Creating zones...');
    // Create zones (different types)
    const zoneTypes = ['sales', 'warehouse', 'receiving', 'cashier', 'returns', 'pickup'];
    const zones = await Promise.all(
      Array.from({ length: ZONES_COUNT }).map((_, index) => {
        const type = zoneTypes[index % zoneTypes.length];
        const name = `${type.charAt(0).toUpperCase() + type.slice(1)} Zone ${Math.floor(index / zoneTypes.length) + 1}`;
        
        const zoneData: any = {
          name,
          type,
          capacity: faker.number.int({ min: 500, max: 10000 }),
          currentOccupancy: 0, // Will be updated later
          temperature: faker.number.int({ min: 15, max: 25 }),
          humidity: faker.number.int({ min: 30, max: 60 }),
          status: getRandomElement(['active', 'inactive', 'maintenance']),
          createdAt: faker.date.past(),
          updatedAt: new Date()
        };

        // Add type-specific configurations
        if (type === 'sales') {
          zoneData.salesZoneConfig = {
            minStockThreshold: faker.number.int({ min: 3, max: 10 }),
            isPromoZone: faker.datatype.boolean()
          };
        } else if (type === 'warehouse') {
          zoneData.warehouseConfig = {
            storageConditions: {
              specialRequirements: faker.helpers.arrayElement([
                'Хранить в сухом месте',
                'Хранить в прохладном месте',
                'Не допускать прямых солнечных лучей',
                null
              ])
            },
            fifoEnabled: faker.datatype.boolean()
          };
        } else if (type === 'receiving') {
          zoneData.receivingConfig = {
            hasQualityControl: faker.datatype.boolean(),
            maxDailyCapacity: faker.number.int({ min: 500, max: 2000 })
          };
        } else if (type === 'cashier') {
          zoneData.cashierConfig = {
            hasReturnsProcessing: faker.datatype.boolean(),
            hasExpressCheckout: faker.datatype.boolean()
          };
        } else if (type === 'returns') {
          zoneData.returnsConfig = {
            requiresInspection: faker.datatype.boolean(),
            maxStorageDays: faker.number.int({ min: 7, max: 30 })
          };
        } else if (type === 'pickup') {
          zoneData.pickupConfig = {
            maxWaitingTime: faker.number.int({ min: 24, max: 72 }),
            requiresIdentification: faker.datatype.boolean()
          };
        }

        return Zone.create(zoneData);
      })
    );

    console.log('Creating products...');
    // Create products
    const productCategories = [
      'Электроника', 'Бытовая техника', 'Продукты питания', 
      'Одежда', 'Обувь', 'Мебель', 'Инструменты', 'Спорттовары',
      'Товары для дома', 'Канцтовары', 'Игрушки', 'Косметика'
    ];

    const products = await Promise.all(
      Array.from({ length: PRODUCTS_COUNT }).map((_, index) => {
        const name = `${getRandomElement(productCategories)} ${faker.commerce.productName()}`;
        const salesZones = zones.filter(z => z.type === 'sales');
        const warehouseZones = zones.filter(z => z.type === 'warehouse');
        
        return Product.create({
          name,
          description: faker.commerce.productDescription(),
          category: getRandomElement(productCategories),
          price: faker.number.float({ min: 100, max: 50000, precision: 0.01 }),
          quantity: 0, // Will be updated based on batches
          zone: getRandomElement(salesZones.concat(warehouseZones))._id,
          status: getRandomElement(['active', 'inactive', 'discontinued']),
          sku: faker.string.alphanumeric(8).toUpperCase(),
          manufacturer: faker.company.name(),
          weight: faker.number.float({ min: 0.1, max: 100, precision: 0.01 }),
          dimensions: {
            length: faker.number.float({ min: 5, max: 200, precision: 0.1 }),
            width: faker.number.float({ min: 5, max: 200, precision: 0.1 }),
            height: faker.number.float({ min: 5, max: 200, precision: 0.1 })
          },
          createdAt: faker.date.past(),
          updatedAt: new Date()
        });
      })
    );

    console.log('Creating batches...');
    // Create batches for products
    const batches = await Promise.all(
      Array.from({ length: BATCHES_COUNT }).map(async (_, index) => {
        const product = getRandomElement(products);
        const warehouseZones = zones.filter(z => z.type === 'warehouse');
        const zone = getRandomElement(warehouseZones);
        const quantity = faker.number.int({ min: 10, max: 500 });
        
        // Update product quantity
        await Product.findByIdAndUpdate(
          product._id,
          { $inc: { quantity: quantity } }
        );
        
        // Update zone occupancy
        await Zone.findByIdAndUpdate(
          zone._id,
          { $inc: { currentOccupancy: quantity } }
        );
        
        const manufacturingDate = faker.date.past();
        const expiryDate = new Date(manufacturingDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 2); // 2 years expiry
        
        return Batch.create({
          batchNumber: faker.string.alphanumeric(10).toUpperCase(),
          product: product._id,
          quantity,
          manufacturingDate,
          expiryDate,
          supplierName: faker.company.name(),
          supplierContact: faker.phone.number(),
          zone: zone._id,
          quality: getRandomElement(['A', 'B', 'C']),
          notes: faker.datatype.boolean() ? faker.lorem.sentence() : '',
          createdAt: faker.date.past(),
          updatedAt: new Date()
        });
      })
    );

    console.log('Creating product movements...');
    // Create product movements
    const movementTypes = ['receipt', 'transfer', 'sale', 'return', 'adjustment', 'online_order', 'pickup', 'expired'];
    
    const productMovements = await Promise.all(
      Array.from({ length: MOVEMENTS_COUNT }).map(async (_, index) => {
        const batch = getRandomElement(batches);
        const type = getRandomElement(movementTypes);
        const quantity = faker.number.int({ min: 1, max: Math.min(50, batch.quantity) });
        
        // Determine from and to zones based on movement type
        let fromZone, toZone;
        
        if (type === 'receipt') {
          fromZone = getRandomElement(zones.filter(z => z.type === 'receiving'))._id;
          toZone = getRandomElement(zones.filter(z => z.type === 'warehouse'))._id;
        } else if (type === 'transfer') {
          fromZone = getRandomElement(zones)._id;
          // Make sure to and from zones are different
          do {
            toZone = getRandomElement(zones)._id;
          } while (toZone.toString() === fromZone.toString());
        } else if (type === 'sale') {
          fromZone = getRandomElement(zones.filter(z => z.type === 'sales'))._id;
          toZone = null;
        } else if (type === 'return') {
          fromZone = getRandomElement(zones.filter(z => z.type === 'cashier'))._id;
          toZone = getRandomElement(zones.filter(z => z.type === 'returns'))._id;
        } else if (type === 'online_order') {
          fromZone = getRandomElement(zones.filter(z => z.type === 'warehouse'))._id;
          toZone = getRandomElement(zones.filter(z => z.type === 'pickup'))._id;
        } else if (type === 'pickup') {
          fromZone = getRandomElement(zones.filter(z => z.type === 'pickup'))._id;
          toZone = null;
        } else if (type === 'expired') {
          fromZone = getRandomElement(zones)._id;
          toZone = null;
        } else {
          fromZone = getRandomElement(zones)._id;
          toZone = getRandomElement(zones)._id;
        }
                
        return ProductMovement.create({
          product: batch.product,
          batch: batch._id,
          type,
          quantity,
          fromZone,
          toZone,
          performedBy: getRandomElement(users)._id,
          reason: faker.lorem.sentence(),
          reference: faker.string.alphanumeric(8).toUpperCase(),
          createdAt: randomDate(new Date(2023, 0, 1), new Date()),
          updatedAt: new Date()
        });
      })
    );

    console.log('Creating online orders...');
    // Create online orders
    const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    const onlineOrders = await Promise.all(
      Array.from({ length: ORDERS_COUNT }).map((_, index) => {
        const customer = getRandomElement(users.filter(u => u.levelOfAccess === 'Клиент'));
        const itemCount = faker.number.int({ min: 1, max: 5 });
        const orderProducts = getRandomElements(products, itemCount);
        
        const items = orderProducts.map(product => ({
          product: product._id,
          productName: product.name,
          quantity: faker.number.int({ min: 1, max: 5 }),
          price: product.price,
          discount: faker.number.float({ min: 0, max: 0.3, precision: 0.01 })
        }));
        
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.2; // 20% tax
        const discount = subtotal * faker.number.float({ min: 0, max: 0.1, precision: 0.01 });
        const total = subtotal + tax - discount;
        
        return OnlineOrder.create({
          orderNumber: `ORD-${faker.string.numeric(6)}`,
          customer: customer._id,
          items,
          subtotal,
          tax,
          discount,
          total,
          paymentMethod: getRandomElement(['credit_card', 'cash', 'online_transfer']),
          status: getRandomElement(orderStatuses),
          pickupZone: getRandomElement(zones.filter(z => z.type === 'pickup'))._id,
          shippingAddress: faker.location.streetAddress(),
          notes: faker.datatype.boolean() ? faker.lorem.sentence() : '',
          estimatedDelivery: faker.date.future(),
          deliveredAt: faker.datatype.boolean() ? faker.date.future() : null,
          createdAt: faker.date.recent(30),
          updatedAt: new Date()
        });
      })
    );

    console.log('Database initialization completed successfully!');
    console.log('Stats:');
    console.log(`- Users: ${USERS_COUNT}`);
    console.log(`- Products: ${PRODUCTS_COUNT}`);
    console.log(`- Zones: ${ZONES_COUNT}`);
    console.log(`- Batches: ${BATCHES_COUNT}`);
    console.log(`- Product Movements: ${MOVEMENTS_COUNT}`);
    console.log(`- Online Orders: ${ORDERS_COUNT}`);
    console.log(`Total records: ${USERS_COUNT + PRODUCTS_COUNT + ZONES_COUNT + BATCHES_COUNT + MOVEMENTS_COUNT + ORDERS_COUNT}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Run the initialization
initDatabase(); 