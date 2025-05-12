import { model, Schema } from "mongoose";

export interface IncomingProductInterface {
  brandName: string;
  description: string;
  model: string;
  quantity: number;
  totalPrice: string;
  dateOfTransaction: Date;
  createdAt: Date;
}

const IncomingProductSchema = new Schema<IncomingProductInterface>({
  brandName: { type: String},
  description: { type: String},
  model: { type: String },
  quantity: { type: Number},
  totalPrice: { type: String},
  dateOfTransaction: { type: Date},
  createdAt: { type: Date, default: new Date() },
});

export default model<IncomingProductInterface>(
  "IncomingProduct",
  IncomingProductSchema
);
