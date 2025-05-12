"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storeInventoryController_1 = require("../controllers/storeInventoryController");
const router = (0, express_1.Router)();
router.get("/getAllStoreInventory", storeInventoryController_1.getAllStoreInventoryController);
router.get("/getStoreProduct/:id", storeInventoryController_1.getStoreProductById);
router.put("/updateStorePrice/:id", storeInventoryController_1.updateStorePriceController);
exports.default = router;
