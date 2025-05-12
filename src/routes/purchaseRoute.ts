import { Router } from "express";
import { getAllPurchasesController } from "../controllers/purchaseController";
import middleware from "../middleware/middleware";

const router: Router = Router();

router.get("/getAllPurchases",   getAllPurchasesController);

export default router;
