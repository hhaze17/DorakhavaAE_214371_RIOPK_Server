"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePasswordToken = void 0;
const mongoose_1 = require("mongoose");
const CreatePasswordTokenSchema = new mongoose_1.Schema({
    email: { type: String },
    createPasswordToken: { type: String },
    createdAt: { type: Date, default: new Date() },
});
const CreatePasswordToken = (0, mongoose_1.model)("CreatePasswordToken", CreatePasswordTokenSchema);
exports.CreatePasswordToken = CreatePasswordToken;
exports.default = CreatePasswordToken;
