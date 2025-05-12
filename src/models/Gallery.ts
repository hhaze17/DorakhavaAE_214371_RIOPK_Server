import { model, Schema } from "mongoose";

export interface GalleryInterface {
  brandName: string;
  itemDescription: string;
  classification: string;
  price: string;
  image: string;
  createdAt: Date;
}

const GallerySchema = new Schema<GalleryInterface>({
  brandName: { type: String },
  itemDescription: { type: String },
  classification: { type: String },
  price: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: new Date() },
});

export default model<GalleryInterface>("Gallery", GallerySchema);
