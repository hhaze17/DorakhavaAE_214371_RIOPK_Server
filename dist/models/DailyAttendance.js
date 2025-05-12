"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const DailyAttendanceSchema = new mongoose_1.Schema({
    name: { type: String },
    activity: { type: String },
    productId: { type: String, default: "N/A" },
    brandName: { type: String },
    description: { type: String },
    model: { type: String },
    quantity: { type: Number },
    dateOfActivity: { type: Date },
    createdAt: { type: Date, default: new Date() },
});
exports.default = (0, mongoose_1.model)("DailyAttendance", DailyAttendanceSchema);
