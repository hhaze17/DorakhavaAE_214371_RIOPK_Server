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
exports.receivedIncomingProductController = exports.deleteIncomingProductController = exports.updateIncomingProductController = exports.getIncomingProductByIdController = exports.createIncomingProductController = exports.getAllIncomingProductsController = void 0;
const IncomingProduct_1 = __importDefault(require("../models/IncomingProduct"));
const mongoose_1 = __importDefault(require("mongoose"));
const Product_1 = __importDefault(require("../models/Product"));
const Purchase_1 = __importDefault(require("../models/Purchase"));
const User_1 = require("../models/User");
const DailyAttendance_1 = __importDefault(require("../models/DailyAttendance"));
const getAllIncomingProductsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ITEMS_PER_PAGE = 5;
        const page = req.query.page || 1;
        const query = {};
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const countPromise = IncomingProduct_1.default.estimatedDocumentCount(query);
        const itemsPromise = IncomingProduct_1.default.find(query)
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
exports.getAllIncomingProductsController = getAllIncomingProductsController;
const createIncomingProductController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { brandName, description, model, quantity, totalPrice } = req.body;
    try {
        yield IncomingProduct_1.default.create({
            brandName,
            description,
            model,
            quantity,
            totalPrice: `BYN${totalPrice}`,
            dateOfTransaction: new Date(),
        });
        return res.status(200).json({ message: "Successfully added new product" });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.createIncomingProductController = createIncomingProductController;
const getIncomingProductByIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(404).json({ message: "Invalid ID" });
        const singleIncomingProduct = yield IncomingProduct_1.default.findById({ _id: id });
        return res.status(200).json(singleIncomingProduct);
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.getIncomingProductByIdController = getIncomingProductByIdController;
const updateIncomingProductController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { brandName, description, model, quantity, totalPrice } = req.body;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(404).json({ message: "Invalid ID" });
        const existingId = yield IncomingProduct_1.default.findById({ _id: id });
        yield IncomingProduct_1.default.findByIdAndUpdate(existingId, {
            brandName,
            description,
            model,
            quantity,
            totalPrice: totalPrice,
        }, { new: true });
        return res.status(200).json({ message: "Successfully updated product" });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.updateIncomingProductController = updateIncomingProductController;
const deleteIncomingProductController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(404).json({ message: "Invalid ID" });
        yield IncomingProduct_1.default.findByIdAndDelete(id);
        return res.status(203).json({ message: "Deleted product successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.deleteIncomingProductController = deleteIncomingProductController;
const receivedIncomingProductController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { decoded } = req.body;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(404).json({ message: "Invalid ID" });
        const existingIncomingProduct = yield IncomingProduct_1.default.findById({ _id: id });
        const existingProduct = yield Product_1.default.findOne({
            model: existingIncomingProduct === null || existingIncomingProduct === void 0 ? void 0 : existingIncomingProduct.model,
        });
        const existingUser = yield User_1.User.findOne({ _id: decoded.id });
        if (!existingProduct) {
            yield Purchase_1.default.create({
                dateOfTransaction: new Date(),
                brandName: existingIncomingProduct.brandName,
                description: existingIncomingProduct.description,
                model: existingIncomingProduct.model,
                quantity: existingIncomingProduct.quantity,
                totalPrice: existingIncomingProduct.totalPrice,
            });
            yield DailyAttendance_1.default.create({
                name: existingUser.name,
                activity: "Received product",
                brandName: existingIncomingProduct.brandName,
                description: existingIncomingProduct.description,
                model: existingIncomingProduct.model,
                quantity: existingIncomingProduct.quantity,
                dateOfActivity: new Date(),
            });
            yield IncomingProduct_1.default.findByIdAndDelete(id);
            return res.status(200).json({ message: "Successfully received product" });
        }
        else {
            yield Product_1.default.findByIdAndUpdate(existingProduct._id, {
                quantity: existingProduct.quantity + existingIncomingProduct.quantity,
            }, { new: true });
            yield Purchase_1.default.create({
                dateOfTransaction: new Date(),
                brandName: existingIncomingProduct.brandName,
                description: existingIncomingProduct.description,
                model: existingIncomingProduct.model,
                quantity: existingIncomingProduct.quantity,
                totalPrice: existingIncomingProduct.totalPrice,
            });
            yield DailyAttendance_1.default.create({
                name: existingUser.name,
                activity: "Received product",
                productId: existingProduct._id,
                brandName: existingIncomingProduct.brandName,
                description: existingIncomingProduct.description,
                model: existingIncomingProduct.model,
                quantity: existingIncomingProduct.quantity,
                dateOfActivity: new Date(),
            });
            yield IncomingProduct_1.default.findByIdAndDelete(id);
            return res.status(200).json({ message: "Successfully received product" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.receivedIncomingProductController = receivedIncomingProductController;
