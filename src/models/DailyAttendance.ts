import { model, Schema } from "mongoose";

export interface DailyAttendanceInterface {
  name: string;
  activity: string;
  productId: string;
  brandName: string;
  description: string;
  model: string;
  quantity: number;
  dateOfActivity: Date;
  createdAt: Date;
}

const DailyAttendanceSchema = new Schema<DailyAttendanceInterface>({
  name: { type: String  },
  activity: { type: String  },
  productId: { type: String, default: "N/A" },
  brandName: { type: String  },
  description: { type: String  },
  model: { type: String  },
  quantity: { type: Number  },
  dateOfActivity: { type: Date  },
  createdAt: { type: Date, default: new Date() },
});

export default model<DailyAttendanceInterface>(
  "DailyAttendance",
  DailyAttendanceSchema
);
