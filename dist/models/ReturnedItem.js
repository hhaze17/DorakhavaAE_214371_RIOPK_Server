"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ReturnedItemSchema = new mongoose_1.Schema({
    productId: { type: String },
    brandName: { type: String },
    description: { type: String },
    model: { type: String },
    quantity: { type: Number },
    reason: { type: String },
    store: { type: String },
    returnedDate: { type: Date },
    createdAt: { type: Date, default: new Date() },
});
exports.default = (0, mongoose_1.model)("ReturnedItem", ReturnedItemSchema);
