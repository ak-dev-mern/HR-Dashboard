import Department from "../models/Department.js";
import Employee from "../models/Employee.js";

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    // Get employee count and stats for each department
    const departmentsWithDetails = await Promise.all(
      departments.map(async (dept) => {
        const employees = await Employee.find({ department: dept.name });
        const count = employees.length;
        const avgSalary =
          count > 0
            ? employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / count
            : 0;
        const avgPerformance =
          count > 0
            ? employees.reduce((sum, emp) => sum + (emp.performance || 0), 0) /
              count
            : 0;

        return {
          ...dept.toObject(),
          employeeCount: count,
          averageSalary: Math.round(avgSalary),
          averagePerformance: avgPerformance.toFixed(1),
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: departmentsWithDetails,
      count: departmentsWithDetails.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single department by ID
// @route   GET /api/departments/:id
// @access  Public
export const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Get employees in this department
    const employees = await Employee.find({
      department: department.name,
    }).select("name email position salary performance status");

    const employeeCount = employees.length;
    const avgSalary =
      employeeCount > 0
        ? employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) /
          employeeCount
        : 0;
    const avgPerformance =
      employeeCount > 0
        ? employees.reduce((sum, emp) => sum + (emp.performance || 0), 0) /
          employeeCount
        : 0;

    res.status(200).json({
      success: true,
      data: {
        ...department.toObject(),
        employeeCount,
        averageSalary: Math.round(avgSalary),
        averagePerformance: avgPerformance.toFixed(1),
        employees,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Public
export const createDepartment = async (req, res, next) => {
  try {
    // Check if department already exists
    const existingDepartment = await Department.findOne({
      name: { $regex: new RegExp(`^${req.body.name}$`, "i") },
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department with this name already exists",
      });
    }

    const department = await Department.create(req.body);

    res.status(201).json({
      success: true,
      data: department,
      message: `${department.name} department created successfully`,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Department name already exists",
      });
    }
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Public
export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, head, budget, location } = req.body;

    // Find department
    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // If name is being changed, check for duplicates
    if (name && name !== department.name) {
      const existingDepartment = await Department.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });

      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          message: "Department with this name already exists",
        });
      }

      // Update department name in all employees
      await Employee.updateMany(
        { department: department.name },
        { department: name },
      );
    }

    // Update department
    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      {
        name: name || department.name,
        description:
          description !== undefined ? description : department.description,
        head: head !== undefined ? head : department.head,
        budget: budget !== undefined ? budget : department.budget,
        location: location !== undefined ? location : department.location,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      data: updatedDepartment,
      message: `${updatedDepartment.name} department updated successfully`,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Department name already exists",
      });
    }
    next(error);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Public
export const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find department
    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Check if department has employees
    const employeeCount = await Employee.countDocuments({
      department: department.name,
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete ${department.name} department. It has ${employeeCount} employee(s). Please reassign or transfer employees first.`,
        employeeCount,
      });
    }

    // Delete department
    await Department.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `${department.name} department deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get department statistics
// @route   GET /api/departments/stats
// @access  Public
export const getDepartmentStats = async (req, res, next) => {
  try {
    const departments = await Department.find();

    const stats = await Promise.all(
      departments.map(async (dept) => {
        const employees = await Employee.find({ department: dept.name });
        const count = employees.length;
        const totalSalary = employees.reduce(
          (sum, emp) => sum + (emp.salary || 0),
          0,
        );
        const totalPerformance = employees.reduce(
          (sum, emp) => sum + (emp.performance || 0),
          0,
        );

        return {
          id: dept._id,
          name: dept.name,
          employeeCount: count,
          totalSalary,
          averageSalary: count > 0 ? Math.round(totalSalary / count) : 0,
          averagePerformance:
            count > 0 ? (totalPerformance / count).toFixed(1) : 0,
          budget: dept.budget || 0,
          budgetUtilization:
            dept.budget && count > 0
              ? Math.round((totalSalary / dept.budget) * 100)
              : 0,
          head: dept.head,
          location: dept.location,
        };
      }),
    );

    // Overall statistics
    const totalEmployees = stats.reduce(
      (sum, dept) => sum + dept.employeeCount,
      0,
    );
    const totalBudget = stats.reduce(
      (sum, dept) => sum + (dept.budget || 0),
      0,
    );
    const overallAvgSalary =
      totalEmployees > 0
        ? stats.reduce((sum, dept) => sum + dept.totalSalary, 0) /
          totalEmployees
        : 0;

    res.status(200).json({
      success: true,
      data: {
        departments: stats,
        summary: {
          totalDepartments: departments.length,
          totalEmployees,
          totalBudget,
          overallAverageSalary: Math.round(overallAvgSalary),
          departmentsWithEmployees: stats.filter((d) => d.employeeCount > 0)
            .length,
          departmentsWithoutEmployees: stats.filter(
            (d) => d.employeeCount === 0,
          ).length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employees by department
// @route   GET /api/departments/:id/employees
// @access  Public
export const getDepartmentEmployees = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const employees = await Employee.find({ department: department.name })
      .select(
        "name email phone position salary performance status joinDate avatar",
      )
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: {
        department: department.name,
        employeeCount: employees.length,
        employees,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Transfer employees to another department
// @route   POST /api/departments/transfer
// @access  Public
export const transferEmployees = async (req, res, next) => {
  try {
    const { sourceDepartmentId, targetDepartmentId, employeeIds } = req.body;

    // Get source and target departments
    const sourceDepartment = await Department.findById(sourceDepartmentId);
    const targetDepartment = await Department.findById(targetDepartmentId);

    if (!sourceDepartment || !targetDepartment) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Transfer employees
    const updateQuery =
      employeeIds && employeeIds.length > 0
        ? { _id: { $in: employeeIds } }
        : { department: sourceDepartment.name };

    const result = await Employee.updateMany(updateQuery, {
      department: targetDepartment.name,
    });

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} employee(s) transferred from ${sourceDepartment.name} to ${targetDepartment.name}`,
      data: {
        transferredCount: result.modifiedCount,
        sourceDepartment: sourceDepartment.name,
        targetDepartment: targetDepartment.name,
      },
    });
  } catch (error) {
    next(error);
  }
};
