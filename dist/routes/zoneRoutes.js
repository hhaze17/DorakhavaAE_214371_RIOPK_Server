"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zoneController_1 = require("../controllers/zoneController");
// Импортируем новые контроллеры
const expiryTrackingController_1 = require("../controllers/expiryTrackingController");
const inventoryAlertController_1 = require("../controllers/inventoryAlertController");
const zoneTransferController_1 = require("../controllers/zoneTransferController");
const router = express_1.default.Router();
// Публичные маршруты
router.get('/', zoneController_1.getZones);
router.get('/type/:type', zoneController_1.getZonesByType);
router.get('/:id', zoneController_1.getZoneById);
router.post('/', zoneController_1.createZone);
router.post('/template', zoneController_1.createZoneByTemplate);
router.put('/:id', zoneController_1.updateZone);
router.delete('/:id', zoneController_1.deleteZone);
router.patch('/:id/occupancy', zoneController_1.updateZoneOccupancy);
// Новые маршруты для работы с зонами
router.get('/:id/salesInventory', zoneController_1.checkSalesZoneInventory);
router.get('/:id/fifoBatches', zoneController_1.getFifoBatches);
router.get('/:id/receivingCapacity', zoneController_1.checkReceivingZoneCapacity);
router.get('/:id/pickupStatus', zoneController_1.checkPickupZoneStatus);
// Маршруты для отслеживания срока годности
router.get('/:zoneId/expiring', expiryTrackingController_1.getZoneExpiringProducts);
// Маршруты для уведомлений
router.get('/:zoneId/alerts', inventoryAlertController_1.getAlertsByZone);
// Маршруты для управления перемещениями между зонами
router.get('/:zoneId/transfers', zoneTransferController_1.getZoneTransferRequests);
router.post('/transfers', zoneTransferController_1.createTransferRequest);
router.put('/transfers/:id/approve', zoneTransferController_1.approveTransferRequest);
router.put('/transfers/:id/reject', zoneTransferController_1.rejectTransferRequest);
router.post('/transfers/:id/execute', zoneTransferController_1.executeTransferRequest);
exports.default = router;
