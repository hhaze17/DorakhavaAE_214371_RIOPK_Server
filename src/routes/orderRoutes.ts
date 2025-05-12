import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrdersByCustomer,
  getOrdersByStatus,
  updateOrderStatus
} from '../controllers/orderController';
 

const router = Router();

// Публичные маршруты
router.get('/', getOrders);
router.get('/status/:status', getOrdersByStatus);
router.get('/:id', getOrderById);

// Защищенные маршруты (требуют аутентификации)
 
router.post('/', createOrder as any);
router.put('/:id', updateOrder as any);
router.delete('/:id', deleteOrder as any);
router.put('/:id/status', updateOrderStatus as any);
router.get('/customer/:customerId', getOrdersByCustomer as any);

export default router; 