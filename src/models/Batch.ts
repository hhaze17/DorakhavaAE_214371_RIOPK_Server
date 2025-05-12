import mongoose, { Schema } from 'mongoose';
import { BatchInterface } from '../types';

const BatchSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
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
    type: Schema.Types.ObjectId,
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
BatchSchema.methods.isExpired = function() {
  return new Date() > this.expiryDate;
};

// Метод для проверки количества
BatchSchema.methods.hasStock = function(amount: number) {
  return this.quantity >= amount;
};

// Метод для обновления количества
BatchSchema.methods.updateQuantity = async function(amount: number) {
  if (this.quantity + amount < 0) {
    throw new Error('Insufficient quantity');
  }
  this.quantity += amount;
  if (this.quantity === 0) {
    this.status = 'depleted';
  }
  return this.save();
};

export default mongoose.model<BatchInterface>('Batch', BatchSchema); 