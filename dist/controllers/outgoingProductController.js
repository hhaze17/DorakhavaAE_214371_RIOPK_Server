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
exports.deliverOutgoingProductController = exports.deleteOutgoingProductController = exports.updateOutgoingProductController = exports.getOutgoingProductByIdController = exports.createOutgoingProductController = exports.getAllOutgoingProductsController = void 0;
const OutgoingProduct_1 = __importDefault(require("../models/OutgoingProduct"));
const Product_1 = __importDefault(require("../models/Product"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const StoreIncomingProduct_1 = __importDefault(require("../models/StoreIncomingProduct"));
const DailyAttendance_1 = __importDefault(require("../models/DailyAttendance"));
const getAllOutgoingProductsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ITEMS_PER_PAGE = 5;
        const page = req.query.page || 1;
        const query = {};
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const countPromise = OutgoingProduct_1.default.estimatedDocumentCount(query);
        const itemsPromise = OutgoingProduct_1.default.find(query)
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
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.getAllOutgoingProductsController = getAllOutgoingProductsController;
const createOutgoingProductController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, quantity, store } = req.body;
    try {
        const existingProduct = yield Product_1.default.findOne({ productId });
        if (!existingProduct)
            return res.status(404).json({ message: "Product id doesn't exist" });
        if (quantity > existingProduct.quantity)
            return res.status(400).json({ message: "Invalid Quantity" });
        const existingStore = yield User_1.User.findOne({ store });
        if (!existingStore || store === "N/A")
            return res.status(400).json({ message: "Store doesn't exist" });
        yield OutgoingProduct_1.default.create({
            productId,
            brandName: existingProduct.brandName,
            description: existingProduct.description,
            model: existingProduct.model,
            quantity,
            pricePerUnit: existingProduct.price + " BYN",
            dateOfTransaction: new Date(),
            store,
        });
        return res.status(200).json({ message: "Successfully added new product" });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.createOutgoingProductController = createOutgoingProductController;
const getOutgoingProductByIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(404).json({ message: "Invalid ID" });
        const singleOutgoingProduct = yield OutgoingProduct_1.default.findById({ _id: id });
        return res.status(200).json(singleOutgoingProduct);
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.getOutgoingProductByIdController = getOutgoingProductByIdController;
const updateOutgoingProductController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { productId, quantity, store } = req.body;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(404).json({ message: "Invalid ID" });
        const existingProduct = yield Product_1.default.findOne({ productId });
        if (!existingProduct)
            return res.status(404).json({ message: "Product id doesn't exist" });
        if (quantity > existingProduct.quantity)
            return res.status(400).json({ message: "Invalid Quantity" });
        const existingStore = yield User_1.User.findOne({ store });
        if (!existingStore || store === "N/A")
            return res.status(400).json({ message: "Store doesn't exist" });
        const existingId = yield OutgoingProduct_1.default.findById({ _id: id });
        yield OutgoingProduct_1.default.findByIdAndUpdate(existingId, {
            productId,
            brandName: existingProduct.brandName,
            description: existingProduct.description,
            model: existingProduct.model,
            quantity,
            pricePerUnit: existingProduct.price + " BYN",
            store,
        }, { new: true });
        return res.status(200).json({ message: "Successfully updated product" });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.updateOutgoingProductController = updateOutgoingProductController;
const deleteOutgoingProductController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(404).json({ message: "Invalid ID" });
        yield OutgoingProduct_1.default.findByIdAndDelete(id);
        return res.status(203).json({ message: "Deleted product successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.deleteOutgoingProductController = deleteOutgoingProductController;
const deliverOutgoingProductController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { decoded } = req.body;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(404).json({ message: "Invalid ID" });
        const existingOutgoingProduct = yield OutgoingProduct_1.default.findById({ _id: id });
        const existingProduct = yield Product_1.default.findOne({
            model: existingOutgoingProduct === null || existingOutgoingProduct === void 0 ? void 0 : existingOutgoingProduct.model,
        });
        const existingUser = yield User_1.User.findOne({ _id: decoded.id });
        yield StoreIncomingProduct_1.default.create({
            productId: existingOutgoingProduct.productId,
            brandName: existingOutgoingProduct.brandName,
            description: existingOutgoingProduct.description,
            model: existingOutgoingProduct.model,
            quantity: existingOutgoingProduct.quantity,
            pricePerUnit: existingOutgoingProduct.pricePerUnit,
            dateOfDelivery: new Date(),
            store: existingOutgoingProduct.store,
        });
        yield Product_1.default.findByIdAndUpdate(existingProduct._id, {
            quantity: existingProduct.quantity - existingOutgoingProduct.quantity,
        }, { new: true });
        yield DailyAttendance_1.default.create({
            name: existingUser === null || existingUser === void 0 ? void 0 : existingUser.name,
            activity: "Delivered product",
            productId: existingOutgoingProduct.productId,
            brandName: existingOutgoingProduct.brandName,
            description: existingOutgoingProduct.description,
            model: existingOutgoingProduct.model,
            quantity: existingOutgoingProduct.quantity,
            dateOfActivity: new Date(),
        });
        yield OutgoingProduct_1.default.findByIdAndDelete(id);
        return res.status(200).json({ message: "Successfully delivered product" });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.deliverOutgoingProductController = deliverOutgoingProductController;
