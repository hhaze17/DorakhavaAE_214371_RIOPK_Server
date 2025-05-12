"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dailyAttendanceController_1 = require("../controllers/dailyAttendanceController");
const router = (0, express_1.Router)();
// With Token
router.get("/getAllDailyAttendance", dailyAttendanceController_1.getAllDailyAttendanceController);
exports.default = router;
