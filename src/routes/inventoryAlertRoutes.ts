import express from 'express';
import {
  getActiveAlerts,
  createAlert,
  getAlertsByZone,
  getAlertsByProduct,
  resolveAlert,
  getResolvedAlerts
} from '../controllers/inventoryAlertController';

const router = express.Router();

// Получение активных уведомлений
router.get('/', getActiveAlerts);

// Создание нового уведомления
router.post('/', createAlert);

// Получение истории разрешенных уведомлений
router.get('/resolved', getResolvedAlerts);

// Получение уведомлений по зоне
router.get('/zone/:zoneId', getAlertsByZone);

// Получение уведомлений по продукту
router.get('/product/:productId', getAlertsByProduct);

// Разрешение уведомления
router.put('/:id/resolve', resolveAlert);

export default router; 