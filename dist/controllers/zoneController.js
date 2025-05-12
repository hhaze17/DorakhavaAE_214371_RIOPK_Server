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
exports.createZoneByTemplate = exports.checkPickupZoneStatus = exports.checkReceivingZoneCapacity = exports.getFifoBatches = exports.checkSalesZoneInventory = exports.updateZoneOccupancy = exports.getZonesByType = exports.deleteZone = exports.updateZone = exports.getZoneById = exports.getZones = exports.createZone = void 0;
const Zone_1 = __importDefault(require("../models/Zone"));
const Product_1 = __importDefault(require("../models/Product"));
const Batch_1 = __importDefault(require("../models/Batch"));
const mongoose_1 = __importDefault(require("mongoose"));
const createZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const zone = yield Zone_1.default.create(body);
        res.status(201).json(zone);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.createZone = createZone;
const getZones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const zones = yield Zone_1.default.find();
        res.json(zones);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.getZones = getZones;
const getZoneById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const zone = yield Zone_1.default.findById(req.params.id);
        if (!zone) {
            return res.status(404).json({ message: 'Зона не найдена' });
        }
        res.json(zone);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.getZoneById = getZoneById;
const updateZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const zone = yield Zone_1.default.findByIdAndUpdate(req.params.id, body, { new: true });
        if (!zone) {
            return res.status(404).json({ message: 'Зона не найдена' });
        }
        res.json(zone);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.updateZone = updateZone;
const deleteZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const zone = yield Zone_1.default.findByIdAndDelete(req.params.id);
        if (!zone) {
            return res.status(404).json({ message: 'Зона не найдена' });
        }
        res.json({ message: 'Зона успешно удалена' });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.deleteZone = deleteZone;
const getZonesByType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const zones = yield Zone_1.default.find({ type: req.params.type });
        res.json(zones);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.getZonesByType = getZonesByType;
const updateZoneOccupancy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { occupancy } = req.body;
        const zone = yield Zone_1.default.findByIdAndUpdate(req.params.id, { $inc: { currentOccupancy: occupancy } }, { new: true });
        if (!zone) {
            return res.status(404).json({ message: 'Зона не найдена' });
        }
        res.json(zone);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.updateZoneOccupancy = updateZoneOccupancy;
