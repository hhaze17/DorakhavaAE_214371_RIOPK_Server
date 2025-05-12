"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var ZoneProductSchema = new mongoose_1.Schema({
    zone: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Zone',
        required: true
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    // Дополнительные поля для управления товаром в зоне
    status: {
        type: String,
        enum: ['available', 'reserved', 'processing', 'sold'],
        default: 'available'
    },
    // Для товаров с ограниченным сроком годности
    expiryDate: {
        type: Date
    },
    // Для акционных товаров в торговом зале
    isPromotion: {
        type: Boolean,
        default: false
    },
    promotionEndDate: {
        type: Date
    },
    // Для товаров в зоне самовывоза
    reservedForOrder: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'OnlineOrder',
        default: null
    },
    // Метаданные движения товара
    lastUpdated: {
        by: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: {
            type: String
        }
    }
}, {
    timestamps: true
});
// Составной индекс для обеспечения уникальности пар зона-товар
ZoneProductSchema.index({ zone: 1, product: 1 }, { unique: true });
// Индексы для частых запросов
ZoneProductSchema.index({ zone: 1 });
ZoneProductSchema.index({ product: 1 });
ZoneProductSchema.index({ status: 1 });
ZoneProductSchema.index({ expiryDate: 1 });
exports.default = mongoose_1.default.model('ZoneProduct', ZoneProductSchema);
