import { Router } from 'express';
import {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  getBatchesByProduct,
  getBatchesByZone,
  getExpiringBatches,
  updateBatchQuantity
} from '../controllers/batchController';
 

const router = Router();

// Публичные маршруты
router.get('/', getBatches);
router.get('/by-product/:productId', getBatchesByProduct);
router.get('/product/:productId', getBatchesByProduct); // Keep for backward compatibility
router.get('/zone/:zoneId', getBatchesByZone);
router.get('/expiring', getExpiringBatches);
router.get('/:id', getBatchById);

// Защищенные маршруты (требуют аутентификации)
 
router.post('/', createBatch as any);
router.put('/:id', updateBatch as any);
router.delete('/:id', deleteBatch as any);
router.patch('/:id/quantity', updateBatchQuantity as any);

export default router; 