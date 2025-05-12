import mongoose, { Schema, Document } from 'mongoose';

export interface ProductMovementInterface extends Document {
  product: mongoose.Types.ObjectId;
  fromZone: mongoose.Types.ObjectId | null;
  toZone: mongoose.Types.ObjectId | null;
  quantity: number;
  type: 'transfer' | 'sale' | 'return';
  date: Date;
}

const productMovementSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product' 
  },
  fromZone: {
    type: Schema.Types.ObjectId,
    ref: 'Zone' 
  },
  toZone: {
    type: Schema.Types.ObjectId,
    ref: 'Zone' 
  },
  quantity: {
    type: Number,
    
    min: 0
  },
  type: {
    type: String,
    enum: ['transfer', 'sale', 'return'] 
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Проверяем, существует ли уже модель
export const ProductMovement = mongoose.models.ProductMovement || mongoose.model<ProductMovementInterface>('ProductMovement', productMovementSchema); 