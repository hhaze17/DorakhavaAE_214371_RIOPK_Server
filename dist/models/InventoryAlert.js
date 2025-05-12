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
const InventoryAlertSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['low_stock', 'expiring_soon', 'zone_capacity', 'quality_issue', 'uncollected_order'],
        required: true
    },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product'
    },
    batchId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Batch'
    },
    zoneId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Zone',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ['info', 'warning', 'critical'],
        default: 'info'
    },
    isResolved: {
        type: Boolean,
        default: false
    },
    resolvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: {
        type: Date
    }
}, {
    timestamps: true
});
// Индексы для повышения производительности запросов
InventoryAlertSchema.index({ type: 1 });
InventoryAlertSchema.index({ zoneId: 1 });
InventoryAlertSchema.index({ level: 1 });
InventoryAlertSchema.index({ isResolved: 1 });
InventoryAlertSchema.index({ createdAt: 1 });
// Статические методы
InventoryAlertSchema.statics.getActiveAlerts = function () {
    return this.find({ isResolved: false })
        .sort({ level: -1, createdAt: -1 }) // Critical first, then by date
        .populate('productId', 'name')
        .populate('batchId', 'batchNumber')
        .populate('zoneId', 'name type')
        .populate('resolvedBy', 'username');
};
InventoryAlertSchema.statics.getAlertsByZone = function (zoneId) {
    return this.find({ zoneId, isResolved: false })
        .sort({ level: -1, createdAt: -1 })
        .populate('productId', 'name')
        .populate('batchId', 'batchNumber')
        .populate('resolvedBy', 'username');
};
InventoryAlertSchema.statics.getAlertsByProduct = function (productId) {
    return this.find({ productId, isResolved: false })
        .sort({ level: -1, createdAt: -1 })
        .populate('zoneId', 'name type')
        .populate('batchId', 'batchNumber')
        .populate('resolvedBy', 'username');
};
// Методы экземпляра
InventoryAlertSchema.methods.resolve = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        this.isResolved = true;
        this.resolvedBy = userId;
        this.resolvedAt = new Date();
        return this.save();
    });
};
exports.default = mongoose_1.default.model('InventoryAlert', InventoryAlertSchema);
