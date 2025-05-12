"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const GallerySchema = new mongoose_1.Schema({
    brandName: { type: String, required: true },
    itemDescription: { type: String, required: true },
    classification: { type: String, required: true },
    price: { type: String, required: true },
    image: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
});
exports.default = (0, mongoose_1.model)("Gallery", GallerySchema);
