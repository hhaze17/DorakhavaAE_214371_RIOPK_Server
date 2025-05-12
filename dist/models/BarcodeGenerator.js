"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const BarcodeGeneratorSchema = new mongoose_1.Schema({
    userId: { type: String },
    productId: { type: String },
    createdAt: { type: Date, default: new Date() },
});
exports.default = (0, mongoose_1.model)("BarcodeGenerator", BarcodeGeneratorSchema);
