import express from 'express';
import {
  getProductsByZone,
  getZonesByProduct,
  addProductToZone,
  moveProductBetweenZones,
  removeProductFromZone,
  getExpiringProducts,
  getLowStockProducts
} from '../controllers/zoneProductController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Публичные маршруты
// Получение товаров в зоне
router.get('/by-zone/:zoneId', getProductsByZone);

// Получение зон, содержащих товар
router.get('/by-product/:productId', getZonesByProduct);

// Получение товаров с истекающим сроком годности
router.get('/expiring', getExpiringProducts);

// Получение товаров с низким остатком
router.get('/low-stock', getLowStockProducts);

// Защищенные маршруты (требуют авторизации)
// Добавление или обновление товара в зоне
router.post('/', authMiddleware, addProductToZone);

// Перемещение товара между зонами
router.post('/move', moveProductBetweenZones);

// Удаление товара из зоны
router.delete('/:zoneId/:productId', authMiddleware, removeProductFromZone);

export default router; 