import { Router } from "express";
import {
  createBarcodeController,
  deleteAllBarcodesController,
  getAllBarcodesController,
} from "../controllers/barcodeGeneratorController";
import middleware from "../middleware/middleware";

const router: Router = Router();

router.post("/createBarcode",   createBarcodeController);
router.get("/getAllBarcodes",   getAllBarcodesController);
router.delete("/deleteAllBarcodes",   deleteAllBarcodesController);

export default router;
