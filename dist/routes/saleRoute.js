"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const saleController_1 = require("../controllers/saleController");
const router = express_1.default.Router();
// Маршруты для продаж
router.get("/getAllSales", saleController_1.getAllSalesController);
router.post("/createSale", saleController_1.createSaleController);
router.get("/getSale/:id", saleController_1.getSaleById);
router.put("/updateSale/:id", saleController_1.updateSaleController);
router.delete("/deleteSale/:id", saleController_1.deleteSaleController);
exports.default = router;
