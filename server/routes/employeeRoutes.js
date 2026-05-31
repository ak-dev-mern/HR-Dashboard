import express from "express";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  bulkCreateEmployees,
  updateEmployeeStatus,
} from "../controllers/employeeController.js";
import { validateEmployee } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.route("/").get(getEmployees).post(validateEmployee, createEmployee);

router.route("/bulk").post(bulkCreateEmployees);

router
  .route("/:id")
  .get(getEmployeeById)
  .put(validateEmployee, updateEmployee)
  .delete(deleteEmployee);

router.route("/:id/status").patch(updateEmployeeStatus);

export default router;
