"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetToken = void 0;
const mongoose_1 = require("mongoose");
const ResetTokenSchema = new mongoose_1.Schema({
    email: { type: String  },
    resetToken: { type: String  },
    createdAt: { type: Date, default: new Date() },
});
const ResetToken = (0, mongoose_1.model)("ResetToken", ResetTokenSchema);
exports.ResetToken = ResetToken;
exports.default = ResetToken;
