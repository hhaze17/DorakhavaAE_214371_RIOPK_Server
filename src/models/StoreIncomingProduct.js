"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var StoreIncomingProductSchema = new mongoose_1.Schema({
    productId: { type: String },
    brandName: { type: String },
    description: { type: String },
    model: { type: String },
    quantity: { type: Number },
    pricePerUnit: { type: String },
    dateOfDelivery: { type: Date },
    store: { type: String },
    createdAt: { type: Date, "default": new Date() }
});
exports["default"] = (0, mongoose_1.model)("StoreIncomingProduct", StoreIncomingProductSchema);
