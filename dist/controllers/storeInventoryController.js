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
exports.updateStorePriceController = exports.getStoreProductById = exports.getAllStoreInventoryController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const StoreInventory_1 = __importDefault(require("../models/StoreInventory"));
const User_1 = require("../models/User");
const getAllStoreInventoryController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = req.body;
    try {
        const existingUserStore = yield User_1.User.findOne({ _id: decoded.id });
        const ITEMS_PER_PAGE = 5;
        const page = req.query.page || 1;
        const query = { store: existingUserStore.store };
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const countPromise = StoreInventory_1.default.estimatedDocumentCount(query);
        const itemsPromise = StoreInventory_1.default.find(query)
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
exports.getAllStoreInventoryController = getAllStoreInventoryController;
const getStoreProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(404).json({ message: "Invalid ID" });
        const singleProduct = yield StoreInventory_1.default.findById({ _id: id });
        return res.status(200).json(singleProduct);
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.getStoreProductById = getStoreProductById;
const updateStorePriceController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { storePrice } = req.body;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(404).json({ message: "Invalid ID" });
        yield StoreInventory_1.default.findByIdAndUpdate(id, {
            storePrice: `BYN${storePrice}`,
        }, {
            new: true,
        });
        res.status(200).json({ message: "Successfully updated price" });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.updateStorePriceController = updateStorePriceController;
