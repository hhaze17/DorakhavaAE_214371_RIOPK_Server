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
const BatchSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
    },
    batchNumber: {
        type: String,
        unique: true
    },
    quantity: {
        type: Number,
        min: 0
    },
    manufacturingDate: {
        type: Date,
    },
    expiryDate: {
        type: Date,
    },
    zone: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Zone',
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'depleted', 'recalled'],
        default: 'active'
    },
    supplier: {
        name: {
            type: String,
        },
        contact: {
            type: String
        }
    },
    purchasePrice: {
        type: Number,
        min: 0
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});
// Индексы для поиска
BatchSchema.index({ product: 1, batchNumber: 1 });
BatchSchema.index({ expiryDate: 1 });
BatchSchema.index({ status: 1 });
// Метод для проверки срока годности
BatchSchema.methods.isExpired = function () {
    return new Date() > this.expiryDate;
};
// Метод для проверки количества
BatchSchema.methods.hasStock = function (amount) {
    return this.quantity >= amount;
};
// Метод для обновления количества
BatchSchema.methods.updateQuantity = function (amount) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.quantity + amount < 0) {
            throw new Error('Insufficient quantity');
        }
        this.quantity += amount;
        if (this.quantity === 0) {
            this.status = 'depleted';
        }
        return this.save();
    });
};
exports.default = mongoose_1.default.model('Batch', BatchSchema);
