"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const OrderProductSchema = new mongoose_1.Schema({
    productId: { type: String, required: true },
    brandName: { type: String, required: true },
    description: { type: String, required: true },
    model: { type: String, required: true },
    quantity: { type: Number, required: true },
    store: { type: String, required: true },
    orderedDate: { type: Date, required: true },
    createdAt: { type: Date, default: new Date() },
});
exports.default = (0, mongoose_1.model)("OrderProduct", OrderProductSchema);
