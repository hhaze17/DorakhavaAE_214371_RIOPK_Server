"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zoneTransferController_1 = require("../controllers/zoneTransferController");
const router = express_1.default.Router();
// Получение всех запросов на перемещение
router.get('/', zoneTransferController_1.getTransferRequests);
// Создание нового запроса на перемещение
router.post('/', zoneTransferController_1.createTransferRequest);
// Получение запросов на перемещение для конкретной зоны
router.get('/zone/:zoneId', zoneTransferController_1.getZoneTransferRequests);
// Подтверждение запроса на перемещение
router.put('/:id/approve', zoneTransferController_1.approveTransferRequest);
// Отклонение запроса на перемещение
router.put('/:id/reject', zoneTransferController_1.rejectTransferRequest);
// Выполнение запроса на перемещение
router.post('/:id/execute', zoneTransferController_1.executeTransferRequest);
exports.default = router;
