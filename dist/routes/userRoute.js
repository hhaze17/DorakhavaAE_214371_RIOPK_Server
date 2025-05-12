"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
// Without token
router.post("/signIn", userController_1.signInController);
router.post("/forgotPassword", userController_1.forgotPasswordController);
router.post("/resetPassword", userController_1.resetPasswordController);
router.post("/createPassword", userController_1.createPasswordController);
// With token
router.get("/validateToken", userController_1.validateTokenController);
router.get("/getProfile", userController_1.getProfileController);
router.get("/getAllUsers", userController_1.getAllUsersController);
router.post("/createUser", userController_1.createUserController);
router.get("/getUser/:id", userController_1.getUserByIdController);
router.post("/updateUser/:id", userController_1.updateUserController);
router.delete("/deleteUser/:id", userController_1.deleteUserController);
router.put("/updateProfile", userController_1.updateProfileController);
exports.default = router;
