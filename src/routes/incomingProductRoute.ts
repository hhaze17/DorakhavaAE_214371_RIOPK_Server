import { Router } from "express";
import {
  createIncomingProductController,
  deleteIncomingProductController,
  getAllIncomingProductsController,
  getIncomingProductByIdController,
  receivedIncomingProductController,
  updateIncomingProductController,
} from "../controllers/incomingProductController";
import middleware from "../middleware/middleware";

const router: Router = Router();

router.get(
  "/getAllIncomingProducts",
   
  getAllIncomingProductsController
);
router.post(
  "/createIncomingProduct",
  
  createIncomingProductController
);
router.get(
  "/getIncomingProduct/:id",
   
  getIncomingProductByIdController
);
router.put(
  "/updateIncomingProduct/:id",
  
  updateIncomingProductController
);
router.delete(
  "/deleteIncomingProduct/:id",
   
  deleteIncomingProductController
);
router.post(
  "/receivedIncomingProduct/:id",
   
  receivedIncomingProductController
);

export default router;
