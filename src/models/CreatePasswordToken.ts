import { model, Schema } from "mongoose";

export interface CreatePasswordTokenInterface {
  email: string;
  createPasswordToken: string;
  createdAt: Date;
}

const CreatePasswordTokenSchema = new Schema<CreatePasswordTokenInterface>({
  email: { type: String  },
  createPasswordToken: { type: String  },
  createdAt: { type: Date, default: new Date() },
});

const CreatePasswordToken = model<CreatePasswordTokenInterface>(
  "CreatePasswordToken",
  CreatePasswordTokenSchema
);

export { CreatePasswordToken };
export default CreatePasswordToken;
