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
exports.deleteImageController = exports.updateImageController = exports.getImageById = exports.uploadImageController = exports.getAllImagesController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Gallery_1 = __importDefault(require("../models/Gallery"));
const getAllImagesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ITEMS_PER_PAGE = 8;
        const page = req.query.page || 1;
        const query = {};
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const countPromise = Gallery_1.default.estimatedDocumentCount(query);
        const itemsPromise = Gallery_1.default.find(query).limit(ITEMS_PER_PAGE).skip(skip);
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
exports.getAllImagesController = getAllImagesController;
const uploadImageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { brandName, itemDescription, classification, price, image } = req.body;
    try {
        const type = image.substring("data:image/".length, image.indexOf(";base64"));
        const imageType = ["jpeg", "jpg", "png", "gif", "webp"];
        if (imageType.indexOf(type) === -1)
            return res.status(400).json({ message: "Invalid file type" });
        const buffer = Buffer.from(image.substring(image.indexOf(",") + 1));
        if (buffer.length >= 52428800)
            return res.status(400).json({ message: "Image too large" });
        yield Gallery_1.default.create({
            brandName,
            itemDescription,
            classification,
            price,
            image,
        });
        return res.status(200).json({ message: "Successfully uploaded an image" });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.uploadImageController = uploadImageController;
const getImageById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(404).json({ message: "Invalid ID" });
        const singleImage = yield Gallery_1.default.findById({ _id: id });
        return res.status(200).json(singleImage);
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.getImageById = getImageById;
const updateImageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { brandName, itemDescription, classification, price, image } = req.body;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(404).json({ message: "Invalid ID" });
        const type = image.substring("data:image/".length, image.indexOf(";base64"));
        const imageType = ["jpeg", "jpg", "png", "gif", "webp"];
        if (imageType.indexOf(type) === -1)
            return res.status(400).json({ message: "Invalid file type" });
        const buffer = Buffer.from(image.substring(image.indexOf(",") + 1));
        if (buffer.length >= 52428800)
            return res.status(400).json({ message: "Image too large" });
        const existingId = yield Gallery_1.default.findById({ _id: id });
        yield Gallery_1.default.findByIdAndUpdate(existingId, {
            brandName,
            itemDescription,
            classification,
            price,
            image,
        }, { new: true });
        res.status(200).json({ message: "Successfully updated image" });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.updateImageController = updateImageController;
const deleteImageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(404).json({ message: "Invalid ID" });
        yield Gallery_1.default.findByIdAndDelete(id);
        return res.status(203).json({ message: "Deleted image successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.deleteImageController = deleteImageController;
