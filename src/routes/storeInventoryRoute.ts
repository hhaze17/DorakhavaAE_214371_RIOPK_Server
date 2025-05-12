import { Router } from "express";
import {
  getAllStoreInventoryController,
  getStoreProductById,
  updateStorePriceController,
} from "../controllers/storeInventoryController";
import middleware from "../middleware/middleware";

const router: Router = Router();

router.get("/getAllStoreInventory",   getAllStoreInventoryController);
router.get("/getStoreProduct/:id",     getStoreProductById);
router.put("/updateStorePrice/:id",   updateStorePriceController);

export default router;
