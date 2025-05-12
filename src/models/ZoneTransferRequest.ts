import mongoose, { Schema } from 'mongoose';
import { ZoneTransferRequestInterface, ZoneTransferRequestModel } from '../types';

const ZoneTransferRequestSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product' 
  },
  batchId: {
    type: Schema.Types.ObjectId,
    ref: 'Batch' 
  },
  quantity: {
    type: Number,
    
    min: 1
  },
  fromZoneId: {
    type: Schema.Types.ObjectId,
    ref: 'Zone' 
  },
  toZoneId: {
    type: Schema.Types.ObjectId,
    ref: 'Zone' 
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User' 
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
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
ZoneTransferRequestSchema.statics.getPendingRequests = function() {
  return this.find({ status: 'pending' })
    .sort({ priority: -1, createdAt: 1 }) // Urgent first, then oldest
    .populate('productId', 'name description')
    .populate('batchId', 'batchNumber')
    .populate('fromZoneId', 'name type')
    .populate('toZoneId', 'name type')
    .populate('requestedBy', 'username');
};

ZoneTransferRequestSchema.statics.getRequestsByZone = function(zoneId: string) {
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
ZoneTransferRequestSchema.methods.approve = async function(userId: string) {
  this.status = 'approved';
  this.approvedBy = userId;
  return this.save();
};

ZoneTransferRequestSchema.methods.reject = async function(userId: string, reason: string) {
  this.status = 'rejected';
  this.approvedBy = userId;
  this.reason = reason;
  return this.save();
};

ZoneTransferRequestSchema.methods.complete = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

export default mongoose.model<ZoneTransferRequestInterface, ZoneTransferRequestModel>('ZoneTransferRequest', ZoneTransferRequestSchema); 