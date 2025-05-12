import mongoose, { Schema } from 'mongoose';
import { ProductMovementInterface } from '../types';

const ProductMovementSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product' 
  },
  batch: {
    type: Schema.Types.ObjectId,
    ref: 'Batch' 
  },
  type: {
    type: String,
    enum: ['receipt', 'transfer', 'sale', 'return', 'adjustment', 'writeoff', 'online_order', 'pickup', 'expired'],
     
  },
  quantity: {
    type: Number,
    
    min: 1
  },
  fromZone: {
    type: Schema.Types.ObjectId,
    ref: 'Zone'
  },
  toZone: {
    type: Schema.Types.ObjectId,
    ref: 'Zone'
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User' 
  },
  reason: {
    type: String
  },
  reference: {
    type: String
  },
  // Дополнительные поля для отслеживания требований к зонам
  salesInfo: {
    isPromotion: Boolean,
    discountApplied: Number
  },
  warehouseInfo: {
    storageConditions: {
      temperature: Number,
      humidity: Number,
      isCompliant: Boolean
    }
  },
  expiryDate: {
    type: Date
  },
  // Информация о клиенте (для продаж и возвратов)
  clientInfo: {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    transactionId: String
  },
  // Для товаров в зоне самовывоза
  pickupInfo: {
    orderNumber: String,
    reservedUntil: Date,
    wasCollected: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Индексы для повышения производительности запросов
ProductMovementSchema.index({ product: 1 });
ProductMovementSchema.index({ batch: 1 });
ProductMovementSchema.index({ fromZone: 1 });
ProductMovementSchema.index({ toZone: 1 });
ProductMovementSchema.index({ createdAt: 1 });
ProductMovementSchema.index({ type: 1 });

// Метод для получения истории движения товара
ProductMovementSchema.statics.getProductHistory = function(productId: string) {
  return this.find({ product: productId })
    .sort({ createdAt: -1 })
    .populate('batch')
    .populate('fromZone')
    .populate('toZone')
    .populate('performedBy', 'username firstName lastName');
};

// Метод для получения истории движения партии
ProductMovementSchema.statics.getBatchHistory = function(batchId: string) {
  return this.find({ batch: batchId })
    .sort({ createdAt: -1 })
    .populate('fromZone')
    .populate('toZone')
    .populate('performedBy', 'username firstName lastName');
};

export default mongoose.model<ProductMovementInterface>('ProductMovement', ProductMovementSchema); 