import { Router } from "express";
import {
  createOutgoingProductController,
  deleteOutgoingProductController,
  deliverOutgoingProductController,
  getAllOutgoingProductsController,
  getOutgoingProductByIdController,
  updateOutgoingProductController,
} from "../controllers/outgoingProductController";
import middleware from "../middleware/middleware";

const router: Router = Router();

router.get(
  "/getAllOutgoingProducts",
  
  getAllOutgoingProductsController
);
router.post(
  "/createOutgoingProduct",
 
  createOutgoingProductController
);
router.get(
  "/getOutgoingProduct/:id",
  
  getOutgoingProductByIdController
);
router.put(
  "/updateOutgoingProduct/:id",
   
  updateOutgoingProductController
);
router.delete(
  "/deleteOutgoingProduct/:id",
 
  deleteOutgoingProductController
);
router.post(
  "/deliverOutgoingProduct/:id",
   
  deliverOutgoingProductController
);

export default router;
