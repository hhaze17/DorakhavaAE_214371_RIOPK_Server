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
exports.searchProducts = exports.updateProductQuantity = exports.updateProductStatus = exports.moveProduct = exports.getLowStockProducts = exports.getProductsByZone = exports.getProductsByCategory = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = exports.getAllProductsController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Product_1 = __importDefault(require("../models/Product"));
const ProductMovement_1 = __importDefault(require("../models/ProductMovement"));
const getAllProductsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ITEMS_PER_PAGE = 5;
        const page = req.query.page || 1;
        const query = {};
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const countPromise = Product_1.default.estimatedDocumentCount(query);
        const itemsPromise = Product_1.default.find(query).limit(ITEMS_PER_PAGE).skip(skip);
        const [count, items] = yield Promise.all([countPromise, itemsPromise]);
        const pageCount = count / ITEMS_PER_PAGE;
        const result = pageCount - Math.floor(pageCount);
        return res.status(200).json({
            pagination: {
                count,
                pageCount: result > 0 ? Math.trunc(pageCount) + 1 : pageCount,
            },
            items,
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.getAllProductsController = getAllProductsController;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        // Валидация входящих данных
        if (!body.name || !body.category || !body.price || !body.zone) {
            return res.status(400).json({
                message: 'Недостаточно данных для создания продукта',
                requiredFields: ['name', 'category', 'price', 'zone']
            });
        }
        const product = yield Product_1.default.create(body);
        res.status(201).json(product);
    }
    catch (error) {
        console.error('Ошибка создания продукта:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Ошибка валидации данных',
                details: error.errors
            });
        }
        res.status(500).json({
            message: 'Ошибка сервера при создании продукта',
            error: error.message
        });
    }
});
exports.createProduct = createProduct;
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield Product_1.default.find();
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.getProducts = getProducts;
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_1.default.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Продукт не найден' });
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.getProductById = getProductById;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        if (body.zone && !mongoose_1.default.Types.ObjectId.isValid(body.zone)) {
            return res.status(400).json({ message: 'Некорректный ObjectId зоны' });
        }
        const product = yield Product_1.default.findByIdAndUpdate(req.params.id, body, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Продукт не найден' });
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_1.default.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Продукт не найден' });
        }
        res.json({ message: 'Продукт успешно удален' });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.deleteProduct = deleteProduct;
const getProductsByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield Product_1.default.find({ category: req.params.category });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.getProductsByCategory = getProductsByCategory;
const getProductsByZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield Product_1.default.find({ zone: req.params.zoneId });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.getProductsByZone = getProductsByZone;
const getLowStockProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const threshold = req.query.threshold ? Number(req.query.threshold) : 10;
        const products = yield Product_1.default.find({ quantity: { $lt: threshold } });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.getLowStockProducts = getLowStockProducts;
const moveProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { productId, fromZone, toZone, quantity, reason } = req.body;
        const product = yield Product_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Продукт не найден' });
        }
        if (product.quantity < quantity) {
            return res.status(400).json({ message: 'Недостаточное количество продукта' });
        }
        product.zone = toZone;
        yield product.save();
        // Запись движения продукта
        yield ProductMovement_1.default.create({
            product: productId,
            fromZone,
            toZone,
            quantity,
            reason,
            performedBy: ((_a = req.body.decoded) === null || _a === void 0 ? void 0 : _a._id) || 'unknown'
        });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.moveProduct = moveProduct;
const updateProductStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const product = yield Product_1.default.findByIdAndUpdate(req.params.id, { status, updatedAt: new Date() }, { new: true });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateProductStatus = updateProductStatus;
const updateProductQuantity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quantity } = req.body;
        const product = yield Product_1.default.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Продукт не найден' });
        }
        yield product.updateQuantity(quantity);
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.updateProductQuantity = updateProductQuantity;
const searchProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.query;
        const products = yield Product_1.default.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { brandName: { $regex: query, $options: 'i' } },
                { productModel: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.searchProducts = searchProducts;
