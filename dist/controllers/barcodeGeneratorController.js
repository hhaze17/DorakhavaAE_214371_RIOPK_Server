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
exports.deleteAllBarcodesController = exports.getAllBarcodesController = exports.createBarcodeController = void 0;
const User_1 = require("../models/User");
const BarcodeGenerator_1 = __importDefault(require("../models/BarcodeGenerator"));
const Product_1 = __importDefault(require("../models/Product"));
const createBarcodeController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded, productId } = req.body;
    try {
        const existingProductId = yield Product_1.default.findOne({ productId });
        if (!existingProductId)
            return res.status(404).json({ message: "Product Id doesn't exist" });
        const existingUser = yield User_1.User.findOne({ _id: decoded.id });
        yield BarcodeGenerator_1.default.create({
            userId: existingUser === null || existingUser === void 0 ? void 0 : existingUser._id,
            productId,
        });
        return res.status(200).json({ message: "Barcode generated successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.createBarcodeController = createBarcodeController;
const getAllBarcodesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = req.body;
    try {
        const items = yield BarcodeGenerator_1.default.find({ userId: decoded.id });
        return res.status(200).json({
            items,
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.getAllBarcodesController = getAllBarcodesController;
const deleteAllBarcodesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = req.body;
    try {
        yield BarcodeGenerator_1.default.deleteMany({ userId: decoded.id });
        return res
            .status(203)
            .json({ message: "Deleted all generated barcode successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.deleteAllBarcodesController = deleteAllBarcodesController;
