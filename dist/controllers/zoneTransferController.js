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
exports.executeTransferRequest = exports.rejectTransferRequest = exports.approveTransferRequest = exports.getZoneTransferRequests = exports.getTransferRequests = exports.createTransferRequest = void 0;
const ZoneTransferRequest_1 = __importDefault(require("../models/ZoneTransferRequest"));
const Zone_1 = __importDefault(require("../models/Zone"));
const Product_1 = __importDefault(require("../models/Product"));
const Batch_1 = __importDefault(require("../models/Batch"));
const ProductMovement_1 = __importDefault(require("../models/ProductMovement"));
const InventoryAlert_1 = __importDefault(require("../models/InventoryAlert"));
// Создание запроса на перемещение товара между зонами
const createTransferRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { productId, batchId, quantity, fromZoneId, toZoneId, priority, reason } = req.body;
        const requestedBy = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!requestedBy) {
            return res.status(401).json({ message: "Необходима авторизация" });
        }
        // Проверяем существование продукта, партии и зон
        const [product, batch, fromZone, toZone] = yield Promise.all([
            Product_1.default.findById(productId),
            Batch_1.default.findById(batchId),
            Zone_1.default.findById(fromZoneId),
            Zone_1.default.findById(toZoneId)
        ]);
        if (!product) {
            return res.status(404).json({ message: "Продукт не найден" });
        }
        if (!batch) {
            return res.status(404).json({ message: "Партия не найдена" });
        }
        if (!fromZone) {
            return res.status(404).json({ message: "Исходная зона не найдена" });
        }
        if (!toZone) {
            return res.status(404).json({ message: "Целевая зона не найдена" });
        }
        // Проверяем доступность товара в исходной зоне
        if (batch.quantity < quantity) {
            return res.status(400).json({ message: "Недостаточное количество товара в партии" });
        }
        // Проверяем наличие места в целевой зоне
        if (!toZone.hasAvailableSpace(quantity)) {
            return res.status(400).json({ message: "Недостаточно места в целевой зоне" });
        }
        // Для товаров с особыми условиями хранения проверяем соответствие целевой зоны
        if (product.storageConditions && (product.storageConditions.temperature !== undefined ||
            product.storageConditions.humidity !== undefined)) {
            const tempRequirement = product.storageConditions.temperature;
            const humidityRequirement = product.storageConditions.humidity;
            // Проверка соответствия условий хранения
            if (!toZone.meetsStorageRequirements(tempRequirement, humidityRequirement)) {
                // Создаем предупреждение, но позволяем продолжить
                const alert = new InventoryAlert_1.default({
                    type: 'quality_issue',
                    productId,
                    zoneId: toZoneId,
                    message: `Несоответствие условий хранения для товара "${product.name}" в зоне "${toZone.name}"`,
                    level: 'warning'
                });
                yield alert.save();
            }
        }
        // Создаем запрос на перемещение
        const transferRequest = new ZoneTransferRequest_1.default({
            productId,
            batchId,
            quantity,
            fromZoneId,
            toZoneId,
            requestedBy,
            priority: priority || 'normal',
            reason
        });
        yield transferRequest.save();
        res.status(201).json({
            message: "Запрос на перемещение товара успешно создан",
            transferRequest
        });
    }
    catch (error) {
        console.error("Ошибка при создании запроса на перемещение:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.createTransferRequest = createTransferRequest;
// Получение всех запросов на перемещение
const getTransferRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Фильтры
        const filters = {};
        if (req.query.status) {
            filters.status = req.query.status;
        }
        if (req.query.fromZoneId) {
            filters.fromZoneId = req.query.fromZoneId;
        }
        if (req.query.toZoneId) {
            filters.toZoneId = req.query.toZoneId;
        }
        if (req.query.priority) {
            filters.priority = req.query.priority;
        }
        // Подсчет общего количества запросов
        const totalCount = yield ZoneTransferRequest_1.default.countDocuments(filters);
        // Получение запросов
        const requests = yield ZoneTransferRequest_1.default.find(filters)
            .sort({ priority: -1, createdAt: 1 })
            .populate('productId', 'name description')
            .populate('batchId', 'batchNumber manufacturingDate expiryDate')
            .populate('fromZoneId', 'name type')
            .populate('toZoneId', 'name type')
            .populate('requestedBy', 'username')
            .populate('approvedBy', 'username')
            .skip(skip)
            .limit(limit);
        res.json({
            totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
            requests
        });
    }
    catch (error) {
        console.error("Ошибка при получении запросов на перемещение:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.getTransferRequests = getTransferRequests;
// Получение запросов на перемещение для конкретной зоны
const getZoneTransferRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { zoneId } = req.params;
        const requests = yield ZoneTransferRequest_1.default.getRequestsByZone(zoneId);
        res.json(requests);
    }
    catch (error) {
        console.error("Ошибка при получении запросов на перемещение для зоны:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.getZoneTransferRequests = getZoneTransferRequests;
// Подтверждение запроса на перемещение
const approveTransferRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            return res.status(401).json({ message: "Необходима авторизация" });
        }
        const transferRequest = yield ZoneTransferRequest_1.default.findById(id);
        if (!transferRequest) {
            return res.status(404).json({ message: "Запрос на перемещение не найден" });
        }
        if (transferRequest.status !== 'pending') {
            return res.status(400).json({ message: `Запрос уже ${transferRequest.status}` });
        }
        // Подтверждаем запрос
        yield transferRequest.approve(userId);
        res.json({
            message: "Запрос на перемещение подтвержден",
            transferRequest
        });
    }
    catch (error) {
        console.error("Ошибка при подтверждении запроса на перемещение:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.approveTransferRequest = approveTransferRequest;
// Отклонение запроса на перемещение
const rejectTransferRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            return res.status(401).json({ message: "Необходима авторизация" });
        }
        const transferRequest = yield ZoneTransferRequest_1.default.findById(id);
        if (!transferRequest) {
            return res.status(404).json({ message: "Запрос на перемещение не найден" });
        }
        if (transferRequest.status !== 'pending') {
            return res.status(400).json({ message: `Запрос уже ${transferRequest.status}` });
        }
        // Отклоняем запрос
        yield transferRequest.reject(userId, reason);
        res.json({
            message: "Запрос на перемещение отклонен",
            transferRequest
        });
    }
    catch (error) {
        console.error("Ошибка при отклонении запроса на перемещение:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.rejectTransferRequest = rejectTransferRequest;
// Выполнение запроса на перемещение
const executeTransferRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            return res.status(401).json({ message: "Необходима авторизация" });
        }
        const transferRequest = yield ZoneTransferRequest_1.default.findById(id)
            .populate('productId')
            .populate('batchId')
            .populate('fromZoneId')
            .populate('toZoneId');
        if (!transferRequest) {
            return res.status(404).json({ message: "Запрос на перемещение не найден" });
        }
        if (transferRequest.status !== 'approved') {
            return res.status(400).json({
                message: `Запрос не может быть выполнен, текущий статус: ${transferRequest.status}`
            });
        }
        // Проверяем доступность товара и места снова (на случай изменений с момента одобрения)
        const { batchId, fromZoneId, toZoneId, quantity } = transferRequest;
        const batch = yield Batch_1.default.findById(batchId);
        if (!batch) {
            return res.status(404).json({ message: "Партия не найдена" });
        }
        if (batch.quantity < quantity) {
            return res.status(400).json({ message: "Недостаточное количество товара в партии" });
        }
        const toZone = yield Zone_1.default.findById(toZoneId);
        if (!toZone) {
            return res.status(404).json({ message: "Целевая зона не найдена" });
        }
        if (!toZone.hasAvailableSpace(quantity)) {
            return res.status(400).json({ message: "Недостаточно места в целевой зоне" });
        }
        const fromZone = yield Zone_1.default.findById(fromZoneId);
        if (!fromZone) {
            return res.status(404).json({ message: "Исходная зона не найдена" });
        }
        // Создаем запись о перемещении товара
        const movement = new ProductMovement_1.default({
            product: transferRequest.productId,
            batch: transferRequest.batchId,
            type: 'transfer',
            quantity: transferRequest.quantity,
            fromZone: transferRequest.fromZoneId,
            toZone: transferRequest.toZoneId,
            performedBy: userId,
            reason: transferRequest.reason,
            reference: `Transfer Request #${transferRequest._id}`
        });
        yield movement.save();
        // Обновляем занятость зон
        yield fromZone.updateOccupancy(-transferRequest.quantity);
        yield toZone.updateOccupancy(transferRequest.quantity);
        // Помечаем запрос как выполненный
        yield transferRequest.complete();
        res.json({
            message: "Запрос на перемещение успешно выполнен",
            transferRequest,
            movement
        });
    }
    catch (error) {
        console.error("Ошибка при выполнении запроса на перемещение:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.executeTransferRequest = executeTransferRequest;
