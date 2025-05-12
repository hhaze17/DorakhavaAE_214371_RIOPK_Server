"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const router = (0, express_1.Router)();
// Публичные маршруты
router.get('/', orderController_1.getOrders);
router.get('/status/:status', orderController_1.getOrdersByStatus);
router.get('/:id', orderController_1.getOrderById);
// Защищенные маршруты (требуют аутентификации)
router.post('/', orderController_1.createOrder);
router.put('/:id', orderController_1.updateOrder);
router.delete('/:id', orderController_1.deleteOrder);
router.patch('/:id/status', orderController_1.updateOrderStatus);
router.get('/customer/:customerId', orderController_1.getOrdersByCustomer);
exports.default = router;
