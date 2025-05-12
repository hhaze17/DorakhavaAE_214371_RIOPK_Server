import { model, Schema } from "mongoose";

export interface OutgoingProductInterface {
  productId: string;
  brandName: string;
  description: string;
  model: string;
  quantity: number;
  pricePerUnit: string;
  dateOfTransaction: Date;
  store: string;
  createdAt: Date;
}

const OutgoingProductSchema = new Schema<OutgoingProductInterface>({
  productId: { type: String },
  brandName: { type: String },
  description: { type: String },
  model: { type: String },
  quantity: { type: Number },
  pricePerUnit: { type: String },
  dateOfTransaction: { type: Date },
  store: { type: String },
  createdAt: { type: Date, default: new Date() },
});

export default model<OutgoingProductInterface>(
  "OutgoingProduct",
  OutgoingProductSchema
);
