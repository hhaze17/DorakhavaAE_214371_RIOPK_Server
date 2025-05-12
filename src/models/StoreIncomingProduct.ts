import { model, Schema } from "mongoose";

export interface StoreIncomingProductInterface {
  productId: string;
  brandName: string;
  description: string;
  model: string;
  quantity: number;
  pricePerUnit: string;
  dateOfDelivery: Date;
  store: string;
  createdAt: Date;
}

const StoreIncomingProductSchema = new Schema<StoreIncomingProductInterface>({
  productId: { type: String },
  brandName: { type: String },
  description: { type: String },
  model: { type: String },
  quantity: { type: Number },
  pricePerUnit: { type: String },
  dateOfDelivery: { type: Date },
  store: { type: String },
  createdAt: { type: Date, default: new Date() },
});

export default model<StoreIncomingProductInterface>(
  "StoreIncomingProduct",
  StoreIncomingProductSchema
);
