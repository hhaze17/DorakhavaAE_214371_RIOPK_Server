"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const barcodeGeneratorController_1 = require("../controllers/barcodeGeneratorController");
const router = (0, express_1.Router)();
router.post("/createBarcode", barcodeGeneratorController_1.createBarcodeController);
router.get("/getAllBarcodes", barcodeGeneratorController_1.getAllBarcodesController);
router.delete("/deleteAllBarcodes", barcodeGeneratorController_1.deleteAllBarcodesController);
exports.default = router;
