import express from 'express';
import {
  getZones,
  getZoneById,
  createZone,
  updateZone,
  deleteZone,
  getZonesByType,
  updateZoneOccupancy,
  checkSalesZoneInventory,
  getFifoBatches,
  checkReceivingZoneCapacity,
  checkPickupZoneStatus,
  createZoneByTemplate,
  getZoneStats,
  getZonesByProductId
} from '../controllers/zoneController';
 

// Импортируем новые контроллеры
import { 
  getZoneExpiringProducts 
} from '../controllers/expiryTrackingController';

import { 
  getAlertsByZone 
} from '../controllers/inventoryAlertController';

import { 
  getZoneTransferRequests,
  createTransferRequest,
  approveTransferRequest,
  rejectTransferRequest,
  executeTransferRequest
} from '../controllers/zoneTransferController';

const router = express.Router();

// Публичные маршруты
router.get('/', getZones);
router.get('/type/:type', getZonesByType);
router.get('/stats', getZoneStats);
router.get('/by-product/:productId', getZonesByProductId);
router.get('/:id', getZoneById);

 
router.post('/', createZone);
router.post('/template', createZoneByTemplate);
router.put('/:id', updateZone);
router.delete('/:id', deleteZone);
router.patch('/:id/occupancy', updateZoneOccupancy);

// Новые маршруты для работы с зонами
router.get('/:id/salesInventory', checkSalesZoneInventory);
router.get('/:id/fifoBatches', getFifoBatches);
router.get('/:id/receivingCapacity', checkReceivingZoneCapacity);
router.get('/:id/pickupStatus', checkPickupZoneStatus);

// Маршруты для отслеживания срока годности
router.get('/:zoneId/expiring', getZoneExpiringProducts);

// Маршруты для уведомлений
router.get('/:zoneId/alerts', getAlertsByZone);

// Маршруты для управления перемещениями между зонами
router.get('/:zoneId/transfers', getZoneTransferRequests);
router.post('/transfers', createTransferRequest);
router.put('/transfers/:id/approve', approveTransferRequest);
router.put('/transfers/:id/reject', rejectTransferRequest);
router.post('/transfers/:id/execute', executeTransferRequest);

export default router; 