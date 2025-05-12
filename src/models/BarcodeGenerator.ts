import { model, Schema } from "mongoose";

export interface BarcodeGeneratorInterface {
  userId: string;
  productId: string;
  createdAt: Date;
}

const BarcodeGeneratorSchema = new Schema<BarcodeGeneratorInterface>({
  userId: { type: String },
  productId: { type: String  },
  createdAt: { type: Date, default: new Date() },
});

export default model<BarcodeGeneratorInterface>(
  "BarcodeGenerator",
  BarcodeGeneratorSchema
);
