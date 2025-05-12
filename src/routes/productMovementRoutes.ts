import express from 'express';
 
import {
  getProductMovements,
  getProductMovementStats,
  createProductMovement,
  updateProductMovement,
  deleteProductMovement
} from '../controllers/productMovementController';

const router = express.Router();

 

// Маршруты для движения товаров
router.get('/',   getProductMovements);
router.get('/stats',   getProductMovementStats);
router.post('/',   createProductMovement);
router.put('/:id',   updateProductMovement);
router.delete('/:id',   deleteProductMovement);

export default router; 