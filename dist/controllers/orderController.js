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
exports.updateOrderStatus = exports.getOrdersByStatus = exports.getOrdersByCustomer = exports.deleteOrder = exports.updateOrder = exports.createOrder = exports.getOrderById = exports.getOrders = void 0;
const OnlineOrder_1 = __importDefault(require("../models/OnlineOrder"));
const Product_1 = __importDefault(require("../models/Product"));
// Получение списка заказов
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield OnlineOrder_1.default.find()
            .populate('client', 'username firstName lastName email')
            .populate('items.product', 'name brandName productModel price');
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.getOrders = getOrders;
// Получение заказа по ID
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield OnlineOrder_1.default.findById(req.params.id)
            .populate('client', 'username firstName lastName email')
            .populate('items.product', 'name brandName productModel price');
        if (!order) {
            return res.status(404).json({ message: 'Заказ не найден' });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.getOrderById = getOrderById;
// Создание заказа
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const body = req.body;
        const { products, pickupDate } = body;
        // Проверка наличия продуктов
        for (const item of products) {
            const product = yield Product_1.default.findById(item.productId);
            if (!product) {
                return res.status(404).json({
                    message: `Продукт с ID ${item.productId} не найден`
                });
            }
            if (product.quantity < item.quantity) {
                return res.status(400).json({
                    message: `Недостаточное количество продукта ${product.brandName}`
                });
            }
        }
        // Получаем ID клиента из декодированного токена
        const clientId = (_a = req.body.decoded) === null || _a === void 0 ? void 0 : _a._id;
        // Создание заказа
        const order = yield OnlineOrder_1.default.create({
            client: clientId,
            items: products.map(item => ({
                product: item.productId,
                quantity: item.quantity,
                price: 0 // Цена будет установлена позже
            })),
            status: 'pending',
            pickupTime: pickupDate,
            paymentStatus: 'pending',
            paymentMethod: 'card' // По умолчанию
        });
        // Обновление количества продуктов
        for (const item of products) {
            yield Product_1.default.findByIdAndUpdate(item.productId, {
                $inc: { quantity: -item.quantity }
            });
        }
        res.status(201).json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.createOrder = createOrder;
// Обновление заказа
const updateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield OnlineOrder_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!order) {
            return res.status(404).json({ message: 'Заказ не найден' });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.updateOrder = updateOrder;
// Удаление заказа
const deleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield OnlineOrder_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Заказ не найден' });
        }
        // Возврат продуктов на склад
        for (const item of order.items) {
            yield Product_1.default.findByIdAndUpdate(item.product, {
                $inc: { quantity: item.quantity }
            });
        }
        yield order.deleteOne();
        res.json({ message: 'Заказ удален' });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.deleteOrder = deleteOrder;
// Получение заказов клиента
const getOrdersByCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield OnlineOrder_1.default.find({ client: req.params.customerId })
            .populate('items.product', 'name brandName productModel price');
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.getOrdersByCustomer = getOrdersByCustomer;
// Получение заказов по статусу
const getOrdersByStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield OnlineOrder_1.default.find({ status: req.params.status })
            .populate('client', 'username firstName lastName email')
            .populate('items.product', 'name brandName productModel price');
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.getOrdersByStatus = getOrdersByStatus;
// Обновление статуса заказа
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const order = yield OnlineOrder_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Заказ не найден' });
        }
        order.status = status;
        yield order.save();
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.updateOrderStatus = updateOrderStatus;
