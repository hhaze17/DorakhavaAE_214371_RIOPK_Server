import mongoose, { Schema } from 'mongoose';
import { OnlineOrderInterface } from '../types';

const OrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    
  },
  quantity: {
    type: Number,
     
    min: 1
  },
  price: {
    type: Number,
  
    min: 0
  },
  batch: {
    type: Schema.Types.ObjectId,
    ref: 'Batch'
  },
  zone: {
    type: Schema.Types.ObjectId,
    ref: 'Zone',
    required: false
  }
});

const OnlineOrderSchema = new Schema({
  orderNumber: {
    type: String,
    
    unique: true
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'User',
     
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
     
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  pickupZone: {
    type: Schema.Types.ObjectId,
    ref: 'Zone'
  },
  pickupTime: {
    type: Date
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'transfer'] 
  },
  notes: {
    type: String
  },
  reservedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
}, {
  timestamps: true
});

// Индексы для поиска
OnlineOrderSchema.index({ orderNumber: 1 });
OnlineOrderSchema.index({ client: 1, createdAt: -1 });
OnlineOrderSchema.index({ status: 1 });
OnlineOrderSchema.index({ pickupTime: 1 });

// Метод для расчета общей суммы
OnlineOrderSchema.methods.calculateTotal = function() {
  this.totalAmount = this.items.reduce((total: number, item: { price: number; quantity: number }) => {
    return total + (item.price * item.quantity);
  }, 0);
  return this.totalAmount;
};

// Метод для проверки готовности заказа
OnlineOrderSchema.methods.isReady = function() {
  return this.status === 'ready';
};

// Метод для отмены заказа
OnlineOrderSchema.methods.cancel = async function(reason: string) {
  if (this.status === 'completed') {
    throw new Error('Cannot cancel completed order');
  }
  this.status = 'cancelled';
  this.notes = reason;
  return this.save();
};

export default mongoose.model<OnlineOrderInterface>('OnlineOrder', OnlineOrderSchema); 