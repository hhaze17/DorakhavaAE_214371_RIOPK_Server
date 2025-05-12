"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productMovementController_1 = require("../controllers/productMovementController");
const router = express_1.default.Router();
// Маршруты для движения товаров
router.get('/', productMovementController_1.getProductMovements);
router.get('/stats', productMovementController_1.getProductMovementStats);
router.post('/', productMovementController_1.createProductMovement);
router.put('/:id', productMovementController_1.updateProductMovement);
router.delete('/:id', productMovementController_1.deleteProductMovement);
exports.default = router;
