import express from 'express';
import {
  createSaleController,
  deleteSaleController,
  updateSaleController,
  getAllSalesController,
  getSaleById,
} from "../controllers/saleController";
 

const router = express.Router();

 

// Маршруты для продаж
router.get("/getAllSales",   getAllSalesController);
router.post("/createSale",   createSaleController);
router.get("/getSale/:id",   getSaleById);
router.put("/updateSale/:id",   updateSaleController);
router.delete("/deleteSale/:id",   deleteSaleController);

export default router;
