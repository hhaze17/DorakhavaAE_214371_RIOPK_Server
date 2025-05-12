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
exports.updateBatchQuantity = exports.sellBatch = exports.moveBatch = exports.getExpiringBatches = exports.getBatchesByZone = exports.getBatchesByProduct = exports.deleteBatch = exports.updateBatch = exports.getBatchById = exports.getBatches = exports.createBatch = void 0;
const Batch_1 = __importDefault(require("../models/Batch"));
const Product_1 = __importDefault(require("../models/Product"));
const Zone_1 = __importDefault(require("../models/Zone"));
const productMovementModel_1 = require("../models/productMovementModel");
const createBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        // Проверка существования продукта
        const product = yield Product_1.default.findById(body.product);
        if (!product) {
            return res.status(404).json({ message: 'Продукт не найден' });
        }
        // Проверка существования зоны
        const zone = yield Zone_1.default.findById(body.zone);
        if (!zone) {
            return res.status(404).json({ message: 'Зона не найдена' });
        }
        // Проверка доступного места в зоне
        if (zone.currentOccupancy + body.quantity > zone.capacity) {
            return res.status(400).json({ message: 'Недостаточно места в зоне' });
        }
        const batch = yield Batch_1.default.create(body);
        // Создание записи о движении
        const movement = new productMovementModel_1.ProductMovement({
            product: body.product,
            fromZone: null,
            toZone: body.zone,
            quantity: body.quantity,
            type: 'transfer',
            date: new Date(),
        });
        yield movement.save();
        // Обновление количества продукта
        yield Product_1.default.findByIdAndUpdate(body.product, {
            $inc: { quantity: body.quantity }
        });
        // Обновление занятости зоны
        yield Zone_1.default.findByIdAndUpdate(body.zone, {
            $inc: { currentOccupancy: body.quantity }
        });
        res.status(201).json(batch);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.createBatch = createBatch;
const getBatches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const batches = yield Batch_1.default.find()
            .populate('product', 'name brandName model')
            .populate('zone', 'name type');
        res.json(batches);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.getBatches = getBatches;
const getBatchById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const batch = yield Batch_1.default.findById(req.params.id)
            .populate('product', 'name brandName model')
            .populate('zone', 'name type');
        if (!batch) {
            return res.status(404).json({ message: 'Партия не найдена' });
        }
        res.json(batch);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.getBatchById = getBatchById;
const updateBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const batch = yield Batch_1.default.findByIdAndUpdate(req.params.id, body, { new: true }).populate('product', 'name brandName model')
            .populate('zone', 'name type');
        if (!batch) {
            return res.status(404).json({ message: 'Партия не найдена' });
        }
        res.json(batch);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.updateBatch = updateBatch;
const deleteBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const batch = yield Batch_1.default.findByIdAndDelete(req.params.id);
        if (!batch) {
            return res.status(404).json({ message: 'Партия не найдена' });
        }
        // Обновление количества продукта
        yield Product_1.default.findByIdAndUpdate(batch.product, {
            $inc: { quantity: -batch.quantity }
        });
        // Обновление занятости зоны
        yield Zone_1.default.findByIdAndUpdate(batch.zone, {
            $inc: { currentOccupancy: -batch.quantity }
        });
        res.json({ message: 'Партия успешно удалена' });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.deleteBatch = deleteBatch;
const getBatchesByProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const batches = yield Batch_1.default.find({ product: req.params.productId })
            .populate('zone', 'name type');
        res.json(batches);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.getBatchesByProduct = getBatchesByProduct;
const getBatchesByZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const batches = yield Batch_1.default.find({ zone: req.params.zoneId })
            .populate('product', 'name brandName model');
        res.json(batches);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.getBatchesByZone = getBatchesByZone;
const getExpiringBatches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { days } = req.query;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + Number(days));
        const batches = yield Batch_1.default.find({
            expiryDate: { $lte: expiryDate },
            status: 'active'
        });
        res.status(200).json(batches);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getExpiringBatches = getExpiringBatches;
const moveBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchId, toZone } = req.body;
        const batch = yield Batch_1.default.findById(batchId);
        if (!batch) {
            return res.status(404).json({ message: 'Партия не найдена' });
        }
        const zone = yield Zone_1.default.findById(toZone);
        if (!zone) {
            return res.status(404).json({ message: 'Зона не найдена' });
        }
        // Проверка вместимости зоны
        if (zone.currentOccupancy + batch.quantity > zone.capacity) {
            return res.status(400).json({ message: 'Недостаточно места в зоне' });
        }
        // Создание записи о движении
        const movement = new productMovementModel_1.ProductMovement({
            product: batch.product,
            fromZone: batch.zone,
            toZone: toZone,
            quantity: batch.quantity,
            type: 'transfer',
            date: new Date(),
        });
        yield movement.save();
        // Обновление зон
        const oldZone = yield Zone_1.default.findById(batch.zone);
        if (oldZone) {
            oldZone.currentOccupancy -= batch.quantity;
            yield oldZone.save();
        }
        zone.currentOccupancy += batch.quantity;
        yield zone.save();
        // Обновление партии
        batch.zone = toZone;
        yield batch.save();
        res.json({ message: 'Партия успешно перемещена', batch });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка при перемещении партии', error });
    }
});
exports.moveBatch = moveBatch;
const sellBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchId } = req.params;
        const batch = yield Batch_1.default.findById(batchId);
        if (!batch) {
            return res.status(404).json({ message: 'Партия не найдена' });
        }
        // Создание записи о движении
        const movement = new productMovementModel_1.ProductMovement({
            product: batch.product,
            fromZone: batch.zone,
            toZone: null,
            quantity: batch.quantity,
            type: 'sale',
            date: new Date(),
        });
        yield movement.save();
        // Обновление зоны
        const zone = yield Zone_1.default.findById(batch.zone);
        if (zone) {
            zone.currentOccupancy -= batch.quantity;
            yield zone.save();
        }
        // Обновление количества продукта
        yield Product_1.default.findByIdAndUpdate(batch.product, {
            $inc: { quantity: -batch.quantity }
        });
        // Обновление партии
        batch.status = 'depleted';
        yield batch.save();
        res.json({ message: 'Партия успешно продана', batch });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка при продаже партии', error });
    }
});
exports.sellBatch = sellBatch;
const updateBatchQuantity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quantity } = req.body;
        const batch = yield Batch_1.default.findById(req.params.id);
        if (!batch) {
            return res.status(404).json({ message: 'Партия не найдена' });
        }
        const quantityDiff = quantity - batch.quantity;
        // Проверка доступного места в зоне
        const zone = yield Zone_1.default.findById(batch.zone);
        if (!zone) {
            return res.status(404).json({ message: 'Зона не найдена' });
        }
        if (zone.currentOccupancy + quantityDiff > zone.capacity) {
            return res.status(400).json({ message: 'Недостаточно места в зоне' });
        }
        // Создание записи о движении
        const movement = new productMovementModel_1.ProductMovement({
            product: batch.product,
            fromZone: batch.zone,
            toZone: batch.zone,
            quantity: quantityDiff,
            type: 'transfer',
            date: new Date(),
        });
        yield movement.save();
        // Обновление партии
        batch.quantity = quantity;
        if (quantity === 0) {
            batch.status = 'depleted';
        }
        yield batch.save();
        // Обновление количества продукта
        yield Product_1.default.findByIdAndUpdate(batch.product, {
            $inc: { quantity: quantityDiff }
        });
        // Обновление занятости зоны
        yield Zone_1.default.findByIdAndUpdate(batch.zone, {
            $inc: { currentOccupancy: quantityDiff }
        });
        res.json(batch);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.updateBatchQuantity = updateBatchQuantity;
