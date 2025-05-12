import express from 'express';
import {
  getExpiringProducts,
  getZoneExpiringProducts,
  processExpiringProduct
} from '../controllers/expiryTrackingController';

const router = express.Router();

// Get all expiring products
router.get('/', getExpiringProducts);

// Get expiring products by zone
router.get('/zone/:zoneId', getZoneExpiringProducts);

// Process an expiring product
router.post('/batch/:batchId/process', processExpiringProduct);

export default router; 