"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inventoryAlertController_1 = require("../controllers/inventoryAlertController");
const router = express_1.default.Router();
// Получение активных уведомлений
router.get('/', inventoryAlertController_1.getActiveAlerts);
// Создание нового уведомления
router.post('/', inventoryAlertController_1.createAlert);
// Получение истории разрешенных уведомлений
router.get('/resolved', inventoryAlertController_1.getResolvedAlerts);
// Получение уведомлений по зоне
router.get('/zone/:zoneId', inventoryAlertController_1.getAlertsByZone);
// Получение уведомлений по продукту
router.get('/product/:productId', inventoryAlertController_1.getAlertsByProduct);
// Разрешение уведомления
router.put('/:id/resolve', inventoryAlertController_1.resolveAlert);
exports.default = router;
