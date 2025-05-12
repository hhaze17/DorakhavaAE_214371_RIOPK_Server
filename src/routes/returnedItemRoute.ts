import { Router } from "express";
import {
  createReturnedItemController,
  deleteReturnedItemController,
  getAllReturnedItemsController,
  getReturnedItemController,
  updateReturnedItemController,
} from "../controllers/returnedItemController";
import middleware from "../middleware/middleware";

const router: Router = Router();

// With Token
router.get("/getAllReturnedItems",   getAllReturnedItemsController);
router.post("/createReturnedItem",   createReturnedItemController);
router.get("/getReturnedItem/:id",   getReturnedItemController);
router.put("/updateReturnedItem/:id",   updateReturnedItemController);
router.post(
  "/deleteReturnedItem/:id",
   
  deleteReturnedItemController
);

export default router;
