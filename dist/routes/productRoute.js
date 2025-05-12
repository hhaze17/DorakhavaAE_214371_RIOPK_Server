"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
// With Token
router.get("/getAllProducts", productController_1.getAllProductsController);
router.post("/createProduct", productController_1.createProduct);
router.get("/getProduct/:id", productController_1.getProductById);
router.put("/updateProduct/:id", productController_1.updateProduct);
router.delete("/deleteProduct/:id", productController_1.deleteProduct);
exports.default = router;
