"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const OutgoingProductSchema = new mongoose_1.Schema({
    productId: { type: String },
    brandName: { type: String },
    description: { type: String },
    model: { type: String },
    quantity: { type: Number },
    pricePerUnit: { type: String },
    dateOfTransaction: { type: Date },
    store: { type: String  },
    createdAt: { type: Date, default: new Date() },
});
exports.default = (0, mongoose_1.model)("OutgoingProduct", OutgoingProductSchema);
