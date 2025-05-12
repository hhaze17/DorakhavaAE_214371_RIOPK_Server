import { Router } from "express";
import {
  deleteOrderedProductController,
  getAllOrderedProductsController,
  getOrderedProductController,
  orderProductController,
  updateOrderedProductController,
} from "../controllers/orderProductController";
import middleware from "../middleware/middleware";

const router: Router = Router();

// With Token
router.get(
  "/getAllOrderedProducts",
 
  getAllOrderedProductsController
);
router.post("/orderProduct",  orderProductController);
router.get("/getOrderedProduct/:id",   getOrderedProductController);
router.put(
  "/updateOrderedProduct/:id",
   
  updateOrderedProductController
);
router.delete(
  "/deleteOrderedProduct/:id",
   
  deleteOrderedProductController
);

export default router;
