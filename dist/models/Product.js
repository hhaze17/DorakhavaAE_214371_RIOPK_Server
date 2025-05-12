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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ProductSchema = new mongoose_1.Schema({
    name: { type: String  },
    description: { type: String },
    brandName: { type: String },
    productModel: { type: String },
    category: { type: String },
    price: { type: Number  },
    quantity: { type: Number, min: 0 },
    zone: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Zone'  },
    storageConditions: {
        temperature: { type: Number },
        humidity: { type: Number },
        lightSensitive: { type: Boolean }
    },
    batchInfo: {
        batchNumber: { type: String },
        manufacturingDate: { type: Date },
        expiryDate: { type: Date }
    },
    status: {
        type: String,
        enum: ['active', 'reserved', 'sold', 'returned', 'written_off', 'inactive', 'discontinued'],
        default: 'active'
    },
    reservedForOrder: { type: mongoose_1.Schema.Types.ObjectId, ref: 'OnlineOrder', default: null },
    isPromotion: { type: Boolean, default: false },
    promotionEndDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});
ProductSchema.index({ zone: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ 'batchInfo.expiryDate': 1 });
exports.default = mongoose_1.default.model('Product', ProductSchema);
