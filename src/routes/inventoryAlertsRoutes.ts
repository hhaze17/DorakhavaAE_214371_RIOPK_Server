import express from 'express';
import {
  getInventoryAlerts,
  getAlertsByZone,
  getAlertsByProduct,
  resolveAlert
} from '../controllers/inventoryAlertController';

const router = express.Router();

// Get all inventory alerts
router.get('/', getInventoryAlerts);

// Get alerts by zone
router.get('/zone/:zoneId', getAlertsByZone);

// Get alerts by product
router.get('/product/:productId', getAlertsByProduct);

// Resolve an alert
router.put('/:alertId/resolve', resolveAlert);

export default router; 