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
exports.getZoneExpiringProducts = exports.deleteExpiryTracking = exports.updateExpiryTracking = exports.createExpiryTracking = exports.getExpiringSoonProducts = void 0;
const ExpiryTracking_1 = __importDefault(require("../models/ExpiryTracking"));
const Product_1 = __importDefault(require("../models/Product"));
const Batch_1 = __importDefault(require("../models/Batch"));
const Zone_1 = __importDefault(require("../models/Zone"));
const InventoryAlert_1 = __importDefault(require("../models/InventoryAlert"));
// Получение товаров с истекающим сроком годности
const getExpiringSoonProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const days = parseInt(req.query.days) || 30;
        const expiringProducts = yield ExpiryTracking_1.default.findExpiringSoon(days);
        res.json({
            count: expiringProducts.length,
            expiringProducts
        });
    }
    catch (error) {
        console.error("Ошибка при получении товаров с истекающим сроком:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.getExpiringSoonProducts = getExpiringSoonProducts;
// Создание записи о сроке годности
const createExpiryTracking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId, batchId, zoneId, quantity } = req.body;
        // Проверяем существование продукта, партии и зоны
        const [product, batch, zone] = yield Promise.all([
            Product_1.default.findById(productId),
            Batch_1.default.findById(batchId),
            Zone_1.default.findById(zoneId)
        ]);
        if (!product) {
            return res.status(404).json({ message: "Продукт не найден" });
        }
        if (!batch) {
            return res.status(404).json({ message: "Партия не найдена" });
        }
        if (!zone) {
            return res.status(404).json({ message: "Зона не найдена" });
        }
        // Создаем запись о сроке годности
        const expiryTracking = new ExpiryTracking_1.default({
            productId,
            batchId,
            expiryDate: batch.expiryDate,
            zoneId,
            quantity
        });
        yield expiryTracking.save();
        // Проверяем, не истекает ли скоро срок годности
        const now = new Date();
        const expiryDate = new Date(batch.expiryDate);
        const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        // Если срок годности менее 30 дней, создаем предупреждение
        if (daysUntilExpiry <= 30) {
            const level = daysUntilExpiry <= 7 ? 'critical' : (daysUntilExpiry <= 15 ? 'warning' : 'info');
            // Создаем уведомление
            const alert = new InventoryAlert_1.default({
                type: 'expiring_soon',
                productId,
                batchId,
                zoneId,
                message: `Товар "${product.name}" (партия ${batch.batchNumber}) истекает через ${daysUntilExpiry} дней`,
                level
            });
            yield alert.save();
        }
        res.status(201).json({
            message: "Запись о сроке годности успешно создана",
            expiryTracking
        });
    }
    catch (error) {
        console.error("Ошибка при создании записи о сроке годности:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.createExpiryTracking = createExpiryTracking;
// Обновление записи о сроке годности
const updateExpiryTracking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { quantity, notificationSent } = req.body;
        const expiryTracking = yield ExpiryTracking_1.default.findById(id);
        if (!expiryTracking) {
            return res.status(404).json({ message: "Запись не найдена" });
        }
        // Обновляем поля
        if (quantity !== undefined) {
            expiryTracking.quantity = quantity;
        }
        if (notificationSent !== undefined) {
            expiryTracking.notificationSent = notificationSent;
        }
        yield expiryTracking.save();
        res.json({
            message: "Запись о сроке годности успешно обновлена",
            expiryTracking
        });
    }
    catch (error) {
        console.error("Ошибка при обновлении записи о сроке годности:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.updateExpiryTracking = updateExpiryTracking;
// Удаление записи о сроке годности
const deleteExpiryTracking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const expiryTracking = yield ExpiryTracking_1.default.findByIdAndDelete(id);
        if (!expiryTracking) {
            return res.status(404).json({ message: "Запись не найдена" });
        }
        res.json({ message: "Запись о сроке годности успешно удалена" });
    }
    catch (error) {
        console.error("Ошибка при удалении записи о сроке годности:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.deleteExpiryTracking = deleteExpiryTracking;
// Получение товаров с истекающим сроком годности для конкретной зоны
const getZoneExpiringProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { zoneId } = req.params;
        const days = parseInt(req.query.days) || 30;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);
        const expiringProducts = yield ExpiryTracking_1.default.find({
            zoneId,
            expiryDate: { $lte: expiryDate }
        })
            .populate('productId', 'name description')
            .populate('batchId', 'batchNumber manufacturingDate')
            .populate('zoneId', 'name type');
        res.json({
            count: expiringProducts.length,
            expiringProducts
        });
    }
    catch (error) {
        console.error("Ошибка при получении товаров с истекающим сроком для зоны:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.getZoneExpiringProducts = getZoneExpiringProducts;