// Новые методы для работы с зонами
// Проверка товаров, которые нуждаются в пополнении (для торгового зала)
const checkSalesZoneInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const salesZone = yield Zone_1.default.findById(req.params.id);
        if (!salesZone || salesZone.type !== 'sales') {
            return res.status(400).json({ message: 'Не торговая зона' });
        }
        const products = yield Product_1.default.find({ zone: salesZone._id });
        const lowStockProducts = products.filter(product => { var _a; return product.quantity <= (((_a = salesZone.salesZoneConfig) === null || _a === void 0 ? void 0 : _a.minStockThreshold) || 5); });
        res.json({
            zoneId: salesZone._id,
            zoneName: salesZone.name,
            lowStockProducts: lowStockProducts.map(p => {
                var _a;
                return ({
                    id: p._id,
                    name: p.name,
                    currentQuantity: p.quantity,
                    minThreshold: ((_a = salesZone.salesZoneConfig) === null || _a === void 0 ? void 0 : _a.minStockThreshold) || 5
                });
            })
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.checkSalesZoneInventory = checkSalesZoneInventory;
// Получение партий товаров по принципу FIFO (для склада)
const getFifoBatches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const warehouseZone = yield Zone_1.default.findById(req.params.id);
        if (!warehouseZone || warehouseZone.type !== 'warehouse') {
            return res.status(400).json({ message: 'Не складская зона' });
        }
        const batches = yield Batch_1.default.find({ zone: warehouseZone._id })
            .sort({ manufacturingDate: 1 }) // Сортировка по дате производства (старые первыми)
            .limit(20)
            .populate('product', 'name'); // Добавляем информацию о продукте
        res.json({
            zoneId: warehouseZone._id,
            zoneName: warehouseZone.name,
            batches: batches
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.getFifoBatches = getFifoBatches;
// Проверка заполненности зоны приемки
const checkReceivingZoneCapacity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const receivingZone = yield Zone_1.default.findById(req.params.id);
        if (!receivingZone || receivingZone.type !== 'receiving') {
            return res.status(400).json({ message: 'Не зона приемки' });
        }
        const currentCapacity = receivingZone.currentOccupancy;
        const maxCapacity = receivingZone.capacity;
        const availableSpace = maxCapacity - currentCapacity;
        const dailyCapacity = ((_a = receivingZone.receivingConfig) === null || _a === void 0 ? void 0 : _a.maxDailyCapacity) || maxCapacity;
        res.json({
            zoneId: receivingZone._id,
            zoneName: receivingZone.name,
            currentOccupancy: currentCapacity,
            capacity: maxCapacity,
            availableSpace: availableSpace,
            dailyCapacity: dailyCapacity,
            canReceiveMore: availableSpace > 0,
            hasQualityControl: ((_b = receivingZone.receivingConfig) === null || _b === void 0 ? void 0 : _b.hasQualityControl) || false,
            occupancyPercentage: Math.round((currentCapacity / maxCapacity) * 100)
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.checkReceivingZoneCapacity = checkReceivingZoneCapacity;
// Проверка статуса заказов в зоне самовывоза
const checkPickupZoneStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const pickupZone = yield Zone_1.default.findById(req.params.id);
        if (!pickupZone || pickupZone.type !== 'pickup') {
            return res.status(400).json({ message: 'Не зона самовывоза' });
        }
        // Получаем все онлайн-заказы, связанные с этой зоной самовывоза
        const onlineOrders = yield mongoose_1.default.model('OnlineOrder').find({
            pickupZone: pickupZone._id,
            status: { $in: ['reserved', 'ready', 'pending'] }
        }).populate('customer', 'firstName lastName');
        // Обрабатываем заказы
        const orders = onlineOrders.map(order => {
            var _a;
            const reservedUntil = new Date(order.createdAt);
            reservedUntil.setHours(reservedUntil.getHours() + (((_a = pickupZone.pickupConfig) === null || _a === void 0 ? void 0 : _a.maxWaitingTime) || 48));
            return {
                _id: order._id,
                orderNumber: order.orderNumber,
                reservedUntil: reservedUntil,
                status: order.status,
                customer: {
                    name: order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Н/Д'
                },
                items: order.items.map((item) => ({
                    productName: item.productName,
                    quantity: item.quantity
                }))
            };
        });
        // Разделяем на просроченные и активные
        const now = new Date();
        const expiredOrders = orders.filter(order => new Date(order.reservedUntil) < now);
        const activeOrders = orders.filter(order => new Date(order.reservedUntil) >= now);
        res.json({
            zoneId: pickupZone._id,
            zoneName: pickupZone.name,
            orders: orders,
            expiredOrders: expiredOrders,
            activeOrders: activeOrders,
            requiresIdentification: ((_a = pickupZone.pickupConfig) === null || _a === void 0 ? void 0 : _a.requiresIdentification) || true,
            maxWaitingTime: ((_b = pickupZone.pickupConfig) === null || _b === void 0 ? void 0 : _b.maxWaitingTime) || 48
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.checkPickupZoneStatus = checkPickupZoneStatus;
// Создание зоны по шаблону
const createZoneByTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, name, capacity } = req.body;
        if (!type || !name || !capacity) {
            return res.status(400).json({ message: 'Необходимо указать тип, название и вместимость зоны' });
        }
        let zoneData = {
            name,
            type,
            capacity,
            currentOccupancy: 0,
            // Стандартные условия хранения
            temperature: 20,
            humidity: 50,
            status: 'active'
        };
        // Добавляем специфичные настройки в зависимости от типа зоны
        switch (type) {
            case 'sales':
                zoneData.salesZoneConfig = {
                    minStockThreshold: 5,
                    isPromoZone: false
                };
                // Торговая зона имеет комнатную температуру и среднюю влажность
                zoneData.temperature = 22;
                zoneData.humidity = 45;
                break;
            case 'warehouse':
                zoneData.warehouseConfig = {
                    storageConditions: {
                        specialRequirements: 'Обычные условия хранения'
                    },
                    fifoEnabled: true
                };
                // Склад может иметь более прохладную температуру для лучшего хранения
                zoneData.temperature = 18;
                zoneData.humidity = 50;
                break;
            case 'receiving':
                zoneData.receivingConfig = {
                    hasQualityControl: true,
                    maxDailyCapacity: capacity // По умолчанию равно общей вместимости
                };
                // Зона приемки - обычные условия
                zoneData.temperature = 20;
                zoneData.humidity = 50;
                break;
            case 'cashier':
                zoneData.cashierConfig = {
                    hasReturnsProcessing: true,
                    hasExpressCheckout: false
                };
                // Кассовая зона - комнатная температура
                zoneData.temperature = 22;
                zoneData.humidity = 45;
                break;
            case 'returns':
                zoneData.returnsConfig = {
                    requiresInspection: true,
                    maxStorageDays: 30
                };
                // Зона возвратов - обычные условия
                zoneData.temperature = 20;
                zoneData.humidity = 50;
                break;
            case 'pickup':
                zoneData.pickupConfig = {
                    maxWaitingTime: 48,
                    requiresIdentification: true
                };
                // Зона самовывоза - комнатная температура
                zoneData.temperature = 22;
                zoneData.humidity = 45;
                break;
            default:
                return res.status(400).json({ message: 'Неизвестный тип зоны' });
        }
        const zone = yield Zone_1.default.create(zoneData);
        res.status(201).json(zone);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.createZoneByTemplate = createZoneByTemplate;
