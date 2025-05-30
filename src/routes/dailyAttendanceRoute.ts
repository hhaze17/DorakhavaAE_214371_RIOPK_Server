import { Router } from "express";
import { getAllDailyAttendanceController } from "../controllers/dailyAttendanceController";
import middleware from "../middleware/middleware";

const router: Router = Router();

// With Token
router.get(
  "/getAllDailyAttendance",
   
  getAllDailyAttendanceController
);

export default router;
