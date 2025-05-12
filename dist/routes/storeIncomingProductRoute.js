"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storeIncomingProductController_1 = require("../controllers/storeIncomingProductController");
const router = (0, express_1.Router)();
router.get("/getAllStoreIncomingProduct", storeIncomingProductController_1.getAllStoreIncomingProductController);
router.post("/receivedStoreIncomingProduct/:id", storeIncomingProductController_1.receivedStoreIncomingProductController);
exports.default = router;
