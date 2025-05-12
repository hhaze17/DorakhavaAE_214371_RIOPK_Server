"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var UserSchema = new mongoose_1.Schema({
    username: { type: String },
    password: { type: String, "default": "" },
    name: { type: String },
    email: { type: String },
    address: { type: String },
    birthDate: { type: Date },
    contactNumber: { type: String },
    levelOfAccess: { type: String },
    store: { type: String },
    createdAt: { type: Date, "default": new Date() }
});
exports["default"] = (0, mongoose_1.model)("User", UserSchema);
