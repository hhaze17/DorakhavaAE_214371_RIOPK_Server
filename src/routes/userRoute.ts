import { Router } from "express";
import {
  createPasswordController,
  createUserController,
  deleteUserController,
  forgotPasswordController,
  getAllUsersController,
  getProfileController,
  getUserByIdController,
  resetPasswordController,
  signInController,
  updateProfileController,
  updateUserController,
  validateTokenController,
} from "../controllers/userController";
import middleware from "../middleware/middleware";

const router: Router = Router();

// Without token
router.post("/signIn", signInController);
router.post("/forgotPassword", forgotPasswordController);
router.post("/resetPassword", resetPasswordController);
router.post("/createPassword", createPasswordController);

// With token
router.get("/validateToken",   validateTokenController);
router.get("/getProfile",   getProfileController);
router.get("/getAllUsers",   getAllUsersController);
router.post("/createUser",   createUserController);
router.get("/getUser/:id",   getUserByIdController);
router.post("/updateUser/:id",   updateUserController);
router.delete("/deleteUser/:id",   deleteUserController);
router.put("/updateProfile",   updateProfileController);

export default router;
