import mongoose, { Schema } from 'mongoose';
import { InventoryAlertInterface, InventoryAlertModel } from '../types';

const InventoryAlertSchema = new Schema({
  type: {
    type: String,
    enum: ['low_stock', 'expiring_soon', 'zone_capacity', 'quality_issue', 'uncollected_order'],
    
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  batchId: {
    type: Schema.Types.ObjectId,
    ref: 'Batch'
  },
  zoneId: {
    type: Schema.Types.ObjectId,
    ref: 'Zone',
    
  },
  message: {
    type: String,
   
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
    type: Schema.Types.ObjectId,
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
InventoryAlertSchema.statics.getActiveAlerts = function() {
  return this.find({ isResolved: false })
    .sort({ level: -1, createdAt: -1 }) // Critical first, then by date
    .populate('productId', 'name')
    .populate('batchId', 'batchNumber')
    .populate('zoneId', 'name type')
    .populate('resolvedBy', 'username');
};

InventoryAlertSchema.statics.getAlertsByZone = function(zoneId: string) {
  return this.find({ zoneId, isResolved: false })
    .sort({ level: -1, createdAt: -1 })
    .populate('productId', 'name')
    .populate('batchId', 'batchNumber')
    .populate('resolvedBy', 'username');
};

InventoryAlertSchema.statics.getAlertsByProduct = function(productId: string) {
  return this.find({ productId, isResolved: false })
    .sort({ level: -1, createdAt: -1 })
    .populate('zoneId', 'name type')
    .populate('batchId', 'batchNumber')
    .populate('resolvedBy', 'username');
};

// Методы экземпляра
InventoryAlertSchema.methods.resolve = async function(userId: string) {
  this.isResolved = true;
  this.resolvedBy = userId;
  this.resolvedAt = new Date();
  return this.save();
};

export default mongoose.model<InventoryAlertInterface, InventoryAlertModel>('InventoryAlert', InventoryAlertSchema); 