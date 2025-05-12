import { Router } from "express";
import {
  getAllImagesController,
  getImageById,
  updateImageController,
  uploadImageController,
  deleteImageController,
} from "../controllers/galleryController";
import middleware from "../middleware/middleware";

const router: Router = Router();

router.get("/getAllImages",   getAllImagesController);
router.post("/uploadImage",   uploadImageController);
router.get("/getImage/:id",   getImageById);
router.put("/updateImage/:id",   updateImageController);
router.delete("/deleteImage/:id",   deleteImageController);

export default router;
