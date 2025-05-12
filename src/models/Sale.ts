import { model, Schema } from "mongoose";

export interface SaleInterface {
  dateOfTransaction: Date;
  productId: string;
  brandName: string;
  description: string;
  model: string;
  quantity: number;
  totalPrice: string;
  nameOfStore: string;
  createdAt: Date;
}

const SaleSchema = new Schema<SaleInterface>({
  dateOfTransaction: { type: Date },
  productId: { type: String },
  brandName: { type: String },
  description: { type: String },
  model: { type: String },
  quantity: { type: Number },
  totalPrice: { type: String },
  nameOfStore: { type: String },
  createdAt: { type: Date, default: new Date() },
});

export default model<SaleInterface>("Sale", SaleSchema);
