import express from "express";
import {
  getDashboardStats,
  getEmployeeStatsOnly,
  getDepartmentStatsOnly,
  getAttendanceStatsOnly,
  getReportStatsOnly,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.route("/stats").get(getDashboardStats);

router.route("/employees").get(getEmployeeStatsOnly);

router.route("/departments").get(getDepartmentStatsOnly);

router.route("/attendance").get(getAttendanceStatsOnly);

router.route("/reports").get(getReportStatsOnly);

export default router;
