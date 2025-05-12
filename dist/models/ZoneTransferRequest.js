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
const ZoneTransferRequestSchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product' 
    },
    batchId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Batch' 
    },
    quantity: {
        type: Number,
        min: 1
    },
    fromZoneId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Zone' 
    },
    toZoneId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Zone' 
    },
    requestedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User' 
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    reason: {
        type: String
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});
// Индексы для повышения производительности запросов
ZoneTransferRequestSchema.index({ status: 1 });
ZoneTransferRequestSchema.index({ fromZoneId: 1 });
ZoneTransferRequestSchema.index({ toZoneId: 1 });
ZoneTransferRequestSchema.index({ productId: 1 });
ZoneTransferRequestSchema.index({ priority: 1 });
ZoneTransferRequestSchema.index({ createdAt: 1 });
// Статические методы
ZoneTransferRequestSchema.statics.getPendingRequests = function () {
    return this.find({ status: 'pending' })
        .sort({ priority: -1, createdAt: 1 }) // Urgent first, then oldest
        .populate('productId', 'name description')
        .populate('batchId', 'batchNumber')
        .populate('fromZoneId', 'name type')
        .populate('toZoneId', 'name type')
        .populate('requestedBy', 'username');
};
ZoneTransferRequestSchema.statics.getRequestsByZone = function (zoneId) {
    return this.find({
        $or: [{ fromZoneId: zoneId }, { toZoneId: zoneId }],
        status: { $in: ['pending', 'approved'] }
    })
        .sort({ priority: -1, createdAt: 1 })
        .populate('productId', 'name description')
        .populate('batchId', 'batchNumber')
        .populate('fromZoneId', 'name type')
        .populate('toZoneId', 'name type')
        .populate('requestedBy', 'username')
        .populate('approvedBy', 'username');
};
// Методы экземпляра
ZoneTransferRequestSchema.methods.approve = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        this.status = 'approved';
        this.approvedBy = userId;
        return this.save();
    });
};
ZoneTransferRequestSchema.methods.reject = function (userId, reason) {
    return __awaiter(this, void 0, void 0, function* () {
        this.status = 'rejected';
        this.approvedBy = userId;
        this.reason = reason;
        return this.save();
    });
};
ZoneTransferRequestSchema.methods.complete = function () {
    return __awaiter(this, void 0, void 0, function* () {
        this.status = 'completed';
        this.completedAt = new Date();
        return this.save();
    });
};
exports.default = mongoose_1.default.model('ZoneTransferRequest', ZoneTransferRequestSchema);
