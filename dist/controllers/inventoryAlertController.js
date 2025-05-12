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
exports.getResolvedAlerts = exports.resolveAlert = exports.getAlertsByProduct = exports.getAlertsByZone = exports.createAlert = exports.getActiveAlerts = void 0;
const InventoryAlert_1 = __importDefault(require("../models/InventoryAlert"));
const Zone_1 = __importDefault(require("../models/Zone"));
const Product_1 = __importDefault(require("../models/Product"));
// Получение всех активных уведомлений
const getActiveAlerts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Фильтры
        const filters = { isResolved: false };
        if (req.query.type) {
            filters.type = req.query.type;
        }
        if (req.query.level) {
            filters.level = req.query.level;
        }
        if (req.query.zoneId) {
            filters.zoneId = req.query.zoneId;
        }
        if (req.query.productId) {
            filters.productId = req.query.productId;
        }
        // Подсчет общего количества уведомлений
        const totalCount = yield InventoryAlert_1.default.countDocuments(filters);
        // Получение уведомлений
        const alerts = yield InventoryAlert_1.default.find(filters)
            .sort({ level: -1, createdAt: -1 }) // Сначала критические, затем по дате
            .populate('productId', 'name')
            .populate('batchId', 'batchNumber')
            .populate('zoneId', 'name type')
            .skip(skip)
            .limit(limit);
        res.json({
            totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
            alerts
        });
    }
    catch (error) {
        console.error("Ошибка при получении уведомлений:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.getActiveAlerts = getActiveAlerts;
// Создание нового уведомления
const createAlert = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, productId, batchId, zoneId, message, level } = req.body;
        // Проверка зоны
        if (!zoneId) {
            return res.status(400).json({ message: "Необходимо указать зону (zoneId)" });
        }
        const zone = yield Zone_1.default.findById(zoneId);
        if (!zone) {
            return res.status(404).json({ message: "Зона не найдена" });
        }
        // Дополнительные проверки для товаров
        if (productId) {
            const product = yield Product_1.default.findById(productId);
            if (!product) {
                return res.status(404).json({ message: "Товар не найден" });
            }
        }
        // Создание уведомления
        const alert = new InventoryAlert_1.default({
            type,
            productId,
            batchId,
            zoneId,
            message,
            level: level || 'info'
        });
        yield alert.save();
        res.status(201).json({
            message: "Уведомление успешно создано",
            alert
        });
    }
    catch (error) {
        console.error("Ошибка при создании уведомления:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.createAlert = createAlert;
// Получение уведомлений по зоне
const getAlertsByZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { zoneId } = req.params;
        const alerts = yield InventoryAlert_1.default.getAlertsByZone(zoneId);
        res.json(alerts);
    }
    catch (error) {
        console.error("Ошибка при получении уведомлений по зоне:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.getAlertsByZone = getAlertsByZone;
// Получение уведомлений по продукту
const getAlertsByProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        const alerts = yield InventoryAlert_1.default.getAlertsByProduct(productId);
        res.json(alerts);
    }
    catch (error) {
        console.error("Ошибка при получении уведомлений по продукту:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.getAlertsByProduct = getAlertsByProduct;
// Разрешение уведомления
const resolveAlert = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            return res.status(401).json({ message: "Необходима авторизация" });
        }
        const alert = yield InventoryAlert_1.default.findById(id);
        if (!alert) {
            return res.status(404).json({ message: "Уведомление не найдено" });
        }
        if (alert.isResolved) {
            return res.status(400).json({ message: "Уведомление уже разрешено" });
        }
        yield alert.resolve(userId);
        res.json({
            message: "Уведомление помечено как разрешенное",
            alert
        });
    }
    catch (error) {
        console.error("Ошибка при разрешении уведомления:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.resolveAlert = resolveAlert;
// Получение истории разрешенных уведомлений
const getResolvedAlerts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Фильтры
        const filters = { isResolved: true };
        if (req.query.type) {
            filters.type = req.query.type;
        }
        if (req.query.zoneId) {
            filters.zoneId = req.query.zoneId;
        }
        // Подсчет общего количества разрешенных уведомлений
        const totalCount = yield InventoryAlert_1.default.countDocuments(filters);
        // Получение уведомлений
        const alerts = yield InventoryAlert_1.default.find(filters)
            .sort({ resolvedAt: -1 })
            .populate('productId', 'name')
            .populate('batchId', 'batchNumber')
            .populate('zoneId', 'name type')
            .populate('resolvedBy', 'username')
            .skip(skip)
            .limit(limit);
        res.json({
            totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
            alerts
        });
    }
    catch (error) {
        console.error("Ошибка при получении разрешенных уведомлений:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.getResolvedAlerts = getResolvedAlerts;
