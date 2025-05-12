import { model, Schema } from "mongoose";

export interface ResetTokenInterface {
  email: string;
  resetToken: string;
  createdAt: Date;
}

const ResetTokenSchema = new Schema<ResetTokenInterface>({
  email: { type: String  },
  resetToken: { type: String  },
  createdAt: { type: Date, default: new Date() },
});

const ResetToken = model<ResetTokenInterface>("ResetToken", ResetTokenSchema);
export { ResetToken };
export default ResetToken;
