import mongoose, { Schema } from 'mongoose';
import { ProductInterface } from '../types';

const ProductSchema = new Schema({
  name: { type: String  },
  description: { type: String },
  brandName: { type: String },
  productModel: { type: String },
  category: { type: String },
  price: { type: Number  },
  quantity: { type: Number,  min: 0 },
  zone: { type: Schema.Types.ObjectId, ref: 'Zone'  },
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
  reservedForOrder: { type: Schema.Types.ObjectId, ref: 'OnlineOrder', default: null },
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

export default mongoose.model<ProductInterface>('Product', ProductSchema);
