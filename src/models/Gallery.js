"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var GallerySchema = new mongoose_1.Schema({
    brandName: { type: String },
    itemDescription: { type: String },
    classification: { type: String },
    price: { type: String },
    image: { type: String },
    createdAt: { type: Date, "default": new Date() }
});
exports["default"] = (0, mongoose_1.model)("Gallery", GallerySchema);
