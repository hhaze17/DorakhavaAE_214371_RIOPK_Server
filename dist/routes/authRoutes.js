"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
// Публичные маршруты
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
// Защищенные маршруты
router.get('/profile', authController_1.getProfile);
router.put('/profile', authController_1.updateProfile);
router.put('/change-password', authController_1.changePassword);
exports.default = router;
