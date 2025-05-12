"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var BarcodeGeneratorSchema = new mongoose_1.Schema({
    userId: { type: String  },
    productId: { type: String  },
    createdAt: { type: Date, "default": new Date() }
});
exports["default"] = (0, mongoose_1.model)("BarcodeGenerator", BarcodeGeneratorSchema);
