import Employee from "../models/Employee.js";

// @desc    Get all employees
// @route   GET /api/employees
// @access  Public
export const getEmployees = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, department, status, search } = req.query;

    let query = {};

    // Filter by department
    if (department && department !== "All") {
      query.department = department;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search by name, email, or position
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
      ];
    }

    const employees = await Employee.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Employee.countDocuments(query);

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Public
export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Public
export const createEmployee = async (req, res, next) => {
  try {
    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ email: req.body.email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee with this email already exists",
      });
    }

    const employee = await Employee.create(req.body);

    res.status(201).json({
      success: true,
      data: employee,
      message: "Employee created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Public
export const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true },
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
      message: "Employee updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Public
export const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Bulk create employees
// @route   POST /api/employees/bulk
// @access  Public
export const bulkCreateEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.insertMany(req.body);

    res.status(201).json({
      success: true,
      data: employees,
      message: `${employees.length} employees created successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee status
// @route   PATCH /api/employees/:id/status
// @access  Public
export const updateEmployeeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["active", "on-leave", "inactive", "terminated"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true },
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
      message: `Employee status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
};
