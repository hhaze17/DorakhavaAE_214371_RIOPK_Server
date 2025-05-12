import { Router } from "express";
import {
  getAllStoreIncomingProductController,
  receivedStoreIncomingProductController,
} from "../controllers/storeIncomingProductController";
import middleware from "../middleware/middleware";

const router: Router = Router();

router.get(
  "/getAllStoreIncomingProduct",
   
  getAllStoreIncomingProductController
);
router.post(
  "/receivedStoreIncomingProduct/:id",
 
  receivedStoreIncomingProductController
);

export default router;
