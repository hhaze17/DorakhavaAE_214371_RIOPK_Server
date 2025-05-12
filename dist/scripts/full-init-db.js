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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const faker_1 = require("@faker-js/faker");
const ru_1 = require("@faker-js/faker/locale/ru");
// Импорт моделей
const Product_1 = __importDefault(require("../models/Product"));
const Zone_1 = __importDefault(require("../models/Zone"));
const User_1 = __importDefault(require("../models/User"));
const Batch_1 = __importDefault(require("../models/Batch"));
const ProductMovement_1 = __importDefault(require("../models/ProductMovement"));
const OnlineOrder_1 = __importDefault(require("../models/OnlineOrder"));
// ... (сюда будут добавлены все вспомогательные функции и генерация данных, аналогично init-db, но с учетом всех новых связей и требований ТЗ)
// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomElements = (arr, count) => [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
// === ГЕНЕРАЦИЯ ДАННЫХ ===
const USERS_COUNT = 30;
const PRODUCTS_COUNT = 30;
const BATCHES_COUNT = 40;
const ORDERS_COUNT = 15;
function createZones() {
    return __awaiter(this, void 0, void 0, function* () {
        const zones = [
            { name: 'Торговый зал Центральный', type: 'sales', capacity: 500, currentOccupancy: 280, temperature: 22, humidity: 45, status: 'active', salesZoneConfig: { minStockThreshold: 5, isPromoZone: false, displayPriority: 1, visibleToCustomer: true } },
            { name: 'Торговый зал Электроника', type: 'sales', capacity: 300, currentOccupancy: 150, temperature: 21, humidity: 40, status: 'active', salesZoneConfig: { minStockThreshold: 3, isPromoZone: false, displayPriority: 2, visibleToCustomer: true } },
            { name: 'Промо-зона Акций', type: 'sales', capacity: 120, currentOccupancy: 85, temperature: 22, humidity: 45, status: 'active', salesZoneConfig: { minStockThreshold: 2, isPromoZone: true, promotionEndDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), displayPriority: 1, visibleToCustomer: true } },
            { name: 'Основной склад', type: 'warehouse', capacity: 2000, currentOccupancy: 1450, temperature: 18, humidity: 50, status: 'active', warehouseConfig: { temperatureMonitored: true, storageConditions: { specialRequirements: 'Нет особых требований' }, fifoEnabled: true, zonePartition: 'Общее хранение', allowMixedProducts: true } },
            { name: 'Склад электроники', type: 'warehouse', capacity: 800, currentOccupancy: 350, temperature: 20, humidity: 35, status: 'active', warehouseConfig: { temperatureMonitored: true, storageConditions: { specialRequirements: 'Низкая влажность' }, fifoEnabled: true, zonePartition: 'Электроника', allowMixedProducts: true } },
            { name: 'Холодильный склад', type: 'warehouse', capacity: 500, currentOccupancy: 230, temperature: 4, humidity: 65, status: 'active', warehouseConfig: { temperatureMonitored: true, storageConditions: { specialRequirements: 'Температура 2-6°C' }, fifoEnabled: true, zonePartition: 'Охлаждённые продукты', allowMixedProducts: false } },
            { name: 'Морозильный склад', type: 'warehouse', capacity: 300, currentOccupancy: 180, temperature: -18, humidity: 60, status: 'active', warehouseConfig: { temperatureMonitored: true, storageConditions: { specialRequirements: 'Температура -20°C до -16°C' }, fifoEnabled: true, zonePartition: 'Замороженные продукты', allowMixedProducts: false } },
            { name: 'Зона приемки Центральная', type: 'receiving', capacity: 300, currentOccupancy: 85, temperature: 20, humidity: 55, status: 'active', receivingConfig: { hasQualityControl: true, maxDailyCapacity: 500, requiresInspection: true, supplierVerification: true, tempStorageDuration: 24 } },
            { name: 'Кассовая зона Центральная', type: 'cashier', capacity: 100, currentOccupancy: 35, temperature: 22, humidity: 45, status: 'active', cashierConfig: { hasReturnsProcessing: true, hasExpressCheckout: true, realTimeInventoryUpdate: true, allowPartialReturn: true } },
            { name: 'Зона возвратов', type: 'returns', capacity: 200, currentOccupancy: 75, temperature: 20, humidity: 50, status: 'active', returnsConfig: { requiresInspection: true, maxStorageDays: 30, allowReselling: true, defectCategories: ['minor', 'major', 'critical'], quarantinePeriod: 7 } },
            { name: 'Зона выдачи заказов №1', type: 'pickup', capacity: 150, currentOccupancy: 60, temperature: 21, humidity: 45, status: 'active', pickupConfig: { maxWaitingTime: 48, requiresIdentification: true, notificationEnabled: true, reservationDuration: 72, statusTracking: true } }
        ];
        return yield Zone_1.default.create(zones);
    });
}
function createUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const passwordHash = yield bcryptjs_1.default.hash('123456', 10);
        const now = new Date();
        const users = [
            { username: 'admin', password: passwordHash, firstName: 'Админ', lastName: 'Главный', name: 'Админ Главный', email: 'admin@warehouse.by', contactNumber: '+375291234567', address: 'г. Минск, ул. Независимости, д. 1', birthDate: new Date(1980, 1, 1), levelOfAccess: 'Администратор', isActive: true, createdAt: now, updatedAt: now },
            { username: 'employee', password: passwordHash, firstName: 'Сотрудник', lastName: 'Иванов', name: 'Сотрудник Иванов', email: 'employee@warehouse.by', contactNumber: '+375291112233', address: 'г. Минск, ул. Пушкина, д. 2', birthDate: new Date(1990, 5, 15), levelOfAccess: 'Сотрудник', isActive: true, createdAt: now, updatedAt: now },
            { username: 'client', password: passwordHash, firstName: 'Клиент', lastName: 'Петров', name: 'Клиент Петров', email: 'client@warehouse.by', contactNumber: '+375292223344', address: 'г. Минск, ул. Якуба Коласа, д. 3', birthDate: new Date(1995, 10, 20), levelOfAccess: 'Клиент', isActive: true, createdAt: now, updatedAt: now }
        ];
        for (let i = 0; i < USERS_COUNT - 3; i++) {
            const firstName = ru_1.faker.person.firstName();
            const lastName = ru_1.faker.person.lastName();
            users.push({
                username: ru_1.faker.internet.userName().toLowerCase(),
                password: passwordHash,
                firstName,
                lastName,
                name: `${firstName} ${lastName}`,
                email: ru_1.faker.internet.email(),
                contactNumber: ru_1.faker.phone.number('+37529#######'),
                address: `г. ${ru_1.faker.location.city()}, ул. ${ru_1.faker.location.street()}, д. ${ru_1.faker.number.int({ min: 1, max: 100 })}`,
                birthDate: ru_1.faker.date.birthdate({ min: 1970, max: 2003, mode: 'year' }),
                levelOfAccess: i % 3 === 0 ? 'Администратор' : (i % 3 === 1 ? 'Сотрудник' : 'Клиент'),
                isActive: true,
                createdAt: ru_1.faker.date.past(),
                updatedAt: now
            });
        }
        return yield User_1.default.create(users);
    });
}
function createProducts(zones) {
    return __awaiter(this, void 0, void 0, function* () {
        // Белорусские категории и бренды
        const categories = ['Молочные продукты', 'Мясо и колбасы', 'Хлеб и выпечка', 'Овощи и фрукты', 'Кондитерские изделия', 'Безалкогольные напитки', 'Бытовая химия', 'Одежда', 'Обувь', 'Электроника'];
        const brands = ['Савушкин продукт', 'Беллакт', 'Коммунарка', 'Спартак', 'Милавица', 'Белита', 'Санта Бремор', 'Брест-Литовск', 'Бабушкина крынка', 'Минский молочный завод', 'Горизонт', 'Атлант', 'БелАЗ', 'Беларуськалий'];
        const products = [];
        let productIdCounter = 10001;
        // Группируем зоны по типу
        const salesZones = zones.filter((z) => z.type === 'sales');
        const warehouseZones = zones.filter((z) => z.type === 'warehouse');
        for (let i = 0; i < PRODUCTS_COUNT; i++) {
            const category = getRandomElement(categories);
            const brand = getRandomElement(brands);
            let zone;
            // Логика распределения по зонам
            if (['Молочные продукты', 'Мясо и колбасы', 'Овощи и фрукты'].includes(category)) {
                // Холодильный или обычный склад
                const coldZones = warehouseZones.filter(z => z.temperature !== undefined && z.temperature <= 8);
                zone = coldZones.length ? getRandomElement(coldZones) : getRandomElement(warehouseZones);
            }
            else if (['Электроника', 'Одежда', 'Обувь'].includes(category)) {
                // Электроника и одежда — в торговый зал или склад
                zone = Math.random() > 0.5 ? getRandomElement(salesZones) : getRandomElement(warehouseZones);
            }
            else {
                // Остальные — в торговый зал
                zone = getRandomElement(salesZones);
            }
            if (!zone || !zone._id) {
                throw new Error('Не удалось определить зону для продукта!');
            }
            const price = Math.floor(Math.random() * 80) * 1.2 + 2; // BYN, реалистичнее
            const productModel = `${brand} ${ru_1.faker.string.alphanumeric(4).toUpperCase()}`;
            const product = {
                productId: (productIdCounter++).toString(),
                name: `${category} ${ru_1.faker.commerce.product()}`,
                description: ru_1.faker.commerce.productDescription(),
                brandName: brand,
                productModel,
                model: productModel,
                category,
                price,
                pricePerUnit: `${price.toFixed(2)} BYN`,
                quantity: Math.floor(Math.random() * 100) + 10,
                zone: zone._id,
                storageConditions: {
                    temperature: zone.temperature,
                    humidity: zone.humidity,
                    lightSensitive: Math.random() > 0.7
                },
                batchInfo: {
                    batchNumber: 'B' + ru_1.faker.string.numeric(6),
                    manufacturingDate: randomDate(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
                    expiryDate: randomDate(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))
                },
                status: Math.random() > 0.1 ? 'active' : 'inactive',
                isPromotion: Math.random() > 0.8,
                promotionEndDate: Math.random() > 0.8 ? randomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) : undefined
            };
            products.push(product);
        }
        const created = yield Product_1.default.create(products);
        return created;
    });
}
function createBatches(products, zones) {
    return __awaiter(this, void 0, void 0, function* () {
        const batches = [];
        for (let i = 0; i < BATCHES_COUNT; i++) {
            const product = getRandomElement(products);
            const zone = getRandomElement(zones.filter((z) => z.type === 'warehouse')) || getRandomElement(zones);
            const batch = {
                product: product._id,
                batchNumber: 'B' + faker_1.faker.string.numeric(6),
                quantity: Math.floor(Math.random() * 50) + 10,
                manufacturingDate: randomDate(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
                expiryDate: randomDate(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
                zone: zone._id,
                status: Math.random() > 0.1 ? 'active' : 'expired',
                supplier: { name: faker_1.faker.company.name(), contact: faker_1.faker.phone.number() },
                purchasePrice: Math.floor(Math.random() * 500) + 50,
                notes: Math.random() > 0.8 ? faker_1.faker.lorem.sentence() : undefined
            };
            batches.push(batch);
        }
        const created = yield Batch_1.default.create(batches);
        return created;
    });
}
function createProductMovements(batches, zones, users) {
    return __awaiter(this, void 0, void 0, function* () {
        const types = ['receipt', 'transfer', 'sale', 'return', 'adjustment', 'writeoff', 'online_order', 'pickup', 'expired'];
        const movements = [];
        for (const batch of batches) {
            const product = batch.product;
            const fromZone = getRandomElement(zones);
            const toZone = getRandomElement(zones);
            const type = getRandomElement(types);
            const user = getRandomElement(users);
            movements.push({
                product,
                batch: batch._id,
                type,
                quantity: Math.floor(Math.random() * batch.quantity) + 1,
                fromZone: fromZone._id,
                toZone: toZone._id,
                performedBy: user._id,
                reason: faker_1.faker.lorem.words(3),
                expiryDate: batch.expiryDate
            });
        }
        yield ProductMovement_1.default.create(movements);
    });
}
function createOnlineOrders(products, zones, users) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const pickupZones = zones.filter((z) => z.type === 'pickup');
        const clients = users.filter((u) => u.levelOfAccess === 'Клиент');
        const validProducts = products.filter(p => typeof p.price === 'number' && !isNaN(p.price) && p.price >= 0);
        for (let i = 0; i < ORDERS_COUNT; i++) {
            const client = getRandomElement(clients);
            // Выбираем только продукты с валидной ценой
            const orderProducts = getRandomElements(validProducts, Math.floor(Math.random() * 3) + 1);
            const items = orderProducts.map((product) => {
                const quantity = Math.floor(Math.random() * 3) + 1;
                return {
                    product: product._id,
                    quantity,
                    price: product.price,
                    // batch и zone можно добавить, если нужно
                };
            });
            // Если нет валидных товаров — пропускаем заказ
            if (!items.length)
                continue;
            // Сумма заказа
            const totalAmount = items.reduce((sum, item) => {
                if (typeof item.price === 'number' && typeof item.quantity === 'number' && !isNaN(item.price) && !isNaN(item.quantity)) {
                    return sum + item.price * item.quantity;
                }
                return sum;
            }, 0);
            // Если сумма невалидна — пропускаем заказ
            if (!isFinite(totalAmount) || isNaN(totalAmount))
                continue;
            yield OnlineOrder_1.default.create({
                orderNumber: 'ORD-' + faker_1.faker.string.numeric(6),
                client: client._id,
                items,
                totalAmount,
                status: getRandomElement(['pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled']),
                pickupZone: (_a = getRandomElement(pickupZones)) === null || _a === void 0 ? void 0 : _a._id,
                pickupTime: randomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
                paymentStatus: getRandomElement(['pending', 'paid', 'failed', 'refunded']),
                paymentMethod: getRandomElement(['card', 'cash', 'transfer']), // обязательно!
                reservedProducts: items.map((item) => item.product),
                notes: Math.random() > 0.7 ? faker_1.faker.lorem.sentence() : undefined
            });
        }
    });
}
// === ОСНОВНОЙ БЛОК ===
const fullInitDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        mongoose_1.default.set('strictQuery', false);
        yield mongoose_1.default.connect('mongodb://localhost:27017/warehouse2');
        console.log('Connected to database successfully ✅');
        yield User_1.default.deleteMany({});
        yield Product_1.default.deleteMany({});
        yield Zone_1.default.deleteMany({});
        yield Batch_1.default.deleteMany({});
        yield ProductMovement_1.default.deleteMany({});
        yield OnlineOrder_1.default.deleteMany({});
        const users = yield createUsers();
        const zones = yield createZones();
        const products = yield createProducts(zones);
        const batches = yield createBatches(products, zones);
        yield createProductMovements(batches, zones, users);
        yield createOnlineOrders(products, zones, users);
        console.log(`\n=== СТАТИСТИКА ===`);
        console.log(`Пользователи: ${yield User_1.default.countDocuments()}`);
        console.log(`Зоны: ${yield Zone_1.default.countDocuments()}`);
        console.log(`Товары: ${yield Product_1.default.countDocuments()}`);
        console.log(`Партии: ${yield Batch_1.default.countDocuments()}`);
        console.log(`Движения: ${yield ProductMovement_1.default.countDocuments()}`);
        console.log(`Онлайн-заказы: ${yield OnlineOrder_1.default.countDocuments()}`);
        console.log('\n=== БАЗА ДАННЫХ УСПЕШНО ИНИЦИАЛИЗИРОВАНА! ===\n');
        process.exit(0);
    }
    catch (error) {
        console.error('Ошибка инициализации базы данных ❌', error);
        process.exit(1);
    }
});
fullInitDatabase();
