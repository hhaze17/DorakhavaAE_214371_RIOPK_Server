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
exports.getAllPurchasesController = void 0;
const Purchase_1 = __importDefault(require("../models/Purchase"));
const getAllPurchasesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ITEMS_PER_PAGE = 5;
        const page = req.query.page || 1;
        const query = {};
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const countPromise = Purchase_1.default.estimatedDocumentCount(query);
        const itemPromise = Purchase_1.default.find(query).limit(ITEMS_PER_PAGE).skip(skip);
        const [count, items] = yield Promise.all([countPromise, itemPromise]);
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
exports.getAllPurchasesController = getAllPurchasesController;
