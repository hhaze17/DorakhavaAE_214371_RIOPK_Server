"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const onlineOrderController_1 = require("../controllers/onlineOrderController");
const router = express_1.default.Router();
// Маршруты, доступные только администраторам
router.delete("/:id", onlineOrderController_1.deleteOrder);
// Маршруты, доступные администраторам и сотрудникам
router.get("/", onlineOrderController_1.getOrders);
router.get("/:id", onlineOrderController_1.getOrderById);
router.put("/:id", onlineOrderController_1.updateOrder);
router.get("/status/:status", onlineOrderController_1.getOrdersByStatus);
router.get("/date-range", onlineOrderController_1.getOrdersByDateRange);
router.put("/:id/status", onlineOrderController_1.updateOrderStatus);
// Маршруты, доступные всем аутентифицированным пользователям
router.post("/", onlineOrderController_1.createOrder);
router.get("/customer/:customerId", onlineOrderController_1.getOrdersByCustomer);
exports.default = router;
