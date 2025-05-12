import { model, Schema } from "mongoose";

export interface StoreInventoryInterface {
  productId: string;
  brandName: string;
  description: string;
  model: string;
  quantity: number;
  wareHousePrice: string;
  storePrice: string;
  store: string;
  createdAt: Date;
}

const StoreInventorySchema = new Schema<StoreInventoryInterface>({
  productId: { type: String },
  brandName: { type: String },
  description: { type: String },
  model: { type: String },
  quantity: { type: Number },
  wareHousePrice: { type: String },
  storePrice: { type: String, default: "N/A" },
  store: { type: String },
  createdAt: { type: Date, default: new Date() },
});

export default model<StoreInventoryInterface>(
  "StoreInventory",
  StoreInventorySchema
);
