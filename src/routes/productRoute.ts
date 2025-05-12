import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProductsController,
  getProductById,
  updateProduct,
} from "../controllers/productController";
import middleware from "../middleware/middleware";

const router: Router = Router();

// With Token
router.get("/getAllProducts",  getAllProductsController);
router.post("/createProduct",  createProduct);
router.get("/getProduct/:id",   getProductById);
router.put("/updateProduct/:id",   updateProduct);
router.delete("/deleteProduct/:id",   deleteProduct);

export default router;
