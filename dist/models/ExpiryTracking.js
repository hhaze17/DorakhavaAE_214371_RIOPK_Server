"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ExpiryTrackingSchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product'
    },
    batchId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Batch'
    },
    expiryDate: {
        type: Date
    },
    notificationSent: {
        type: Boolean,
        default: false
    },
    zoneId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Zone'
    },
    quantity: {
        type: Number,
        min: 0
    }
}, {
    timestamps: true
});
// Индексы для повышения производительности запросов
ExpiryTrackingSchema.index({ expiryDate: 1 });
ExpiryTrackingSchema.index({ productId: 1 });
ExpiryTrackingSchema.index({ batchId: 1 });
ExpiryTrackingSchema.index({ zoneId: 1 });
ExpiryTrackingSchema.index({ notificationSent: 1 });
// Статический метод для поиска товаров, которые скоро истекут
ExpiryTrackingSchema.statics.findExpiringSoon = function (days = 30) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    return this.find({
        expiryDate: { $lte: expiryDate },
        notificationSent: false
    })
        .populate('productId', 'name description')
        .populate('batchId', 'batchNumber manufacturingDate')
        .populate('zoneId', 'name type');
};
// Метод для обновления статуса уведомления
ExpiryTrackingSchema.methods.markNotified = function () {
    return __awaiter(this, void 0, void 0, function* () {
        this.notificationSent = true;
        return this.save();
    });
};
exports.default = mongoose_1.default.model('ExpiryTracking', ExpiryTrackingSchema);
