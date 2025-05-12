"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const purchaseController_1 = require("../controllers/purchaseController");
const router = (0, express_1.Router)();
router.get("/getAllPurchases", purchaseController_1.getAllPurchasesController);
exports.default = router;
