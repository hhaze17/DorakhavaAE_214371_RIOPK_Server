import { model, Schema } from "mongoose";

export interface OrderProductInterface {
  productId: string;
  brandName: string;
  description: string;
  model: string;
  quantity: number;
  store: string;
  orderedDate: Date;
  createdAt: Date;
}

const OrderProductSchema = new Schema<OrderProductInterface>({
  productId: { type: String },
  brandName: { type: String },
  description: { type: String },
  model: { type: String },
  quantity: { type: Number },
  store: { type: String },
  orderedDate: { type: Date },
  createdAt: { type: Date, default: new Date() },
});

export default model<OrderProductInterface>("OrderProduct", OrderProductSchema);
