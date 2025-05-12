import { model, Schema } from "mongoose";

export interface PurchaseInterface {
  dateOfTransaction: Date;
  brandName: string;
  description: string;
  model: string;
  quantity: number;
  totalPrice: string;
  createdAt: Date;
}

const PurchaseSchema = new Schema<PurchaseInterface>({
  dateOfTransaction: { type: Date },
  brandName: { type: String },
  description: { type: String },
  model: { type: String },
  quantity: { type: Number },
  totalPrice: { type: String },
  createdAt: { type: Date, default: new Date() },
});

export default model<PurchaseInterface>("Purchase", PurchaseSchema);
