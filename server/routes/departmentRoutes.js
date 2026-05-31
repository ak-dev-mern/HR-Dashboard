import express from "express";
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats,
  getDepartmentEmployees,
  transferEmployees,
} from "../controllers/departmentController.js";

const router = express.Router();

router.route("/").get(getDepartments).post(createDepartment);

router.route("/stats").get(getDepartmentStats);

router.route("/transfer").post(transferEmployees);

router
  .route("/:id")
  .get(getDepartmentById)
  .put(updateDepartment)
  .delete(deleteDepartment);

router.route("/:id/employees").get(getDepartmentEmployees);

export default router;
