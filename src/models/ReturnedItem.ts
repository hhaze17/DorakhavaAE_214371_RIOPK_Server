import { model, Schema } from "mongoose";

export interface ReturnedItemInterface {
  productId: string;
  brandName: string;
  description: string;
  model: string;
  quantity: number;
  reason: string;
  store: string;
  returnedDate: Date;
  createdAt: Date;
}

const ReturnedItemSchema = new Schema<ReturnedItemInterface>({
  productId: { type: String },
  brandName: { type: String },
  description: { type: String },
  model: { type: String },
  quantity: { type: Number },
  reason: { type: String },
  store: { type: String },
  returnedDate: { type: Date },
  createdAt: { type: Date, default: new Date() },
});

export default model<ReturnedItemInterface>("ReturnedItem", ReturnedItemSchema);
