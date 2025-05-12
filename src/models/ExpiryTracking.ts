import mongoose, { Schema } from 'mongoose';
import { ExpiryTrackingInterface, ExpiryTrackingModel } from '../types';

const ExpiryTrackingSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  batchId: {
    type: Schema.Types.ObjectId,
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
    type: Schema.Types.ObjectId,
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
ExpiryTrackingSchema.statics.findExpiringSoon = function(days: number = 30) {
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
ExpiryTrackingSchema.methods.markNotified = async function() {
  this.notificationSent = true;
  return this.save();
};

export default mongoose.model<ExpiryTrackingInterface, ExpiryTrackingModel>('ExpiryTracking', ExpiryTrackingSchema); 