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
exports.deleteSaleController = exports.updateSaleController = exports.getSaleById = exports.createSaleController = exports.getAllSalesController = void 0;
const Sale_1 = __importDefault(require("../models/Sale"));
const StoreInventory_1 = __importDefault(require("../models/StoreInventory"));
const getAllSalesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const ITEMS_PER_PAGE = 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        // Формируем запрос в зависимости от роли и магазина пользователя
        let query = {};
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.levelOfAccess) === 'Сотрудник' && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.store)) {
            query = { nameOfStore: req.user.store };
        }
        const [count, items] = yield Promise.all([
            Sale_1.default.countDocuments(query),
            Sale_1.default.find(query)
                .sort({ dateOfTransaction: -1 })
                .skip(skip)
                .limit(ITEMS_PER_PAGE)
        ]);
        const pageCount = Math.ceil(count / ITEMS_PER_PAGE);
        res.json({
            pagination: {
                count,
                pageCount
            },
            items
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllSalesController = getAllSalesController;
const createSaleController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { productId, quantity } = req.body;
        // Проверяем наличие товара в магазине
        const query = {
            store: (_a = req.user) === null || _a === void 0 ? void 0 : _a.store,
            productId
        };
        const existingProduct = yield StoreInventory_1.default.findOne(query);
        if (!existingProduct) {
            return res.status(404).json({ message: "Товар не найден" });
        }
        if (quantity > existingProduct.quantity) {
            return res.status(400).json({ message: "Недостаточное количество товара" });
        }
        // Извлекаем числовое значение цены, убирая " BYN" из строки
        const priceValue = parseFloat(existingProduct.storePrice.replace(" BYN", ""));
        const totalPrice = (priceValue * quantity).toFixed(2) + " BYN";
        // Обновляем количество товара в магазине
        yield StoreInventory_1.default.findByIdAndUpdate(existingProduct._id, {
            $inc: { quantity: -quantity },
            updatedAt: new Date()
        });
        // Создаем запись о продаже
        const sale = yield Sale_1.default.create({
            dateOfTransaction: new Date(),
            productId,
            brandName: existingProduct.brandName,
            description: existingProduct.description,
            model: existingProduct.model,
            quantity,
            totalPrice,
            nameOfStore: existingProduct.store,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        res.status(201).json(sale);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createSaleController = createSaleController;
const getSaleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sale = yield Sale_1.default.findById(req.params.id);
        if (!sale) {
            return res.status(404).json({ message: "Продажа не найдена" });
        }
        res.json(sale);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getSaleById = getSaleById;
const updateSaleController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sale = yield Sale_1.default.findByIdAndUpdate(req.params.id, Object.assign(Object.assign({}, req.body), { updatedAt: new Date() }), { new: true });
        if (!sale) {
            return res.status(404).json({ message: "Продажа не найдена" });
        }
        res.json(sale);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateSaleController = updateSaleController;
const deleteSaleController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sale = yield Sale_1.default.findByIdAndDelete(req.params.id);
        if (!sale) {
            return res.status(404).json({ message: "Продажа не найдена" });
        }
        res.json({ message: "Продажа успешно удалена" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteSaleController = deleteSaleController;
