"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const returnedItemController_1 = require("../controllers/returnedItemController");
const router = (0, express_1.Router)();
// With Token
router.get("/getAllReturnedItems", returnedItemController_1.getAllReturnedItemsController);
router.post("/createReturnedItem", returnedItemController_1.createReturnedItemController);
router.get("/getReturnedItem/:id", returnedItemController_1.getReturnedItemController);
router.put("/updateReturnedItem/:id", returnedItemController_1.updateReturnedItemController);
router.post("/deleteReturnedItem/:id", returnedItemController_1.deleteReturnedItemController);
exports.default = router;
