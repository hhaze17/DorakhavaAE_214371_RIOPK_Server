"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var IncomingProductSchema = new mongoose_1.Schema({
    brandName: { type: String },
    description: { type: String },
    model: { type: String },
    quantity: { type: Number },
    totalPrice: { type: String },
    dateOfTransaction: { type: Date },
    createdAt: { type: Date, "default": new Date() }
});
exports["default"] = (0, mongoose_1.model)("IncomingProduct", IncomingProductSchema);
