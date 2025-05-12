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
exports.deleteOrderedProductController = exports.updateOrderedProductController = exports.getOrderedProductController = exports.orderProductController = exports.getAllOrderedProductsController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const OrderProduct_1 = __importDefault(require("../models/OrderProduct"));
const Product_1 = __importDefault(require("../models/Product"));
const getAllOrderedProductsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = req.body;
    try {
        if (!decoded.store) {
            const ITEMS_PER_PAGE = 5;
            const page = req.query.page || 1;
            const query = {};
            const skip = (page - 1) * ITEMS_PER_PAGE;
            const countPromise = OrderProduct_1.default.estimatedDocumentCount(query);
            const itemsPromise = OrderProduct_1.default.find(query)
                .limit(ITEMS_PER_PAGE)
                .skip(skip);
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
        else {
            const ITEMS_PER_PAGE = 5;
            const page = req.query.page || 1;
            const query = { store: decoded.store };
            const skip = (page - 1) * ITEMS_PER_PAGE;
            const countPromise = OrderProduct_1.default.estimatedDocumentCount(query);
            const itemsPromise = OrderProduct_1.default.find(query)
                .limit(ITEMS_PER_PAGE)
                .skip(skip);
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
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.getAllOrderedProductsController = getAllOrderedProductsController;
const orderProductController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded, productId, quantity } = req.body;
    try {
        const existingProduct = yield Product_1.default.findOne({ productId });
        if (!existingProduct)
            return res.status(404).json({ message: "Product id doesn't exist" });
        yield OrderProduct_1.default.create({
            productId,
            brandName: existingProduct.brandName,
            description: existingProduct.description,
            model: existingProduct.model,
            quantity,
            store: decoded.store,
            orderedDate: new Date(),
        });
        return res.status(200).json({ message: "Order item successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.orderProductController = orderProductController;
const getOrderedProductController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(404).json({ message: "Invalid ID" });
        const singleOrder = yield OrderProduct_1.default.findById({ _id: id });
        return res.status(200).json(singleOrder);
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.getOrderedProductController = getOrderedProductController;
const updateOrderedProductController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { productId, quantity } = req.body;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(404).json({ message: "Invalid ID" });
        const existingProduct = yield Product_1.default.findOne({ productId });
        if (!existingProduct)
            return res.status(404).json({ message: "Product id doesn't exist" });
        yield OrderProduct_1.default.findByIdAndUpdate(id, {
            quantity,
        }, { new: true });
        return res.status(200).json({ message: "Updated product successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.updateOrderedProductController = updateOrderedProductController;
const deleteOrderedProductController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(404).json({ message: "Invalid ID" });
        yield OrderProduct_1.default.findByIdAndDelete(id);
        return res
            .status(203)
            .json({ message: "Deleted ordered product successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.deleteOrderedProductController = deleteOrderedProductController;
