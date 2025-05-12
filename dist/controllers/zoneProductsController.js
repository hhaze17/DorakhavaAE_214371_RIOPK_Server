"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getZoneProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const Batch_1 = __importDefault(require("../models/Batch"));
const Zone_1 = __importDefault(require("../models/Zone"));
const ProductMovement_1 = __importDefault(require("../models/ProductMovement"));
// Получить товары с их текущим местоположением (по партиям и последнему перемещению)
const getZoneProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Получаем все партии с полной информацией
        const batches = yield Batch_1.default.find()
            .populate('product')
            .populate('zone');
        // 2. Для каждой партии формируем подробную информацию
        const result = yield Promise.all(batches.map((batch) => __awaiter(void 0, void 0, void 0, function* () {
            // Найти последнее перемещение для этой партии
            const lastMove = yield ProductMovement_1.default.findOne({ batch: batch._id })
                .sort({ createdAt: -1 })
                .populate('fromZone')
                .populate('toZone');
            // Определяем текущую зону (приоритет у последнего перемещения)
            let currentZone = batch.zone;
            if (lastMove && lastMove.toZone) {
                currentZone = lastMove.toZone;
            }
            // Определяем статус
            let status = batch.status || 'active';
            if (batch.expiryDate && new Date(batch.expiryDate) < new Date()) {
                status = 'expired';
            }
            // Получаем подробную информацию о продукте
            let productData = {
                _id: null,
                name: 'Неизвестный товар',
                brandName: '',
                description: '',
                model: '',
                category: ''
            };
            try {
                // If batch.product is populated, use it directly
                if (typeof batch.product === 'object' && batch.product !== null) {
                    productData = batch.product;
                }
                // If not populated, fetch it manually
                else if (batch.product) {
                    const product = yield Product_1.default.findById(batch.product);
                    if (product) {
                        productData = product;
                    }
                }
            }
            catch (err) {
                console.error('Failed to get product details:', err);
            }
            // Получаем информацию о зоне
            let zoneData = {
                _id: null,
                name: 'Неизвестная зона',
                type: 'unknown'
            };
            try {
                if (typeof currentZone === 'object' && currentZone !== null) {
                    zoneData = currentZone;
                }
                else if (currentZone) {
                    const zone = yield Zone_1.default.findById(currentZone);
                    if (zone) {
                        zoneData = zone;
                    }
                }
            }
            catch (err) {
                console.error('Failed to get zone details:', err);
            }
            // Ensure proper display name for product
            const productName = productData.name ||
                (productData.brandName ? `${productData.brandName} ${productData.model || ''}`.trim() :
                    `Партия ${batch.batchNumber}`);
            // Формируем полный объект с информацией
            return {
                // Информация о продукте
                productId: productData._id || batch.product,
                name: productName,
                brandName: productData.brandName || '',
                description: productData.description || '',
                model: productData.model || productData.productModel || '',
                category: productData.category || '',
                // Информация о партии
                batchId: batch._id,
                batchNumber: batch.batchNumber,
                quantity: batch.quantity,
                manufacturingDate: batch.manufacturingDate,
                expiryDate: batch.expiryDate,
                purchasePrice: batch.purchasePrice,
                // Информация о зоне
                zoneId: zoneData._id || currentZone,
                zoneName: zoneData.name,
                zoneType: zoneData.type,
                // Дополнительная информация
                status,
                supplier: batch.supplier,
                notes: batch.notes,
            };
        })));
        res.json(result);
    }
    catch (err) {
        console.error('Error in getZoneProducts:', err);
        res.status(500).json({ message: 'Ошибка получения товаров по зонам', error: err });
    }
});
exports.getZoneProducts = getZoneProducts;
