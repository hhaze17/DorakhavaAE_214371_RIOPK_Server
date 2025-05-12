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
exports.deleteReturnedItemController = exports.updateReturnedItemController = exports.getReturnedItemController = exports.createReturnedItemController = exports.getAllReturnedItemsController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ReturnedItem_1 = __importDefault(require("../models/ReturnedItem"));
const StoreInventory_1 = __importDefault(require("../models/StoreInventory"));
const getAllReturnedItemsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = req.body;
    try {
        if (!decoded.store) {
            const ITEMS_PER_PAGE = 5;
            const page = req.query.page || 1;
            const query = {};
            const skip = (page - 1) * ITEMS_PER_PAGE;
            const countPromise = ReturnedItem_1.default.estimatedDocumentCount(query);
            const itemsPromise = ReturnedItem_1.default.find(query)
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
            const countPromise = ReturnedItem_1.default.estimatedDocumentCount(query);
            const itemsPromise = ReturnedItem_1.default.find(query)
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
exports.getAllReturnedItemsController = getAllReturnedItemsController;
const createReturnedItemController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded, productId, quantity, reason } = req.body;
    try {
        const existingProduct = yield StoreInventory_1.default.findOne({ productId });
        if (!existingProduct)
            return res.status(404).json({ message: "Product id doesn't exist" });
        if (quantity > existingProduct.quantity)
            return res.status(400).json({ message: "Invalid Quantity" });
        yield StoreInventory_1.default.findByIdAndUpdate(existingProduct.id, { quantity: existingProduct.quantity - quantity }, { new: true });
        yield ReturnedItem_1.default.create({
            productId,
            brandName: existingProduct.brandName,
            description: existingProduct.description,
            model: existingProduct.model,
            quantity,
            reason,
            store: decoded.store,
            returnedDate: new Date(),
        });
        return res.status(200).json({ message: "Successfully added new record" });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.createReturnedItemController = createReturnedItemController;
const getReturnedItemController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(404).json({ message: "Invalid ID" });
        const singleProduct = yield ReturnedItem_1.default.findById({ _id: id });
        return res.status(200).json(singleProduct);
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.getReturnedItemController = getReturnedItemController;
const updateReturnedItemController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { decoded, productId, quantity, reason } = req.body;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(404).json({ message: "Invalid ID" });
        const query = { store: decoded.store, productId };
        const existingProduct = yield StoreInventory_1.default.findOne(query);
        const existingReturnedItem = yield ReturnedItem_1.default.findById(id);
        if (!existingProduct)
            return res.status(404).json({ message: "Product id doesn't exist" });
        if (quantity > existingProduct.quantity)
            return res.status(400).json({ message: "Invalid Quantity" });
        if (existingReturnedItem.quantity !== quantity) {
            const existingQuantity = existingProduct.quantity + existingReturnedItem.quantity;
            const currentQuantity = existingQuantity - quantity;
            yield ReturnedItem_1.default.findByIdAndUpdate(id, { quantity, reason }, { new: true });
            yield StoreInventory_1.default.findByIdAndUpdate(existingProduct.id, { quantity: currentQuantity }, { new: true });
            return res.status(200).json({ message: "Updated sale successfully" });
        }
        else {
            yield ReturnedItem_1.default.findByIdAndUpdate(id, { quantity, reason }, { new: true });
            return res.status(200).json({ message: "Updated sale successfully" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.updateReturnedItemController = updateReturnedItemController;
const deleteReturnedItemController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { decoded } = req.body;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(404).json({ message: "Invalid ID" });
        const existingReturnedItem = yield ReturnedItem_1.default.findById(id);
        const query = {
            store: decoded.store,
            productId: existingReturnedItem.productId,
        };
        const existingProduct = yield StoreInventory_1.default.findOne(query);
        yield StoreInventory_1.default.findByIdAndUpdate(existingProduct === null || existingProduct === void 0 ? void 0 : existingProduct.id, {
            quantity: existingProduct.quantity + existingReturnedItem.quantity,
        }, { new: true });
        yield ReturnedItem_1.default.findByIdAndDelete(id);
        return res.status(203).json({ message: "Deleted sale successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.deleteReturnedItemController = deleteReturnedItemController;
