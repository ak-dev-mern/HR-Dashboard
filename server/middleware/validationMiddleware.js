import { body, validationResult } from "express-validator";

export const validateEmployee = [
  body("name").notEmpty().withMessage("Name is required").trim(),
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("department").notEmpty().withMessage("Department is required"),
  body("position").notEmpty().withMessage("Position is required"),
  body("salary").isNumeric().withMessage("Salary must be a number"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];
