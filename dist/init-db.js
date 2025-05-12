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
// Initialize all models first
require("./models/index");
// Import models
const Product_1 = __importDefault(require("./models/Product"));
const Zone_1 = __importDefault(require("./models/Zone"));
const User_1 = __importDefault(require("./models/User"));
const Batch_1 = __importDefault(require("./models/Batch"));
const IncomingProduct_1 = __importDefault(require("./models/IncomingProduct"));
const OutgoingProduct_1 = __importDefault(require("./models/OutgoingProduct"));
const Purchase_1 = __importDefault(require("./models/Purchase"));
const Sale_1 = __importDefault(require("./models/Sale"));
const StoreInventory_1 = __importDefault(require("./models/StoreInventory"));
const ReturnedItem_1 = __importDefault(require("./models/ReturnedItem"));
const OrderProduct_1 = __importDefault(require("./models/OrderProduct"));
const DailyAttendance_1 = __importDefault(require("./models/DailyAttendance"));
const StoreIncomingProduct_1 = __importDefault(require("./models/StoreIncomingProduct"));
const Gallery_1 = __importDefault(require("./models/Gallery"));
const BarcodeGenerator_1 = __importDefault(require("./models/BarcodeGenerator"));
const ProductMovement_1 = __importDefault(require("./models/ProductMovement"));
const OnlineOrder_1 = __importDefault(require("./models/OnlineOrder"));
const ExpiryTracking_1 = __importDefault(require("./models/ExpiryTracking"));
const InventoryAlert_1 = __importDefault(require("./models/InventoryAlert"));
const ZoneTransferRequest_1 = __importDefault(require("./models/ZoneTransferRequest"));
// Configuration - увеличим количество данных 
const USERS_COUNT = 100;
const PRODUCTS_COUNT = 20;
const ZONES_COUNT = 30;
const BATCHES_COUNT = 30;
const MOVEMENTS_COUNT = 800;
const ORDERS_COUNT = 150;
const STORES_COUNT = 8;
const ALERTS_COUNT = 50;
const TRANSFER_REQUESTS_COUNT = 100;
// Белорусские города
const BY_CITIES = [
    'Минск', 'Гомель', 'Могилев', 'Витебск', 'Гродно', 'Брест',
    'Бобруйск', 'Барановичи', 'Борисов', 'Пинск', 'Орша', 'Мозырь',
    'Солигорск', 'Новополоцк', 'Лида', 'Молодечно', 'Полоцк', 'Жлобин',
    'Светлогорск', 'Речица', 'Слуцк', 'Жодино', 'Слоним', 'Кобрин'
];
// Белорусские улицы
const BY_STREETS = [
    'ул. Независимости', 'пр. Победителей', 'ул. Немига', 'ул. Ленина',
    'ул. Советская', 'ул. Кирова', 'пр. Машерова', 'ул. Пушкинская',
    'ул. Сурганова', 'ул. Притыцкого', 'ул. Орловская', 'ул. Богдановича',
    'ул. Якуба Коласа', 'ул. Гоголя', 'ул. Карла Маркса', 'ул. Куйбышева',
    'ул. Октябрьская', 'ул. Козлова', 'пр. Дзержинского', 'ул. Тимирязева',
    'ул. Фрунзе', 'ул. Калиновского', 'ул. Скорины', 'ул. Макаенка'
];
// Белорусские компании
const BY_COMPANIES = [
    'Белорусские продукты', 'МТС Беларусь', 'Белтелеком', 'Национальная библиотека',
    'БелАЗ', 'Белвест', 'Марко', 'Атлант', 'Милавица', 'Коммунарка',
    'Спартак', 'Белшина', 'Белоруснефть', 'Гефест', 'Савушкин продукт',
    'МАЗ', 'Белорусский торговый дом', 'Евроопт', 'Белита-Витэкс', 'Санта Бремор',
    'Пинскдрев', 'Горизонт', 'БелОМО', 'Минский тракторный завод', 'Крынiца'
];
// Белорусские магазины
const BY_STORES = [
    'Евроопт', 'Гиппо', 'Корона', 'ProStore', 'Соседи',
    'Виталюр', 'Green', 'Алми', 'Bigzz', 'Санта',
    'Домашний', 'Веста', 'Рублёвский', 'Доброном', 'Белмаркет'
];
// Белорусские доменные имена для email
const BY_DOMAINS = ['tut.by', 'mail.ru', 'gmail.com', 'yandex.by', 'mail.by', 'bsu.by', 'belstu.by', 'bntu.by'];
// Helper function to generate a random date between two dates
const randomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};
// Helper function to get random element from array
const getRandomElement = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
};
// Helper function to get multiple random elements from array
const getRandomElements = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
// Генерация случайного белорусского адреса
const generateBelarusianAddress = () => {
    const city = getRandomElement(BY_CITIES);
    const street = getRandomElement(BY_STREETS);
    const houseNumber = Math.floor(Math.random() * 100) + 1;
    const apartment = Math.floor(Math.random() * 200) + 1;
    return `${city}, ${street}, д. ${houseNumber}, кв. ${apartment}`;
};
// Генерация белорусского номера телефона
const generateBelarusianPhone = () => {
    const operators = ['+375 29', '+375 33', '+375 44', '+375 25'];
    const operator = getRandomElement(operators);
    const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    return `${operator} ${number.substring(0, 3)}-${number.substring(3, 5)}-${number.substring(5)}`;
};
// Генерация белорусского email
const generateBelarusianEmail = (firstName, lastName) => {
    const domain = getRandomElement(BY_DOMAINS);
    const transliterate = (text) => {
        // Простая транслитерация для примера
        return text.toLowerCase()
            .replace(/а/g, 'a').replace(/б/g, 'b').replace(/в/g, 'v').replace(/г/g, 'g')
            .replace(/д/g, 'd').replace(/е/g, 'e').replace(/ё/g, 'e').replace(/ж/g, 'zh')
            .replace(/з/g, 'z').replace(/и/g, 'i').replace(/й/g, 'y').replace(/к/g, 'k')
            .replace(/л/g, 'l').replace(/м/g, 'm').replace(/н/g, 'n').replace(/о/g, 'o')
            .replace(/п/g, 'p').replace(/р/g, 'r').replace(/с/g, 's').replace(/т/g, 't')
            .replace(/у/g, 'u').replace(/ф/g, 'f').replace(/х/g, 'h').replace(/ц/g, 'ts')
            .replace(/ч/g, 'ch').replace(/ш/g, 'sh').replace(/щ/g, 'sch').replace(/ъ/g, '')
            .replace(/ы/g, 'y').replace(/ь/g, '').replace(/э/g, 'e').replace(/ю/g, 'yu')
            .replace(/я/g, 'ya');
    };
    const transliteratedFirstName = transliterate(firstName);
    const transliteratedLastName = transliterate(lastName);
    return `${transliteratedFirstName}.${transliteratedLastName}@${domain}`;
};
// Названия зон на русском для более реалистичных данных
const ZONE_TYPE_NAMES = {
    sales: ['Торговый зал', 'Витрина', 'Шоурум', 'Зал продаж', 'Демонстрационная зона'],
    warehouse: ['Склад', 'Хранилище', 'Основной склад', 'Запасной склад', 'Зона хранения'],
    receiving: ['Зона приемки', 'Загрузочная', 'Приемный пункт', 'Разгрузочная зона'],
    cashier: ['Касса', 'Зона оплаты', 'Кассовый узел', 'Терминал оплаты'],
    returns: ['Зона возвратов', 'Пункт обработки возвратов', 'Служба возвратов'],
    pickup: ['Пункт выдачи', 'Самовывоз', 'Зона выдачи заказов', 'Терминал выдачи']
};
// Use a different name to avoid conflict with the imported connectDB
const initDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        mongoose_1.default.set("strictQuery", false);
        yield mongoose_1.default.connect('mongodb://localhost:27017/warehouse2');
        console.log("Connected to database successfully ✅");
        // Clear existing data
        yield clearDatabase();
        console.log("\n=== НАЧАЛО ИНИЦИАЛИЗАЦИИ БАЗЫ ДАННЫХ ===\n");
        // Initialize data - выполняем в определенном порядке для связанных данных
        const users = yield createUsers();
        const zones = yield createZones();
        // Create products and convert them to IProductDocument with as assertion
        const productsRaw = yield createProducts(zones);
        const products = productsRaw.map(p => {
            return Object.assign(Object.assign({}, p.toObject()), { _id: p._id, productId: p._id.toString() // Use _id as productId if it doesn't exist
             });
        });
        yield createGallery(products);
        yield createPurchases(products);
        const batches = yield createBatches(products, zones);
        console.log("Создание начальных перемещений для всех партий...");
        yield Promise.all(batches.map((batch) => __awaiter(void 0, void 0, void 0, function* () {
            yield ProductMovement_1.default.create({
                product: batch.product,
                batch: batch._id,
                type: 'receipt',
                quantity: batch.quantity,
                fromZone: null,
                toZone: batch.zone,
                performedBy: users[0]._id, // пусть это будет админ
                reason: 'Первичное поступление партии',
                createdAt: batch.manufacturingDate,
                updatedAt: batch.manufacturingDate
            });
        })));
        console.log("Начальные перемещения для партий созданы ✅");
        yield createExpiryTracking(batches, zones);
        yield createInventoryAlerts(products, batches, zones);
        const incomingProducts = yield createIncomingProducts(products);
        const storeInventory = yield createStoreInventory(products);
        const outgoingProducts = yield createOutgoingProducts(products, storeInventory);
        const sales = yield createSales(storeInventory);
        yield createOrderProducts(products, storeInventory);
        yield createReturnedItems(sales);
        yield createDailyAttendance(users);
        yield createBarcodes(products, users);
        yield createStoreIncomingProducts(outgoingProducts);
        yield createProductMovements(batches, zones, users);
        yield createZoneTransferRequests(products, batches, zones, users);
        yield createOnlineOrders(products, zones, users);
        console.log("\n=== СТАТИСТИКА БАЗЫ ДАННЫХ ===");
        console.log(`- Пользователи: ${USERS_COUNT}`);
        console.log(`- Продукты: ${PRODUCTS_COUNT}`);
        console.log(`- Зоны: ${ZONES_COUNT}`);
        console.log(`- Партии: ${BATCHES_COUNT}`);
        console.log(`- Перемещения товаров: ${MOVEMENTS_COUNT}`);
        console.log(`- Онлайн заказы: ${ORDERS_COUNT}`);
        console.log(`- Уведомления: ${ALERTS_COUNT}`);
        console.log(`- Запросы на перемещение: ${TRANSFER_REQUESTS_COUNT}`);
        const totalRecords = USERS_COUNT + PRODUCTS_COUNT + ZONES_COUNT + BATCHES_COUNT +
            MOVEMENTS_COUNT + ORDERS_COUNT + ALERTS_COUNT + TRANSFER_REQUESTS_COUNT;
        console.log(`\nВсего записей: ${totalRecords}`);
        console.log("\n=== БАЗА ДАННЫХ УСПЕШНО ИНИЦИАЛИЗИРОВАНА! ===\n");
        process.exit(0);
    }
    catch (error) {
        console.error("Ошибка подключения к базе данных ❌", error);
        process.exit(1);
    }
});
// Clear all collections
const clearDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Очистка существующих данных...");
    yield User_1.default.deleteMany({});
    yield Product_1.default.deleteMany({});
    yield Gallery_1.default.deleteMany({});
    yield Sale_1.default.deleteMany({});
    yield Purchase_1.default.deleteMany({});
    yield IncomingProduct_1.default.deleteMany({});
    yield OutgoingProduct_1.default.deleteMany({});
    yield OrderProduct_1.default.deleteMany({});
    yield DailyAttendance_1.default.deleteMany({});
    yield ReturnedItem_1.default.deleteMany({});
    yield BarcodeGenerator_1.default.deleteMany({});
    yield StoreInventory_1.default.deleteMany({});
    yield StoreIncomingProduct_1.default.deleteMany({});
    yield Zone_1.default.deleteMany({});
    yield Batch_1.default.deleteMany({});
    yield ProductMovement_1.default.deleteMany({});
    yield OnlineOrder_1.default.deleteMany({});
    yield ExpiryTracking_1.default.deleteMany({});
    yield InventoryAlert_1.default.deleteMany({});
    yield ZoneTransferRequest_1.default.deleteMany({});
    console.log("Все коллекции очищены ✅");
});
// Create users with different roles
const createUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Создание пользователей...");
    const passwordHash = yield bcryptjs_1.default.hash("123456", 10);
    const now = new Date();
    // Create admin user first
    const admin = yield User_1.default.create({
        username: "admin",
        password: passwordHash,
        firstName: "Администратор",
        lastName: "Системы",
        name: "Администратор Системы",
        email: "admin@warehouse.by",
        address: "г. Минск, ул. Независимости, д. 65, кв. 42",
        birthDate: new Date(1985, 4, 15),
        contactNumber: "+375 29 123-45-67",
        levelOfAccess: "Администратор",
        store: "Центральный Склад",
        isActive: true,
        createdAt: now,
        updatedAt: now
    });
    // Create regular employee
    const employee = yield User_1.default.create({
        username: "employee",
        password: passwordHash,
        firstName: "Сотрудник",
        lastName: "Петров",
        name: "Сотрудник Петров",
        email: "employee@warehouse.by",
        address: "г. Минск, ул. Пушкина, д. 17, кв. 89",
        birthDate: new Date(1990, 7, 22),
        contactNumber: "+375 33 765-43-21",
        levelOfAccess: "Сотрудник",
        store: "Магазин в ТЦ Столица",
        isActive: true,
        createdAt: now,
        updatedAt: now
    });
    // Create regular client
    const client = yield User_1.default.create({
        username: "client",
        password: passwordHash,
        firstName: "Клиент",
        lastName: "Сидоров",
        name: "Клиент Сидоров",
        email: "client@mail.by",
        address: "г. Минск, ул. Якуба Коласа, д. 28, кв. 15",
        birthDate: new Date(1988, 3, 10),
        contactNumber: "+375 44 555-77-88",
        levelOfAccess: "Клиент",
        isActive: true,
        createdAt: now,
        updatedAt: now
    });
    // Create regular users
    const users = yield Promise.all(Array.from({ length: USERS_COUNT - 3 }).map((_, index) => __awaiter(void 0, void 0, void 0, function* () {
        const firstName = ru_1.faker.person.firstName();
        const lastName = ru_1.faker.person.lastName();
        const username = faker_1.faker.internet.userName({ firstName, lastName }).toLowerCase();
        const password = yield bcryptjs_1.default.hash("password123", 10);
        // Определяем роли с преобладанием клиентов
        let levelOfAccess;
        if (index < (USERS_COUNT - 3) * 0.15) {
            levelOfAccess = 'Администратор';
        }
        else if (index < (USERS_COUNT - 3) * 0.35) {
            levelOfAccess = 'Сотрудник';
        }
        else {
            levelOfAccess = 'Клиент';
        }
        const stores = [
            'Центральный Склад',
            'Магазин в Центре',
            'Магазин в ТЦ Столица',
            'Магазин на Западе',
            'Магазин на Востоке',
            'Магазин в ТЦ Арена-Сити',
            'Магазин в ТЦ Галерея',
            'Магазин в ТЦ Замок'
        ];
        // Для администраторов и сотрудников указываем магазин, для клиентов нет
        const store = levelOfAccess !== 'Клиент' ? getRandomElement(stores) : undefined;
        const address = generateBelarusianAddress();
        const email = generateBelarusianEmail(firstName, lastName);
        const phone = generateBelarusianPhone();
        return User_1.default.create({
            username,
            password,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            email,
            contactNumber: phone,
            address,
            levelOfAccess,
            birthDate: randomDate(new Date(1970, 0, 1), new Date(2000, 0, 1)),
            store,
            isActive: Math.random() > 0.05, // 5% неактивных пользователей
            createdAt: faker_1.faker.date.past(),
            updatedAt: new Date()
        });
    })));
    users.push(admin, employee, client);
    console.log(`Создано ${users.length} пользователей ✅`);
    return users;
});
// Create zones
const createZones = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Creating zones...');
    // Define fixed zones by type
    const zones = [
        // Sales floor zones
        {
            name: 'Торговый зал Центральный',
            type: 'sales',
            capacity: 500,
            currentOccupancy: 280,
            temperature: 22,
            humidity: 45,
            status: 'active',
            salesZoneConfig: {
                minStockThreshold: 5,
                isPromoZone: false,
                displayPriority: 1,
                visibleToCustomer: true
            }
        },
        {
            name: 'Торговый зал Электроника',
            type: 'sales',
            capacity: 300,
            currentOccupancy: 150,
            temperature: 21,
            humidity: 40,
            status: 'active',
            salesZoneConfig: {
                minStockThreshold: 3,
                isPromoZone: false,
                displayPriority: 2,
                visibleToCustomer: true
            }
        },
        {
            name: 'Промо-зона Акций',
            type: 'sales',
            capacity: 120,
            currentOccupancy: 85,
            temperature: 22,
            humidity: 45,
            status: 'active',
            salesZoneConfig: {
                minStockThreshold: 2,
                isPromoZone: true,
                promotionEndDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days in the future
                displayPriority: 1,
                visibleToCustomer: true
            }
        },
        // Warehouse zones
        {
            name: 'Основной склад',
            type: 'warehouse',
            capacity: 2000,
            currentOccupancy: 1450,
            temperature: 18,
            humidity: 50,
            status: 'active',
            warehouseConfig: {
                temperatureMonitored: true,
                storageConditions: {
                    specialRequirements: 'Нет особых требований'
                },
                fifoEnabled: true,
                zonePartition: 'Общее хранение',
                allowMixedProducts: true
            }
        },
        {
            name: 'Склад электроники',
            type: 'warehouse',
            capacity: 800,
            currentOccupancy: 350,
            temperature: 20,
            humidity: 35,
            status: 'active',
            warehouseConfig: {
                temperatureMonitored: true,
                storageConditions: {
                    specialRequirements: 'Низкая влажность'
                },
                fifoEnabled: true,
                zonePartition: 'Электроника',
                allowMixedProducts: true
            }
        },
        {
            name: 'Холодильный склад',
            type: 'warehouse',
            capacity: 500,
            currentOccupancy: 230,
            temperature: 4,
            humidity: 65,
            status: 'active',
            warehouseConfig: {
                temperatureMonitored: true,
                storageConditions: {
                    specialRequirements: 'Температура 2-6°C'
                },
                fifoEnabled: true,
                zonePartition: 'Охлаждённые продукты',
                allowMixedProducts: false
            }
        },
        {
            name: 'Морозильный склад',
            type: 'warehouse',
            capacity: 300,
            currentOccupancy: 180,
            temperature: -18,
            humidity: 60,
            status: 'active',
            warehouseConfig: {
                temperatureMonitored: true,
                storageConditions: {
                    specialRequirements: 'Температура -20°C до -16°C'
                },
                fifoEnabled: true,
                zonePartition: 'Замороженные продукты',
                allowMixedProducts: false
            }
        },
        // Receiving zones
        {
            name: 'Зона приемки Центральная',
            type: 'receiving',
            capacity: 300,
            currentOccupancy: 85,
            temperature: 20,
            humidity: 55,
            status: 'active',
            receivingConfig: {
                hasQualityControl: true,
                maxDailyCapacity: 500,
                requiresInspection: true,
                supplierVerification: true,
                tempStorageDuration: 24
            }
        },
        {
            name: 'Зона приемки Товары в обороте',
            type: 'receiving',
            capacity: 150,
            currentOccupancy: 30,
            temperature: 20,
            humidity: 55,
            status: 'active',
            receivingConfig: {
                hasQualityControl: true,
                maxDailyCapacity: 300,
                requiresInspection: true,
                supplierVerification: true,
                tempStorageDuration: 48
            }
        },
        // Cashier zones
        {
            name: 'Кассовая зона Центральная',
            type: 'cashier',
            capacity: 100,
            currentOccupancy: 35,
            temperature: 22,
            humidity: 45,
            status: 'active',
            cashierConfig: {
                hasReturnsProcessing: true,
                hasExpressCheckout: true,
                realTimeInventoryUpdate: true,
                allowPartialReturn: true
            }
        },
        {
            name: 'Кассовая зона Экспресс',
            type: 'cashier',
            capacity: 50,
            currentOccupancy: 15,
            temperature: 22,
            humidity: 45,
            status: 'active',
            cashierConfig: {
                hasReturnsProcessing: false,
                hasExpressCheckout: true,
                realTimeInventoryUpdate: true,
                allowPartialReturn: false
            }
        },
        // Returns zones
        {
            name: 'Зона возвратов',
            type: 'returns',
            capacity: 200,
            currentOccupancy: 75,
            temperature: 20,
            humidity: 50,
            status: 'active',
            returnsConfig: {
                requiresInspection: true,
                maxStorageDays: 30,
                allowReselling: true,
                defectCategories: ['minor', 'major', 'critical'],
                quarantinePeriod: 7
            }
        },
        // Pickup zones
        {
            name: 'Зона выдачи заказов №1',
            type: 'pickup',
            capacity: 150,
            currentOccupancy: 60,
            temperature: 21,
            humidity: 45,
            status: 'active',
            pickupConfig: {
                maxWaitingTime: 48,
                requiresIdentification: true,
                notificationEnabled: true,
                reservationDuration: 72,
                statusTracking: true
            }
        },
        {
            name: 'Зона выдачи заказов №2',
            type: 'pickup',
            capacity: 120,
            currentOccupancy: 45,
            temperature: 21,
            humidity: 45,
            status: 'active',
            pickupConfig: {
                maxWaitingTime: 48,
                requiresIdentification: true,
                notificationEnabled: true,
                reservationDuration: 72,
                statusTracking: true
            }
        }
    ];
    const createdZones = yield Zone_1.default.create(zones);
    console.log(`Created ${createdZones.length} zones`);
    return createdZones;
});
// Create batches
const createBatches = (products, zones) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Создание партий товаров...");
    // Используем реалистичные белорусские поставщики
    const suppliers = [
        { name: 'ООО "БелТехИмпорт"', contact: '+375 17 293-45-67', email: 'info@beltechimp.by', address: 'г. Минск, ул. Притыцкого, 156' },
        { name: 'ЗАО "ТехноТрейд"', contact: '+375 17 219-84-23', email: 'supply@technotrade.by', address: 'г. Минск, ул. Тимирязева, 67' },
        { name: 'ООО "Электросила"', contact: '+375 17 237-89-56', email: 'zakupki@elektrosila.by', address: 'г. Минск, пр. Победителей, 65' },
        { name: 'ООО "БытТехСервис"', contact: '+375 17 268-12-34', email: 'opt@bytservice.by', address: 'г. Минск, ул. Немига, 22' },
        { name: 'ИООО "ПанЭлектроникс"', contact: '+375 17 290-32-56', email: 'partners@panelectronics.by', address: 'г. Минск, ул. Кульман, 11' },
        { name: 'ООО "МебельСтарт"', contact: '+375 17 245-78-90', email: 'info@mebelstart.by', address: 'г. Минск, ул. Сурганова, 88' },
        { name: 'ЗАО "Пинскдрев"', contact: '+375 165 31-12-34', email: 'wholesale@pinskdrev.by', address: 'г. Пинск, ул. Чуклая, 1' },
        { name: 'ООО "Атлант-Импорт"', contact: '+375 17 203-45-67', email: 'sales@atlantimport.by', address: 'г. Минск, пр. Дзержинского, 119' },
        { name: 'ООО "МТС-Комплект"', contact: '+375 17 293-67-89', email: 'opt@mtskomplekt.by', address: 'г. Минск, ул. Калиновского, 55' },
        { name: 'СООО "КомфортТрейд"', contact: '+375 17 290-15-46', email: 'partners@komforttrade.by', address: 'г. Минск, ул. Гинтовта, 12А' }
    ];
    const batches = yield Promise.all(Array.from({ length: BATCHES_COUNT }).map((_, index) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        // Instead of using random products, use products in order to ensure each product has a batch
        const productIndex = index % products.length;
        const product = products[productIndex];
        // Используем соответствующий тип зоны для разных товаров
        // Электроника и бытовая техника - склад с мониторингом температуры
        // Мебель - обычный склад
        // Аудио - склад с особыми условиями
        let warehouseZones;
        if (((_a = product.productId) === null || _a === void 0 ? void 0 : _a.startsWith('ELEC')) || ((_b = product.productId) === null || _b === void 0 ? void 0 : _b.startsWith('HOME'))) {
            warehouseZones = zones.filter(z => {
                var _a;
                return z.type === 'warehouse' &&
                    ((_a = z.warehouseConfig) === null || _a === void 0 ? void 0 : _a.temperatureMonitored) === true;
            });
        }
        else if ((_c = product.productId) === null || _c === void 0 ? void 0 : _c.startsWith('FURN')) {
            warehouseZones = zones.filter(z => z.type === 'warehouse');
        }
        else {
            warehouseZones = zones.filter(z => {
                var _a, _b;
                return z.type === 'warehouse' &&
                    ((_b = (_a = z.warehouseConfig) === null || _a === void 0 ? void 0 : _a.storageConditions) === null || _b === void 0 ? void 0 : _b.specialRequirements) !== null;
            });
        }
        // Если не нашли подходящих зон, берем любую складскую
        if (warehouseZones.length === 0) {
            warehouseZones = zones.filter(z => z.type === 'warehouse');
        }
        // If still no warehouse zones, use any zone
        if (warehouseZones.length === 0) {
            warehouseZones = zones;
        }
        const zone = getRandomElement(warehouseZones);
        const quantity = faker_1.faker.number.int({ min: 10, max: 500 });
        // Update product quantity
        yield Product_1.default.findByIdAndUpdate(product._id, { $inc: { quantity: quantity } });
        // Update zone occupancy
        yield Zone_1.default.findByIdAndUpdate(zone._id, { $inc: { currentOccupancy: quantity } });
        // Производственная дата от 1 месяца до 1 года назад
        const manufacturingDate = faker_1.faker.date.past({ years: 1, refDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) });
        // Срок годности зависит от типа продукта
        let expiryYears = 2; // По умолчанию 2 года
        if ((_d = product.productId) === null || _d === void 0 ? void 0 : _d.startsWith('ELEC')) {
            expiryYears = 5; // Электроника - 5 лет
        }
        else if ((_e = product.productId) === null || _e === void 0 ? void 0 : _e.startsWith('HOME')) {
            expiryYears = 3; // Бытовая техника - 3 года
        }
        else if ((_f = product.productId) === null || _f === void 0 ? void 0 : _f.startsWith('FURN')) {
            expiryYears = 10; // Мебель - 10 лет
        }
        const expiryDate = new Date(manufacturingDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + expiryYears);
        // Fix the type conversion for basePrice in batches
        const basePrice = typeof product.price === 'number' ? product.price :
            (typeof product.price === 'string' ? parseFloat(String(product.price).replace(" BYN", "")) : 100);
        // Purchase price is 60-75% of retail price
        const purchasePrice = basePrice * (0.6 + Math.random() * 0.15);
        // Выбираем поставщика, соответствующего типу товара
        let supplier;
        if ((_g = product.productId) === null || _g === void 0 ? void 0 : _g.startsWith('ELEC')) {
            supplier = getRandomElement(suppliers.slice(0, 5)); // Электроника
        }
        else if ((_h = product.productId) === null || _h === void 0 ? void 0 : _h.startsWith('HOME')) {
            supplier = getRandomElement(suppliers.slice(4, 8)); // Бытовая техника
        }
        else if ((_j = product.productId) === null || _j === void 0 ? void 0 : _j.startsWith('FURN')) {
            supplier = getRandomElement([suppliers[5], suppliers[6]]); // Мебель
        }
        else {
            supplier = getRandomElement(suppliers); // Любой поставщик
        }
        // Качество партии
        const quality = Math.random() < 0.7 ? 'A' : (Math.random() < 0.8 ? 'B' : 'C');
        // Примечания к партии
        let notes = '';
        if (quality === 'B') {
            notes = getRandomElement([
                'Незначительные повреждения упаковки',
                'Партия из разных поставок',
                'Небольшие отклонения от стандартов'
            ]);
        }
        else if (quality === 'C') {
            notes = getRandomElement([
                'Заметные повреждения упаковки, товар цел',
                'Товар с витрины, возможны потертости',
                'Устаревшая модель, распродажа'
            ]);
        }
        // Create a truly unique batch number based on product ID or name and a random string
        const productPrefix = (((_k = product.productId) === null || _k === void 0 ? void 0 : _k.split('-')[0]) ||
            (product.name ? product.name.substring(0, 4).toUpperCase() : 'PROD')).replace(/\s+/g, '');
        const batchNumber = `${productPrefix}-${faker_1.faker.string.alphanumeric(6).toUpperCase()}`;
        // Create batch with proper product reference
        const batch = yield Batch_1.default.create({
            batchNumber,
            product: product._id, // Use the actual product ID from MongoDB
            quantity,
            manufacturingDate,
            expiryDate,
            supplier,
            purchasePrice,
            quality,
            notes,
            zone: zone._id,
            createdAt: faker_1.faker.date.past({ years: 1 }),
            updatedAt: new Date()
        });
        console.log(`Created batch: ${batch.batchNumber} for product: ${product.name || product.brandName}`);
        return batch;
    })));
    console.log(`Создано ${batches.length} партий товаров ✅`);
    return batches;
});
// Create product movements
const createProductMovements = (batches, zones, users) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Creating product movements...');
    const types = ['receipt', 'transfer', 'sale', 'return', 'adjustment'];
    const reasons = [
        'Поступление на склад',
        'Перемещение в торговый зал',
        'Перемещение между складами',
        'Продажа',
        'Возврат от покупателя',
        'Корректировка инвентаря',
        'Пополнение торгового зала',
        'Перемещение в зону выдачи заказов'
    ];
    const movements = [];
    // First create initial receipts for all batches
    for (const batch of batches) {
        const product = batch.product;
        const targetZone = zones.find(z => z.type === 'warehouse');
        if (!targetZone)
            continue;
        // Initial receipt - product coming into the warehouse
        movements.push({
            product,
            batch: batch._id, // Добавляем обязательное поле batch
            date: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000), // Random date in last 60 days
            type: 'receipt',
            quantity: batch.quantity,
            toZone: targetZone._id,
            reason: 'Первичное поступление товара',
            performedBy: getRandomElement(users)._id // Добавляем обязательное поле performedBy
        });
    }
    // Create movements between different zones
    const remainingMovements = MOVEMENTS_COUNT - movements.length;
    // Group zones by type for easier reference
    const zonesByType = {};
    zones.forEach(zone => {
        if (!zonesByType[zone.type]) {
            zonesByType[zone.type] = [];
        }
        zonesByType[zone.type].push(zone);
    });
    // Create specific movement patterns
    for (let i = 0; i < remainingMovements; i++) {
        const batch = getRandomElement(batches);
        const product = batch.product;
        const user = getRandomElement(users);
        // Random date in last 30 days
        const date = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
        // Determine movement type and zones based on realistic patterns
        let type, fromZone = null, toZone = null, reason, quantity;
        // movement pattern logic
        const pattern = Math.random();
        if (pattern < 0.4) {
            // Transfer from warehouse to sales floor
            type = 'transfer';
            fromZone = zonesByType['warehouse'] ? getRandomElement(zonesByType['warehouse']) : null;
            toZone = zonesByType['sales'] ? getRandomElement(zonesByType['sales']) : null;
            reason = 'Пополнение товара в торговом зале';
            quantity = Math.floor(Math.random() * 10) + 5; // 5-15 items
        }
        else if (pattern < 0.6) {
            // Sale - from sales floor
            type = 'sale';
            fromZone = zonesByType['sales'] ? getRandomElement(zonesByType['sales']) : null;
            toZone = null; // Sales don't have destination zone
            reason = 'Продажа товара покупателю';
            quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
        }
        else if (pattern < 0.7) {
            // Return - to returns zone
            type = 'return';
            fromZone = null; // Returns don't have source zone
            toZone = zonesByType['returns'] ? getRandomElement(zonesByType['returns']) : null;
            reason = 'Возврат товара от покупателя';
            quantity = 1; // Usually just 1 item returned
        }
        else if (pattern < 0.85) {
            // Transfer to pickup zone for online orders
            type = 'transfer';
            fromZone = zonesByType['warehouse'] ? getRandomElement(zonesByType['warehouse']) : null;
            toZone = zonesByType['pickup'] ? getRandomElement(zonesByType['pickup']) : null;
            reason = 'Перемещение товара в зону выдачи заказов';
            quantity = Math.floor(Math.random() * 2) + 1; // 1-2 items
        }
        else {
            // Inventory adjustment (только положительные значения для соответствия схеме)
            type = 'adjustment';
            fromZone = getRandomElement(zones);
            toZone = null;
            reason = 'Корректировка инвентаря после инвентаризации';
            // Всегда положительное значение согласно ограничению схемы (min: 1)
            quantity = Math.floor(Math.random() * 5) + 1; // 1-5 items
        }
        // Create the movement
        movements.push({
            product,
            batch: batch._id, // Добавляем обязательное поле batch
            date,
            type,
            quantity,
            fromZone: fromZone ? fromZone._id : undefined,
            toZone: toZone ? toZone._id : undefined,
            reason,
            performedBy: user._id // Переименовываем createdBy в performedBy
        });
    }
    // Create real-time movements for today to demonstrate the tracking feature
    // Add some movements that happened today for key products to demonstrate tracking
    if (batches.length > 0) {
        const recentMovements = [];
        const today = new Date();
        // Pick a few batches for recent movements
        const keyBatches = batches.slice(0, Math.min(10, batches.length));
        for (const batch of keyBatches) {
            // Create a movement chain for each key batch
            const warehouseZone = zonesByType['warehouse'] ? getRandomElement(zonesByType['warehouse']) : null;
            const salesZone = zonesByType['sales'] ? getRandomElement(zonesByType['sales']) : null;
            const pickupZone = zonesByType['pickup'] ? getRandomElement(zonesByType['pickup']) : null;
            const admin = users.find(u => u.levelOfAccess === 'Администратор');
            // First move to warehouse (if not already there)
            if (warehouseZone) {
                recentMovements.push({
                    product: batch.product,
                    batch: batch._id, // Добавляем обязательное поле batch
                    date: new Date(today.getTime() - 8 * 60 * 60 * 1000), // 8 hours ago
                    type: 'receipt',
                    quantity: 20,
                    toZone: warehouseZone._id,
                    reason: 'Поступление новой партии',
                    performedBy: admin ? admin._id : users[0]._id // Переименовываем createdBy в performedBy
                });
                // Then move some to sales floor
                if (salesZone) {
                    recentMovements.push({
                        product: batch.product,
                        batch: batch._id, // Добавляем обязательное поле batch
                        date: new Date(today.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
                        type: 'transfer',
                        quantity: 10,
                        fromZone: warehouseZone._id,
                        toZone: salesZone._id,
                        reason: 'Выкладка товара в торговый зал',
                        performedBy: admin ? admin._id : users[0]._id // Переименовываем createdBy в performedBy
                    });
                    // Then sell some
                    recentMovements.push({
                        product: batch.product,
                        batch: batch._id, // Добавляем обязательное поле batch
                        date: new Date(today.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
                        type: 'sale',
                        quantity: 3,
                        fromZone: salesZone._id,
                        reason: 'Продажа товара',
                        performedBy: admin ? admin._id : users[0]._id // Переименовываем createdBy в performedBy
                    });
                }
                // Move some to pickup zone for online order
                if (pickupZone) {
                    recentMovements.push({
                        product: batch.product,
                        batch: batch._id, // Добавляем обязательное поле batch
                        date: new Date(today.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
                        type: 'transfer',
                        quantity: 2,
                        fromZone: warehouseZone._id,
                        toZone: pickupZone._id,
                        reason: 'Подготовка онлайн-заказа #OR-12345',
                        performedBy: admin ? admin._id : users[0]._id // Переименовываем createdBy в performedBy
                    });
                }
            }
        }
        // Add the recent movements to the main array
        movements.push(...recentMovements);
    }
    const createdMovements = yield ProductMovement_1.default.create(movements);
    console.log(`Created ${createdMovements.length} product movements`);
    return createdMovements;
});
// Create online orders
const createOnlineOrders = (products, zones, users) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Создание онлайн-заказов...");
    const orderStatuses = ['pending', 'processing', 'ready', 'completed', 'cancelled'];
    const paymentMethods = ['card', 'cash', 'transfer'];
    const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    // Получаем зоны самовывоза
    const pickupZones = zones.filter(z => z.type === 'pickup');
    // Получаем клиентов
    const clients = users.filter(u => u.levelOfAccess === 'Клиент');
    // Если нет зон самовывоза или клиентов, выходим
    if (pickupZones.length === 0 || clients.length === 0) {
        console.log('Невозможно создать онлайн-заказы: нет зон самовывоза или клиентов');
        return [];
    }
    const onlineOrders = yield Promise.all(Array.from({ length: ORDERS_COUNT }).map((_, index) => {
        const client = getRandomElement(clients);
        const itemCount = faker_1.faker.number.int({ min: 1, max: 5 });
        const orderProducts = getRandomElements(products, itemCount);
        // Создаем элементы заказа
        const items = orderProducts.map(product => {
            // Use the price property instead of pricePerUnit
            const priceValue = typeof product.price === 'number' ? product.price :
                (typeof product.price === 'string' ? parseFloat(String(product.price)) : 100);
            const quantity = faker_1.faker.number.int({ min: 1, max: 5 });
            return {
                product: product._id,
                quantity,
                price: priceValue
            };
        });
        // Вычисляем общую сумму заказа
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        // Определяем статус и даты заказа
        const statusIndex = Math.floor(Math.random() * orderStatuses.length);
        const status = orderStatuses[statusIndex];
        // Даты создания и обновления, с учетом логики статусов
        const now = new Date();
        let createdAt, updatedAt, pickupTime;
        // Создан не позднее 90 дней назад
        createdAt = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000);
        // Обновлен после создания
        const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const updateDays = Math.min(daysSinceCreation, Math.floor(Math.random() * 5) + 1);
        updatedAt = new Date(createdAt.getTime() + updateDays * 24 * 60 * 60 * 1000);
        // Время выдачи зависит от статуса
        if (status === 'ready' || status === 'completed') {
            // Для готовых или выполненных заказов - в ближайшем будущем или уже прошедшее
            pickupTime = new Date(updatedAt.getTime() + (Math.random() * 5 - 2) * 24 * 60 * 60 * 1000);
        }
        else {
            // Для остальных статусов - в будущем
            pickupTime = new Date(updatedAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
        }
        // Определяем статус оплаты в зависимости от статуса заказа
        let paymentStatus;
        if (status === 'cancelled') {
            paymentStatus = Math.random() > 0.7 ? 'refunded' : 'failed';
        }
        else if (status === 'completed') {
            paymentStatus = 'paid';
        }
        else if (status === 'ready') {
            paymentStatus = Math.random() > 0.2 ? 'paid' : 'pending';
        }
        else {
            paymentStatus = getRandomElement(paymentStatuses);
        }
        // Определяем способ оплаты
        const paymentMethod = getRandomElement(paymentMethods);
        // Примечания к заказу
        let notes;
        if (Math.random() > 0.7) {
            if (status === 'cancelled') {
                notes = getRandomElement([
                    'Клиент отменил заказ',
                    'Товара нет в наличии',
                    'Перезвоните для уточнения деталей'
                ]);
            }
            else {
                notes = getRandomElement([
                    'Позвоните перед доставкой',
                    'Нужен подарочный пакет',
                    'Клиент предупреждён о задержке',
                    'Особые пожелания клиента',
                    'Постоянный клиент'
                ]);
            }
        }
        return OnlineOrder_1.default.create({
            orderNumber: `ORD-${faker_1.faker.string.numeric(6)}`,
            client: client._id,
            items,
            totalAmount,
            status,
            pickupZone: getRandomElement(pickupZones)._id,
            pickupTime,
            paymentStatus,
            paymentMethod,
            notes,
            createdAt,
            updatedAt
        });
    }));
    console.log(`Создано ${onlineOrders.length} онлайн-заказов ✅`);
    // Добавление уведомлений о невыкупленных заказах
    const readyOrders = onlineOrders.filter(order => order.status === 'ready' &&
        order.pickupTime &&
        order.pickupTime < new Date() &&
        Math.random() > 0.6 // Только для части заказов создаем уведомления
    );
    if (readyOrders.length > 0) {
        const uncollectedAlerts = yield Promise.all(readyOrders.map((order) => __awaiter(void 0, void 0, void 0, function* () {
            if (!order.pickupZone || !order.pickupTime)
                return null;
            const zone = pickupZones.find(z => z._id.toString() === (order.pickupZone).toString());
            if (zone) {
                return InventoryAlert_1.default.create({
                    type: 'uncollected_order',
                    zoneId: zone._id,
                    message: `Заказ ${order.orderNumber} не забрали в установленное время`,
                    level: 'warning',
                    isResolved: false,
                    createdAt: new Date(order.pickupTime.getTime() + 24 * 60 * 60 * 1000), // 1 день после запланированного времени
                    updatedAt: new Date()
                });
            }
            return null;
        })));
        console.log(`Создано ${uncollectedAlerts.filter(Boolean).length} уведомлений о невыкупленных заказах ✅`);
    }
    return onlineOrders;
});
// Create products with improved data
const createProducts = (zones) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Creating products...');
    // Get all sale and warehouse zones for assigning products to locations
    const salesZones = zones.filter(zone => zone.type === 'sales');
    const warehouseZones = zones.filter(zone => zone.type === 'warehouse');
    // Define product categories with specific products
    const productCategories = [
        {
            name: 'Электроника',
            products: [
                {
                    name: 'Смартфон Samsung Galaxy S21',
                    brandName: 'Samsung',
                    productModel: 'Galaxy S21',
                    description: 'Смартфон с 6.2" экраном, 8GB RAM, 128GB ROM',
                    price: 2799,
                    storageConditions: {
                        temperature: 20,
                        humidity: 40,
                        lightSensitive: false
                    }
                },
                {
                    name: 'Ноутбук ASUS VivoBook',
                    brandName: 'ASUS',
                    productModel: 'VivoBook 15',
                    description: 'Ноутбук для повседневных задач, 15.6" IPS, Core i5, 16GB RAM',
                    price: 3499,
                    storageConditions: {
                        temperature: 20,
                        humidity: 35,
                        lightSensitive: false
                    }
                },
                {
                    name: 'Планшет Apple iPad Air',
                    brandName: 'Apple',
                    productModel: 'iPad Air 2022',
                    description: '10.9" дисплей, M1 чип, 256GB',
                    price: 2599,
                    storageConditions: {
                        temperature: 20,
                        humidity: 40,
                        lightSensitive: false
                    }
                },
                {
                    name: 'Телевизор LG OLED65C1',
                    brandName: 'LG',
                    productModel: 'OLED65C1',
                    description: '65" OLED телевизор, 4K, Smart TV',
                    price: 5999,
                    storageConditions: {
                        temperature: 20,
                        humidity: 45,
                        lightSensitive: false
                    }
                }
            ]
        },
        {
            name: 'Бытовая техника',
            products: [
                {
                    name: 'Холодильник Atlant XM-6224',
                    brandName: 'Atlant',
                    productModel: 'XM-6224',
                    description: 'Двухкамерный холодильник No Frost, 370л',
                    price: 2499,
                    storageConditions: {
                        temperature: 20,
                        humidity: 50,
                        lightSensitive: false
                    }
                },
                {
                    name: 'Стиральная машина Bosch WAN24260',
                    brandName: 'Bosch',
                    productModel: 'WAN24260',
                    description: 'Фронтальная загрузка, 8кг, 1200 об/мин',
                    price: 1899,
                    storageConditions: {
                        temperature: 20,
                        humidity: 50,
                        lightSensitive: false
                    }
                },
                {
                    name: 'Микроволновая печь Samsung ME83XR',
                    brandName: 'Samsung',
                    productModel: 'ME83XR',
                    description: '23л, 800Вт, электронное управление',
                    price: 399,
                    storageConditions: {
                        temperature: 20,
                        humidity: 45,
                        lightSensitive: false
                    }
                }
            ]
        },
        {
            name: 'Мебель',
            products: [
                {
                    name: 'Диван-кровать IKEA FRIHETEN',
                    brandName: 'IKEA',
                    productModel: 'FRIHETEN',
                    description: 'Трехместный диван-кровать с ящиком для хранения',
                    price: 1499,
                    storageConditions: {
                        temperature: 18,
                        humidity: 50,
                        lightSensitive: true
                    }
                },
                {
                    name: 'Шкаф-купе Lazurit Модерн',
                    brandName: 'Lazurit',
                    productModel: 'Модерн',
                    description: 'Шкаф-купе с зеркалом, 200x240x60см',
                    price: 1299,
                    storageConditions: {
                        temperature: 18,
                        humidity: 50,
                        lightSensitive: true
                    }
                }
            ]
        },
        {
            name: 'Продукты питания',
            products: [
                {
                    name: 'Молоко пастеризованное Савушкин 3.2%',
                    brandName: 'Савушкин продукт',
                    productModel: 'Молоко 3.2%',
                    description: 'Молоко пастеризованное 3.2% жирности, 1л',
                    price: 3.99,
                    storageConditions: {
                        temperature: 4,
                        humidity: 70,
                        lightSensitive: true
                    }
                },
                {
                    name: 'Хлеб Нарочанский нарезанный',
                    brandName: 'Минский хлебозавод №3',
                    productModel: 'Нарочанский',
                    description: 'Хлеб пшеничный нарезанный, 400г',
                    price: 1.99,
                    storageConditions: {
                        temperature: 18,
                        humidity: 60,
                        lightSensitive: false
                    }
                },
                {
                    name: 'Мороженое пломбир Белая Бяроза',
                    brandName: 'Белая Бяроза',
                    productModel: 'Пломбир',
                    description: 'Мороженое пломбир в вафельном стаканчике, 100г',
                    price: 2.49,
                    storageConditions: {
                        temperature: -18,
                        humidity: 70,
                        lightSensitive: false
                    }
                }
            ]
        },
        {
            name: 'Одежда',
            products: [
                {
                    name: 'Куртка зимняя Mark Formelle',
                    brandName: 'Mark Formelle',
                    productModel: 'Зимняя 2023',
                    description: 'Мужская зимняя куртка с капюшоном',
                    price: 299,
                    storageConditions: {
                        temperature: 18,
                        humidity: 45,
                        lightSensitive: true
                    }
                },
                {
                    name: 'Футболка Белоруссочка',
                    brandName: 'Белоруссочка',
                    productModel: 'Classic',
                    description: 'Женская хлопковая футболка, разные цвета',
                    price: 39.99,
                    storageConditions: {
                        temperature: 18,
                        humidity: 45,
                        lightSensitive: true
                    }
                }
            ]
        }
    ];
    // Create all products
    const products = [];
    // Generate unique product IDs counter
    let productIdCounter = 10001;
    // Create products from the predefined categories and assign them to appropriate zones
    for (const category of productCategories) {
        for (const productData of category.products) {
            // Find appropriate zone based on product type
            let primaryLocation;
            let zone;
            // Assign location based on product category and storage conditions
            if (category.name === 'Продукты питания') {
                if (productData.storageConditions.temperature < 0) {
                    zone = warehouseZones.find(z => z.name === 'Морозильный склад');
                }
                else if (productData.storageConditions.temperature < 8) {
                    zone = warehouseZones.find(z => z.name === 'Холодильный склад');
                }
                else {
                    zone = getRandomElement(warehouseZones);
                }
            }
            else if (category.name === 'Электроника') {
                // Some electronics in sales, some in warehouse
                zone = Math.random() > 0.5
                    ? salesZones.find(z => z.name === 'Торговый зал Электроника')
                    : warehouseZones.find(z => z.name === 'Склад электроники');
            }
            else {
                // Other products randomly distributed between sales and warehouse
                zone = Math.random() > 0.4
                    ? getRandomElement(salesZones)
                    : getRandomElement(warehouseZones);
            }
            primaryLocation = zone ? zone.name : 'Основной склад';
            // Create the product with updated data
            const product = {
                productId: (productIdCounter++).toString(),
                name: productData.name,
                brandName: productData.brandName,
                productModel: productData.productModel,
                description: productData.description,
                category: category.name,
                quantity: Math.floor(Math.random() * 100) + 20, // Random quantity between 20-120
                price: productData.price,
                model: productData.productModel, // Используем productModel как model
                pricePerUnit: `${productData.price.toFixed(2)} BYN`, // Конвертируем цену в строку с BYN
                location: primaryLocation,
                storageConditions: productData.storageConditions,
                batchInfo: {
                    batchNumber: `B${Math.floor(Math.random() * 90000) + 10000}`,
                    manufacturingDate: randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
                    new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
                    ),
                    expiryDate: randomDate(new Date(), // Today
                    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year ahead
                    )
                },
                status: 'active'
            };
            // Special handling for food products with closer expiry dates
            if (category.name === 'Продукты питания') {
                product.batchInfo.expiryDate = randomDate(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
                new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
                );
                // Some products with expiring soon dates for testing the expiry tracker
                if (Math.random() < 0.3) {
                    product.batchInfo.expiryDate = randomDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
                    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
                    );
                }
            }
            products.push(product);
        }
    }
    // Add some random products to meet the required count
    const randomProductCount = Math.max(0, PRODUCTS_COUNT - products.length);
    for (let i = 0; i < randomProductCount; i++) {
        const category = getRandomElement(['Электроника', 'Бытовая техника', 'Мебель', 'Продукты питания', 'Одежда', 'Спорттовары', 'Канцтовары']);
        const randomZone = getRandomElement([...salesZones, ...warehouseZones]);
        const productModel = `Модель-${Math.floor(Math.random() * 1000)}`;
        const price = Math.floor(Math.random() * 1000) + 50;
        const product = {
            productId: (productIdCounter++).toString(),
            name: `Товар ${i + 1}`,
            brandName: getRandomElement(BY_COMPANIES),
            productModel: productModel,
            model: productModel,
            pricePerUnit: `${price.toFixed(2)} BYN`,
            description: `Описание товара ${i + 1}`,
            category: category,
            quantity: Math.floor(Math.random() * 100) + 10,
            price: price,
            location: randomZone ? randomZone.name : 'Основной склад',
            storageConditions: {
                temperature: Math.floor(Math.random() * 25),
                humidity: Math.floor(Math.random() * 30) + 40,
                lightSensitive: Math.random() > 0.7
            },
            batchInfo: {
                batchNumber: `B${Math.floor(Math.random() * 90000) + 10000}`,
                manufacturingDate: randomDate(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
                expiryDate: randomDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))
            },
            status: Math.random() > 0.9 ? 'inactive' : 'active'
        };
        products.push(product);
    }
    // Create the products in the database
    const createdProducts = yield Product_1.default.create(products);
    console.log(`Created ${createdProducts.length} products`);
    return createdProducts;
});
// Create gallery items
const createGallery = (products) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Создание элементов галереи...");
    // Создаем галерею на основе продуктов
    const galleryItems = products.map(product => ({
        brandName: product.brandName,
        itemDescription: product.description,
        classification: product.category || "Общее",
        price: typeof product.price === 'number' ? `${product.price.toFixed(2)} BYN` : "0.00 BYN",
        image: `https://picsum.photos/seed/${product.productId}/300/200`,
        createdAt: new Date()
    }));
    // Создаем записи в БД
    const result = yield Gallery_1.default.insertMany(galleryItems);
    console.log(`Создано ${result.length} элементов галереи ✅`);
    return result;
});
// Create purchases
const createPurchases = (products) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Создание закупок...");
    const purchases = [];
    // Check the first product to understand its structure
    const firstProduct = products[0];
    console.log("First product structure:", JSON.stringify({
        id: firstProduct._id,
        productId: firstProduct.productId,
        name: firstProduct.name,
        productModel: firstProduct.productModel,
        model: firstProduct.model, // Check if model exists
        price: firstProduct.price,
        pricePerUnit: firstProduct.pricePerUnit // Check if pricePerUnit exists
    }, null, 2));
    for (let i = 0; i < 50; i++) {
        const product = getRandomElement(products);
        // Ensure model exists or fallback to productModel if available, otherwise use a default
        const modelValue = product.model || product.productModel || 'DEFAULT-MODEL';
        const purchase = {
            dateOfTransaction: randomDate(new Date(2022, 0, 1), new Date()),
            brandName: product.brandName,
            description: product.description,
            model: modelValue,
            quantity: Math.floor(Math.random() * 10) + 1,
            totalPrice: `${((Math.random() * 500) + 100).toFixed(2)} BYN`,
            createdAt: new Date()
        };
        purchases.push(purchase);
    }
    const result = yield Purchase_1.default.insertMany(purchases);
    console.log(`Создано ${result.length} закупок ✅`);
    return result;
});
// Create incoming products
const createIncomingProducts = (products) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Создание входящих товаров...");
    const incomingProducts = [];
    for (let i = 0; i < 30; i++) {
        const product = getRandomElement(products);
        // Ensure model exists or fallback to productModel if available
        const modelValue = product.model || product.productModel || 'DEFAULT-MODEL';
        const incomingProduct = {
            brandName: product.brandName,
            description: product.description,
            model: modelValue,
            quantity: Math.floor(Math.random() * 20) + 5,
            totalPrice: `${((Math.random() * 1000) + 200).toFixed(2)} BYN`,
            dateOfTransaction: randomDate(new Date(2022, 0, 1), new Date()),
            createdAt: new Date()
        };
        incomingProducts.push(incomingProduct);
    }
    const result = yield IncomingProduct_1.default.insertMany(incomingProducts);
    console.log(`Создано ${result.length} входящих товаров ✅`);
    return result;
});
// Create store inventory
const createStoreInventory = (products) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Создание инвентаря магазина...");
    const storeInventory = [];
    const stores = ["Центральный", "Восточный", "Западный", "Южный", "Северный"];
    for (const product of products) {
        const store = getRandomElement(stores);
        const productPrice = typeof product.price === 'number' ? product.price :
            (typeof product.price === 'string' ? parseFloat(String(product.price)) : 100);
        const storePrice = productPrice * 1.3;
        // Ensure model exists or fallback to productModel if available
        const modelValue = product.model || product.productModel || 'DEFAULT-MODEL';
        const inventoryItem = {
            productId: product.productId,
            brandName: product.brandName,
            description: product.description,
            model: modelValue,
            quantity: Math.floor(Math.random() * 15) + 5,
            wareHousePrice: `${productPrice.toFixed(2)} BYN`,
            storePrice: `${storePrice.toFixed(2)} BYN`,
            store,
            createdAt: new Date()
        };
        storeInventory.push(inventoryItem);
    }
    const result = yield StoreInventory_1.default.insertMany(storeInventory);
    console.log(`Создано ${result.length} записей инвентаря магазина ✅`);
    return result;
});
// Create outgoing products
const createOutgoingProducts = (products, storeInventory) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Создание исходящих товаров...");
    const outgoingProducts = [];
    for (let i = 0; i < 20; i++) {
        const inventoryItem = getRandomElement(storeInventory);
        const quantity = Math.floor(Math.random() * 5) + 1;
        const outgoingProduct = {
            productId: inventoryItem.productId,
            brandName: inventoryItem.brandName,
            description: inventoryItem.description,
            model: inventoryItem.model,
            quantity,
            pricePerUnit: inventoryItem.wareHousePrice,
            dateOfTransaction: randomDate(new Date(2022, 6, 1), new Date()),
            store: inventoryItem.store,
            createdAt: new Date()
        };
        outgoingProducts.push(outgoingProduct);
    }
    const result = yield OutgoingProduct_1.default.insertMany(outgoingProducts);
    console.log(`Создано ${result.length} исходящих товаров ✅`);
    return result;
});
// Create sales
const createSales = (storeInventory) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Создание продаж...");
    const sales = [];
    for (let i = 0; i < 40; i++) {
        const inventoryItem = getRandomElement(storeInventory);
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = parseFloat(inventoryItem.storePrice.split(' ')[0]);
        const sale = {
            dateOfTransaction: randomDate(new Date(2022, 0, 1), new Date()),
            productId: inventoryItem.productId,
            brandName: inventoryItem.brandName,
            description: inventoryItem.description,
            productModel: inventoryItem.model, // Use model as productModel
            model: inventoryItem.model, // Add explicit model field
            quantity,
            totalPrice: `${(price * quantity).toFixed(2)} BYN`,
            nameOfStore: inventoryItem.store,
            createdAt: new Date()
        };
        sales.push(sale);
    }
    const result = yield Sale_1.default.insertMany(sales);
    console.log(`Создано ${result.length} продаж ✅`);
    return result;
});
// Create order products
const createOrderProducts = (products, storeInventory) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Создание заказанных товаров...");
    const orderProducts = [];
    const stores = ["Центральный", "Восточный", "Западный", "Южный", "Северный"];
    for (let i = 0; i < 15; i++) {
        const product = getRandomElement(products);
        const store = getRandomElement(stores);
        // Ensure model exists or fallback to productModel if available
        const modelValue = product.model || product.productModel || 'DEFAULT-MODEL';
        const orderProduct = {
            productId: product.productId,
            brandName: product.brandName,
            description: product.description,
            model: modelValue,
            quantity: Math.floor(Math.random() * 10) + 1,
            store,
            orderedDate: randomDate(new Date(2022, 6, 1), new Date()),
            createdAt: new Date()
        };
        orderProducts.push(orderProduct);
    }
    const result = yield OrderProduct_1.default.insertMany(orderProducts);
    console.log(`Создано ${result.length} заказанных товаров ✅`);
    return result;
});
// Create returned items
const createReturnedItems = (sales) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Создание возвратов...");
    const returnedItems = [];
    const reasons = [
        "Неверный размер",
        "Дефект товара",
        "Повреждена упаковка",
        "Не соответствует описанию",
        "Ошибка заказа"
    ];
    // Только часть продаж имеет возврат
    const salesWithReturn = getRandomElements(sales, 10);
    for (const sale of salesWithReturn) {
        const returnItem = {
            productId: sale.productId,
            brandName: sale.brandName,
            description: sale.description,
            model: sale.model || sale.productModel || 'DEFAULT-MODEL', // Ensure model field is set
            quantity: Math.min(sale.quantity, Math.floor(Math.random() * 2) + 1),
            reason: getRandomElement(reasons),
            store: sale.nameOfStore,
            returnedDate: new Date(new Date(sale.dateOfTransaction).getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000), // до 7 дней после продажи
            createdAt: new Date()
        };
        returnedItems.push(returnItem);
    }
    const result = yield ReturnedItem_1.default.insertMany(returnedItems);
    console.log(`Создано ${result.length} возвратов ✅`);
    return result;
});
// Create daily attendance
const createDailyAttendance = (users) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Создание записей посещаемости...");
    const attendance = [];
    const activities = ["Прибытие", "Уход", "Перерыв", "Обед", "Окончание перерыва"];
    for (let i = 0; i < 100; i++) {
        const user = getRandomElement(users);
        // Create a valid model value (username or id if username is not available)
        const modelValue = user.username || user._id.toString() || 'DEFAULT-MODEL';
        // Добавляем обязательные поля для DailyAttendance
        attendance.push({
            name: `${user.firstName} ${user.lastName}`,
            activity: getRandomElement(activities),
            dateOfActivity: randomDate(new Date(2022, 6, 1), new Date()),
            quantity: 1, // фиктивное значение, если не используется
            model: modelValue,
            description: `Посещение сотрудника ${user.firstName} ${user.lastName}`,
            brandName: user.levelOfAccess || "Сотрудник",
            createdAt: new Date()
        });
    }
    const result = yield DailyAttendance_1.default.insertMany(attendance);
    console.log(`Создано ${result.length} записей посещаемости ✅`);
    return result;
});
// Create barcodes
const createBarcodes = (products, users) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Создание штрихкодов...");
    const barcodes = [];
    // Найти админа для userId
    const admin = users.find(u => u.levelOfAccess === "Администратор");
    if (!admin)
        throw new Error("Не найден пользователь-администратор для userId в BarcodeGenerator");
    for (const product of products) {
        const barcode = {
            userId: admin._id.toString(),
            productId: product.productId,
            createdAt: new Date()
        };
        barcodes.push(barcode);
    }
    const result = yield BarcodeGenerator_1.default.insertMany(barcodes);
    console.log(`Создано ${result.length} штрихкодов ✅`);
    return result;
});
// Create store incoming products
const createStoreIncomingProducts = (outgoingProducts) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Создание входящих товаров магазина...");
    const storeIncomingProducts = [];
    for (const outgoing of outgoingProducts) {
        const storeIncoming = {
            productId: outgoing.productId,
            brandName: outgoing.brandName,
            description: outgoing.description,
            model: outgoing.model, // Already should have the correct model
            quantity: outgoing.quantity,
            pricePerUnit: outgoing.pricePerUnit,
            dateOfDelivery: new Date(outgoing.dateOfTransaction.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 дня после отправки
            store: outgoing.store,
            createdAt: new Date()
        };
        storeIncomingProducts.push(storeIncoming);
    }
    const result = yield StoreIncomingProduct_1.default.insertMany(storeIncomingProducts);
    console.log(`Создано ${result.length} входящих товаров магазина ✅`);
    return result;
});
// Create expiry tracking
const createExpiryTracking = (batches, zones) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Создание отслеживания сроков годности...");
    const expiryTrackings = [];
    for (const batch of batches) {
        // Фильтруем только партии с близким сроком годности
        if (batch.expiryDate.getTime() - new Date().getTime() < 90 * 24 * 60 * 60 * 1000) { // меньше 90 дней
            const product = yield Product_1.default.findById(batch.product);
            if (product) {
                const tracking = {
                    productId: product._id,
                    batchId: batch._id,
                    expiryDate: batch.expiryDate,
                    notificationSent: Math.random() > 0.7, // 30% уведомлений уже отправлены
                    zoneId: batch.zone,
                    quantity: batch.quantity,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                expiryTrackings.push(tracking);
            }
        }
    }
    const result = yield ExpiryTracking_1.default.insertMany(expiryTrackings);
    console.log(`Создано ${result.length} записей об истечении срока годности ✅`);
    return result;
});
// Create inventory alerts
const createInventoryAlerts = (products, batches, zones) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Создание уведомлений об инвентаре...");
    const alerts = [];
    // 1. Уведомления о низком запасе
    const lowStockProducts = products.filter(product => product.quantity < 10);
    for (const product of getRandomElements(lowStockProducts, Math.min(15, lowStockProducts.length))) {
        const salesZones = zones.filter(z => z.type === 'sales');
        const zone = getRandomElement(salesZones);
        alerts.push({
            type: 'low_stock',
            productId: product._id,
            zoneId: zone._id,
            message: `Низкий запас товара ${product.name || product.description} (${product.quantity} шт.)`,
            level: product.quantity < 3 ? 'critical' : 'warning',
            isResolved: false,
            createdAt: randomDate(new Date(2023, 0, 1), new Date()),
            updatedAt: new Date()
        });
    }
    // 2. Уведомления о заполненности зоны
    const highOccupancyZones = zones.filter(z => (z.currentOccupancy / z.capacity) > 0.85);
    for (const zone of getRandomElements(highOccupancyZones, Math.min(10, highOccupancyZones.length))) {
        const occupancyRate = Math.round((zone.currentOccupancy / zone.capacity) * 100);
        alerts.push({
            type: 'zone_capacity',
            zoneId: zone._id,
            message: `Зона ${zone.name} заполнена на ${occupancyRate}%`,
            level: occupancyRate > 95 ? 'critical' : 'warning',
            isResolved: Math.random() > 0.7, // 30% разрешены
            resolvedBy: Math.random() > 0.6 ? undefined : null,
            createdAt: randomDate(new Date(2023, 0, 1), new Date()),
            updatedAt: new Date()
        });
    }
    // 3. Уведомления о скором истечении срока годности
    const expiringBatches = batches.filter(batch => {
        const daysUntilExpiry = Math.round((batch.expiryDate.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
        return daysUntilExpiry >= 0 && daysUntilExpiry < 30;
    });
    for (const batch of getRandomElements(expiringBatches, Math.min(20, expiringBatches.length))) {
        const daysUntilExpiry = Math.round((batch.expiryDate.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
        const product = yield Product_1.default.findById(batch.product);
        const zone = zones.find(z => z._id.toString() === batch.zone.toString());
        if (product && zone) {
            alerts.push({
                type: 'expiring_soon',
                productId: product._id,
                batchId: batch._id,
                zoneId: zone._id,
                message: `Скоро истекает срок годности у товара ${product.name || product.description} (партия ${batch.batchNumber}), осталось ${daysUntilExpiry} дней`,
                level: daysUntilExpiry < 7 ? 'critical' : 'warning',
                isResolved: Math.random() > 0.6, // 40% разрешены
                resolvedBy: Math.random() > 0.6 ? undefined : null,
                createdAt: new Date(new Date().getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                updatedAt: new Date()
            });
        }
    }
    // 4. Уведомления о проблемах с качеством
    const lowQualityBatches = batches.filter(batch => batch.quality === 'C' || (batch.notes && batch.notes.includes('повреждения')));
    for (const batch of getRandomElements(lowQualityBatches, Math.min(10, lowQualityBatches.length))) {
        const zone = zones.find(z => z._id.toString() === batch.zone.toString());
        const product = yield Product_1.default.findById(batch.product);
        if (product && zone) {
            alerts.push({
                type: 'quality_issue',
                productId: product._id,
                batchId: batch._id,
                zoneId: zone._id,
                message: `Проблема с качеством в партии ${batch.batchNumber}: ${batch.notes}`,
                level: 'warning',
                isResolved: Math.random() > 0.6, // 40% разрешены
                resolvedBy: Math.random() > 0.6 ? undefined : null,
                createdAt: randomDate(new Date(2023, 0, 1), new Date()),
                updatedAt: new Date()
            });
        }
    }
    // Выбираем случайное подмножество уведомлений для базы данных
    const selectedAlerts = getRandomElements(alerts, Math.min(alerts.length, 50));
    const result = yield InventoryAlert_1.default.insertMany(selectedAlerts);
    console.log(`Создано ${selectedAlerts.length} уведомлений ✅`);
    return selectedAlerts;
});
// Create zone transfer requests
const createZoneTransferRequests = (products, batches, zones, users) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Создание запросов на перемещение между зонами...");
    const transferRequests = [];
    const warehouseZones = zones.filter(z => z.type === 'warehouse');
    const salesZones = zones.filter(z => z.type === 'sales');
    const pickupZones = zones.filter(z => z.type === 'pickup');
    const receivingZones = zones.filter(z => z.type === 'receiving');
    // Случайные запросы на перемещение
    for (let i = 0; i < 15; i++) {
        const batch = getRandomElement(batches);
        let fromZone, toZone;
        // Определяем типы зон для перемещения
        const transferType = Math.random();
        if (transferType < 0.4) {
            // Со склада в торговый зал
            fromZone = getRandomElement(warehouseZones);
            toZone = getRandomElement(salesZones);
        }
        else if (transferType < 0.7) {
            // С приемки на склад
            fromZone = getRandomElement(receivingZones);
            toZone = getRandomElement(warehouseZones);
        }
        else {
            // Со склада в зону выдачи
            fromZone = getRandomElement(warehouseZones);
            toZone = getRandomElement(pickupZones);
        }
        // Статусы запросов с разной вероятностью
        const statusRandom = Math.random();
        let status;
        if (statusRandom < 0.4) {
            status = 'pending';
        }
        else if (statusRandom < 0.7) {
            status = 'approved';
        }
        else if (statusRandom < 0.9) {
            status = 'completed';
        }
        else {
            status = 'rejected';
        }
        // Определяем причину
        const reasons = [
            'Пополнение товара в торговом зале',
            'Оптимизация использования складских площадей',
            'Перемещение для подготовки к выдаче',
            'Товар нужен для выполнения заказа',
            'Подготовка к инвентаризации',
            'Освобождение места в зоне приемки'
        ];
        // Приоритеты
        const priorities = ['low', 'normal', 'high', 'urgent'];
        const priorityWeights = [0.3, 0.4, 0.2, 0.1];
        let priority;
        const priorityRandom = Math.random();
        if (priorityRandom < priorityWeights[0]) {
            priority = priorities[0];
        }
        else if (priorityRandom < priorityWeights[0] + priorityWeights[1]) {
            priority = priorities[1];
        }
        else if (priorityRandom < priorityWeights[0] + priorityWeights[1] + priorityWeights[2]) {
            priority = priorities[2];
        }
        else {
            priority = priorities[3];
        }
        const createdDate = randomDate(new Date(2023, 0, 1), new Date());
        // Для завершенных запросов указываем дату завершения
        let completedAt = null;
        if (status === 'completed') {
            completedAt = new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
        }
        const requestedBy = getRandomElement(users.filter(u => u.levelOfAccess === 'Сотрудник'));
        let approvedBy = null;
        if (status === 'approved' || status === 'completed') {
            approvedBy = getRandomElement(users.filter(u => u.levelOfAccess === 'Администратор'))._id;
        }
        const transfer = {
            productId: yield Product_1.default.findById(batch.product),
            batchId: batch._id,
            quantity: Math.floor(Math.random() * (batch.quantity - 1)) + 1,
            fromZoneId: fromZone._id,
            toZoneId: toZone._id,
            requestedBy: requestedBy._id,
            status,
            approvedBy,
            reason: getRandomElement(reasons),
            priority,
            createdAt: createdDate,
            completedAt,
            updatedAt: new Date()
        };
        transferRequests.push(transfer);
    }
    const result = yield ZoneTransferRequest_1.default.insertMany(transferRequests);
    console.log(`Создано ${transferRequests.length} запросов на перемещение ✅`);
    return transferRequests;
});
// Run the initialization
initDatabase();
