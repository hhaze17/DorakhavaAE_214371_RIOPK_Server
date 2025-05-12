"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const StoreIncomingProductSchema = new mongoose_1.Schema({
    productId: { type: String },
    brandName: { type: String },
    description: { type: String },
    model: { type: String },
    quantity: { type: Number },
    pricePerUnit: { type: String },
    dateOfDelivery: { type: Date },
    store: { type: String },
    createdAt: { type: Date, default: new Date() },
});
exports.default = (0, mongoose_1.model)("StoreIncomingProduct", StoreIncomingProductSchema);
