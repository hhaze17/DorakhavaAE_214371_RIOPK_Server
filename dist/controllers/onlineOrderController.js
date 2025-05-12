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
exports.updateOrderStatus = exports.getOrdersByDateRange = exports.getOrdersByStatus = exports.getOrdersByCustomer = exports.deleteOrder = exports.updateOrder = exports.getOrderById = exports.getOrders = exports.createOrder = void 0;
const OnlineOrder_1 = __importDefault(require("../models/OnlineOrder"));
const Product_1 = __importDefault(require("../models/Product"));
const Zone_1 = __importDefault(require("../models/Zone"));
const ProductMovement_1 = __importDefault(require("../models/ProductMovement"));
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = new OnlineOrder_1.default(req.body);
        yield order.save();
        // Создаем перемещение товаров в зону выдачи онлайн-заказов
        const pickupZone = yield Zone_1.default.findOne({ type: "online_pickup" });
        if (!pickupZone) {
            return res.status(404).json({ message: "Pickup zone not found" });
        }
        for (const item of order.items) {
            const product = yield Product_1.default.findById(item.product);
            if (!product) {
                continue;
            }
            const movement = new ProductMovement_1.default({
                productId: item.product,
                quantity: item.quantity,
                fromZone: product.zone,
                toZone: pickupZone._id,
                reason: "online_order",
                batchId: item.batch,
                orderId: order._id
            });
            yield movement.save();
            pickupZone.currentOccupancy += item.quantity;
        }
        yield pickupZone.save();
        res.status(201).json(order);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.createOrder = createOrder;
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield OnlineOrder_1.default.find();
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getOrders = getOrders;
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield OnlineOrder_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json(order);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getOrderById = getOrderById;
const updateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield OnlineOrder_1.default.findByIdAndUpdate(req.params.id, Object.assign(Object.assign({}, req.body), { updatedAt: new Date() }), { new: true });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json(order);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateOrder = updateOrder;
const deleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield OnlineOrder_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        // Возвращаем товары в исходные зоны
        const pickupZone = yield Zone_1.default.findOne({ type: "online_pickup" });
        if (!pickupZone) {
            return res.status(404).json({ message: "Pickup zone not found" });
        }
        for (const item of order.items) {
            const product = yield Product_1.default.findById(item.product);
            if (!product) {
                continue;
            }
            const movement = new ProductMovement_1.default({
                productId: item.product,
                quantity: item.quantity,
                fromZone: pickupZone._id,
                toZone: product.zone,
                reason: "order_cancellation",
                batchId: item.batch,
                orderId: order._id
            });
            yield movement.save();
            pickupZone.currentOccupancy -= item.quantity;
        }
        yield pickupZone.save();
        yield OnlineOrder_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Order deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteOrder = deleteOrder;
const getOrdersByCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield OnlineOrder_1.default.find({ customerId: req.params.customerId });
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getOrdersByCustomer = getOrdersByCustomer;
const getOrdersByStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield OnlineOrder_1.default.find({ status: req.params.status });
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getOrdersByStatus = getOrdersByStatus;
const getOrdersByDateRange = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        const orders = yield OnlineOrder_1.default.find({
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        });
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getOrdersByDateRange = getOrdersByDateRange;
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const order = yield OnlineOrder_1.default.findByIdAndUpdate(req.params.id, { status, updatedAt: new Date() }, { new: true });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json(order);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateOrderStatus = updateOrderStatus;
