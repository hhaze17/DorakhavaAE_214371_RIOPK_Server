"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const IncomingProductSchema = new mongoose_1.Schema({
    brandName: { type: String, required: true },
    description: { type: String, required: true },
    model: { type: String, required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: String, required: true },
    dateOfTransaction: { type: Date, required: true },
    createdAt: { type: Date, default: new Date() },
});
exports.default = (0, mongoose_1.model)("IncomingProduct", IncomingProductSchema);
