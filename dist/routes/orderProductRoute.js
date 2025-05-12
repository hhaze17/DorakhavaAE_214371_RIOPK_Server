"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderProductController_1 = require("../controllers/orderProductController");
const router = (0, express_1.Router)();
// With Token
router.get("/getAllOrderedProducts", orderProductController_1.getAllOrderedProductsController);
router.post("/orderProduct", orderProductController_1.orderProductController);
router.get("/getOrderedProduct/:id", orderProductController_1.getOrderedProductController);
router.put("/updateOrderedProduct/:id", orderProductController_1.updateOrderedProductController);
router.delete("/deleteOrderedProduct/:id", orderProductController_1.deleteOrderedProductController);
exports.default = router;
