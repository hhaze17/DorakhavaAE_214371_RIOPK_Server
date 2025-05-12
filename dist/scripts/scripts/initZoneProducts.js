"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var dotenv_1 = require("dotenv");
var faker_1 = require("@faker-js/faker");
// Load environment variables
dotenv_1.default.config();
// MongoDB connection
var MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/warehouse2";
// Import models
require("../models/User");
require("../models/Product");
require("../models/Zone");
require("../models/ZoneProduct");
require("../models/InventoryAlert");
require("../models/ProductMovement");
// Get model references
var User = mongoose_1.default.model('User');
var Product = mongoose_1.default.model('Product');
var Zone = mongoose_1.default.model('Zone');
var ZoneProduct = mongoose_1.default.model('ZoneProduct');
var InventoryAlert = mongoose_1.default.model('InventoryAlert');
var ProductMovement = mongoose_1.default.model('ProductMovement');
// Helper function to get random element from array
var getRandomElement = function (array) {
    return array[Math.floor(Math.random() * array.length)];
};
// Helper function to get random elements from array
var getRandomElements = function (array, count) {
    var shuffled = __spreadArray([], array, true).sort(function () { return 0.5 - Math.random(); });
    return shuffled.slice(0, count);
};
// Initialize database with ZoneProduct data
var initZoneProducts = function () { return __awaiter(void 0, void 0, void 0, function () {
    var products, zones, admin, salesZones, warehouseZones, receivingZones, pickupZones, zoneProductRecords, productMovementRecords, inventoryAlertRecords, _i, products_1, product, warehouseZone, warehouseQuantity, hasExpiry, expiryDate, today, isNearExpiry, today, warehouseZoneProduct, salesZone, salesQuantity, isPromotion, promotionEndDate, today, salesZoneProduct, sourceWarehouse, pickupZone, pickupQuantity, pickupZoneProduct, sourceWarehouse, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 19, , 20]);
                console.log('Connecting to MongoDB...');
                return [4 /*yield*/, mongoose_1.default.connect(MONGODB_URL)];
            case 1:
                _a.sent();
                console.log('Connected to MongoDB!');
                // Clear existing ZoneProduct data
                console.log('Clearing existing ZoneProduct data...');
                return [4 /*yield*/, ZoneProduct.deleteMany({})];
            case 2:
                _a.sent();
                return [4 /*yield*/, ProductMovement.deleteMany({ type: { $in: ['receipt', 'transfer'] } })];
            case 3:
                _a.sent();
                return [4 /*yield*/, InventoryAlert.deleteMany({})];
            case 4:
                _a.sent();
                return [4 /*yield*/, Product.find({})];
            case 5:
                products = _a.sent();
                return [4 /*yield*/, Zone.find({})];
            case 6:
                zones = _a.sent();
                return [4 /*yield*/, User.findOne({ username: 'admin' })];
            case 7:
                admin = _a.sent();
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
                salesZones = zones.filter(function (z) { return z.type === 'sales'; });
                warehouseZones = zones.filter(function (z) { return z.type === 'warehouse'; });
                receivingZones = zones.filter(function (z) { return z.type === 'receiving'; });
                pickupZones = zones.filter(function (z) { return z.type === 'pickup'; });
                zoneProductRecords = [];
                productMovementRecords = [];
                inventoryAlertRecords = [];
                _i = 0, products_1 = products;
                _a.label = 8;
            case 8:
                if (!(_i < products_1.length)) return [3 /*break*/, 15];
                product = products_1[_i];
                if (!(warehouseZones.length > 0)) return [3 /*break*/, 10];
                warehouseZone = getRandomElement(warehouseZones);
                warehouseQuantity = faker_1.faker.number.int({ min: 5, max: 100 });
                hasExpiry = faker_1.faker.datatype.boolean(0.7);
                expiryDate = undefined;
                if (hasExpiry) {
                    today = new Date();
                    // Random expiry from 1 month to 2 years in the future
                    expiryDate = faker_1.faker.date.between({
                        from: new Date(today.setMonth(today.getMonth() + 1)),
                        to: new Date(today.setFullYear(today.getFullYear() + 2))
                    });
                }
                isNearExpiry = faker_1.faker.datatype.boolean(0.15);
                if (isNearExpiry && hasExpiry) {
                    today = new Date();
                    expiryDate = faker_1.faker.date.between({
                        from: today,
                        to: new Date(today.setDate(today.getDate() + 7))
                    });
                }
                warehouseZoneProduct = {
                    zone: warehouseZone._id,
                    product: product._id,
                    quantity: warehouseQuantity,
                    status: 'available',
                    expiryDate: expiryDate,
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
                    reference: "Initial stocking of ".concat(product.name)
                });
                // Update zone occupancy
                return [4 /*yield*/, Zone.findByIdAndUpdate(warehouseZone._id, { $inc: { currentOccupancy: warehouseQuantity } })];
            case 9:
                // Update zone occupancy
                _a.sent();
                // Create inventory alert for near-expiry products
                if (isNearExpiry && expiryDate) {
                    inventoryAlertRecords.push({
                        type: 'expiring_soon',
                        productId: product._id,
                        zoneId: warehouseZone._id,
                        message: "Product \"".concat(product.name, "\" in zone \"").concat(warehouseZone.name, "\" expires on ").concat(expiryDate.toLocaleDateString()),
                        level: 'warning',
                        isResolved: false
                    });
                }
                _a.label = 10;
            case 10:
                if (!(salesZones.length > 0 && faker_1.faker.datatype.boolean(0.5))) return [3 /*break*/, 12];
                salesZone = getRandomElement(salesZones);
                salesQuantity = faker_1.faker.number.int({ min: 1, max: 20 });
                isPromotion = faker_1.faker.datatype.boolean(0.3);
                promotionEndDate = undefined;
                if (isPromotion) {
                    today = new Date();
                    promotionEndDate = faker_1.faker.date.between({
                        from: new Date(today.setDate(today.getDate() + 1)),
                        to: new Date(today.setDate(today.getDate() + 30))
                    });
                }
                salesZoneProduct = {
                    zone: salesZone._id,
                    product: product._id,
                    quantity: salesQuantity,
                    status: 'available',
                    isPromotion: isPromotion,
                    promotionEndDate: promotionEndDate,
                    lastUpdated: {
                        by: admin._id,
                        reason: isPromotion ? 'Initial promotion setup' : 'Initial sales floor stocking'
                    }
                };
                zoneProductRecords.push(salesZoneProduct);
                // Create movement record (transfer from warehouse to sales)
                if (warehouseZones.length > 0) {
                    sourceWarehouse = getRandomElement(warehouseZones);
                    productMovementRecords.push({
                        product: product._id,
                        type: 'transfer',
                        quantity: salesQuantity,
                        fromZone: sourceWarehouse._id,
                        toZone: salesZone._id,
                        performedBy: admin._id,
                        reason: 'Transfer to sales floor',
                        reference: "Moving ".concat(salesQuantity, " units to sales floor")
                    });
                }
                else {
                    // Direct receipt to sales floor
                    productMovementRecords.push({
                        product: product._id,
                        type: 'receipt',
                        quantity: salesQuantity,
                        toZone: salesZone._id,
                        performedBy: admin._id,
                        reason: 'Initial sales floor stocking',
                        reference: "Initial stocking of ".concat(product.name, " to sales floor")
                    });
                }
                // Update zone occupancy
                return [4 /*yield*/, Zone.findByIdAndUpdate(salesZone._id, { $inc: { currentOccupancy: salesQuantity } })];
            case 11:
                // Update zone occupancy
                _a.sent();
                // Create low stock alert if quantity is low
                if (salesQuantity <= 3) {
                    inventoryAlertRecords.push({
                        type: 'low_stock',
                        productId: product._id,
                        zoneId: salesZone._id,
                        message: "Low stock of \"".concat(product.name, "\" in sales zone \"").concat(salesZone.name, "\""),
                        level: 'info',
                        isResolved: false
                    });
                }
                _a.label = 12;
            case 12:
                if (!(pickupZones.length > 0 && faker_1.faker.datatype.boolean(0.1))) return [3 /*break*/, 14];
                pickupZone = getRandomElement(pickupZones);
                pickupQuantity = faker_1.faker.number.int({ min: 1, max: 3 });
                pickupZoneProduct = {
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
                    sourceWarehouse = getRandomElement(warehouseZones);
                    productMovementRecords.push({
                        product: product._id,
                        type: 'transfer',
                        quantity: pickupQuantity,
                        fromZone: sourceWarehouse._id,
                        toZone: pickupZone._id,
                        performedBy: admin._id,
                        reason: 'Reserved for pickup',
                        reference: "Reserving ".concat(pickupQuantity, " units for customer pickup")
                    });
                }
                else {
                    productMovementRecords.push({
                        product: product._id,
                        type: 'receipt',
                        quantity: pickupQuantity,
                        toZone: pickupZone._id,
                        performedBy: admin._id,
                        reason: 'Reserved for pickup',
                        reference: "Reserving ".concat(pickupQuantity, " units for customer pickup")
                    });
                }
                // Update zone occupancy
                return [4 /*yield*/, Zone.findByIdAndUpdate(pickupZone._id, { $inc: { currentOccupancy: pickupQuantity } })];
            case 13:
                // Update zone occupancy
                _a.sent();
                // Create alert for uncollected orders (50% chance)
                if (faker_1.faker.datatype.boolean(0.5)) {
                    inventoryAlertRecords.push({
                        type: 'uncollected_order',
                        productId: product._id,
                        zoneId: pickupZone._id,
                        message: "Order containing \"".concat(product.name, "\" has been uncollected for over 3 days"),
                        level: 'warning',
                        isResolved: false
                    });
                }
                _a.label = 14;
            case 14:
                _i++;
                return [3 /*break*/, 8];
            case 15: 
            // Create the zone product records in batch
            return [4 /*yield*/, ZoneProduct.insertMany(zoneProductRecords)];
            case 16:
                // Create the zone product records in batch
                _a.sent();
                return [4 /*yield*/, ProductMovement.insertMany(productMovementRecords)];
            case 17:
                _a.sent();
                return [4 /*yield*/, InventoryAlert.insertMany(inventoryAlertRecords)];
            case 18:
                _a.sent();
                console.log('Database initialization completed successfully!');
                console.log('Stats:');
                console.log("- ZoneProduct records: ".concat(zoneProductRecords.length));
                console.log("- Movement records: ".concat(productMovementRecords.length));
                console.log("- Alert records: ".concat(inventoryAlertRecords.length));
                process.exit(0);
                return [3 /*break*/, 20];
            case 19:
                error_1 = _a.sent();
                console.error('Error initializing database:', error_1);
                process.exit(1);
                return [3 /*break*/, 20];
            case 20: return [2 /*return*/];
        }
    });
}); };
// Run the initialization
initZoneProducts();
