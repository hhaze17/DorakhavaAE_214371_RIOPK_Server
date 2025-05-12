"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const expiryTrackingController_1 = require("../controllers/expiryTrackingController");
const router = express_1.default.Router();
// Получение товаров с истекающим сроком годности
router.get('/', expiryTrackingController_1.getExpiringSoonProducts);
// Создание записи о сроке годности
router.post('/', expiryTrackingController_1.createExpiryTracking);
// Обновление записи о сроке годности
router.put('/:id', expiryTrackingController_1.updateExpiryTracking);
// Удаление записи о сроке годности
router.delete('/:id', expiryTrackingController_1.deleteExpiryTracking);
// Получение товаров с истекающим сроком годности для конкретной зоны
router.get('/zone/:zoneId', expiryTrackingController_1.getZoneExpiringProducts);
exports.default = router;
