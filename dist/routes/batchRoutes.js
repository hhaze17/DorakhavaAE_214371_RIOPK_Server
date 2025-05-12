"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const batchController_1 = require("../controllers/batchController");
const router = (0, express_1.Router)();
// Публичные маршруты
router.get('/', batchController_1.getBatches);
router.get('/product/:productId', batchController_1.getBatchesByProduct);
router.get('/zone/:zoneId', batchController_1.getBatchesByZone);
router.get('/expiring', batchController_1.getExpiringBatches);
router.get('/:id', batchController_1.getBatchById);
// Защищенные маршруты (требуют аутентификации)
router.post('/', batchController_1.createBatch);
router.put('/:id', batchController_1.updateBatch);
router.delete('/:id', batchController_1.deleteBatch);
router.patch('/:id/quantity', batchController_1.updateBatchQuantity);
exports.default = router;
