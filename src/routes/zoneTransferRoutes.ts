import express from 'express';
import {
  createTransferRequest,
  getTransferRequests,
  getZoneTransferRequests,
  approveTransferRequest,
  rejectTransferRequest,
  executeTransferRequest
} from '../controllers/zoneTransferController';

const router = express.Router();

// Получение всех запросов на перемещение
router.get('/', getTransferRequests);

// Создание нового запроса на перемещение
router.post('/', createTransferRequest);

// Получение запросов на перемещение для конкретной зоны
router.get('/zone/:zoneId', getZoneTransferRequests);

// Подтверждение запроса на перемещение
router.put('/:id/approve', approveTransferRequest);

// Отклонение запроса на перемещение
router.put('/:id/reject', rejectTransferRequest);

// Выполнение запроса на перемещение
router.post('/:id/execute', executeTransferRequest);

export default router; 