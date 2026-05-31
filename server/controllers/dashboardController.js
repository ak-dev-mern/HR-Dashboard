import Employee from "../models/Employee.js";
import Department from "../models/Department.js";

// @desc    Get complete dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Public
export const getDashboardStats = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Employee Statistics
    const employeeStats = await getEmployeeStats();

    // Department Statistics
    const departmentStats = await getDepartmentStats();

    // Attendance Statistics
    const attendanceStats = await getAttendanceStats(startOfMonth, endOfMonth);

    // Report Statistics
    const reportStats = await getReportStats(currentYear);

    // Recent Activities
    const recentActivities = await getRecentActivities();

    res.status(200).json({
      success: true,
      data: {
        employees: employeeStats,
        departments: departmentStats,
        attendance: attendanceStats,
        reports: reportStats,
        recentActivities,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Employee Statistics Function
const getEmployeeStats = async () => {
  const currentYear = new Date().getFullYear();

  // Get basic counts
  const totalEmployees = await Employee.countDocuments();
  const activeEmployees = await Employee.countDocuments({ status: "active" });
  const onLeaveCount = await Employee.countDocuments({ status: "on-leave" });
  const inactiveCount = await Employee.countDocuments({ status: "inactive" });

  // New hires this year
  const newHiresThisYear = await Employee.countDocuments({
    joinDate: {
      $gte: new Date(currentYear, 0, 1),
      $lte: new Date(currentYear, 11, 31),
    },
  });

  // Gender statistics
  const genderStats = await Employee.aggregate([
    {
      $group: {
        _id: { $ifNull: ["$gender", "Not specified"] },
        count: { $sum: 1 },
      },
    },
  ]);

  // Performance distribution
  const performanceDistribution = await Employee.aggregate([
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $gte: ["$performance", 4.5] }, then: "Excellent" },
              { case: { $gte: ["$performance", 3.5] }, then: "Good" },
              { case: { $gte: ["$performance", 2.5] }, then: "Average" },
            ],
            default: "Needs Improvement",
          },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  // Monthly hires
  const monthlyHiresRaw = await Employee.aggregate([
    {
      $match: {
        joinDate: {
          $gte: new Date(currentYear, 0, 1),
          $lte: new Date(currentYear, 11, 31),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$joinDate" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const monthlyHires = monthlyHiresRaw.map((m) => ({
    month: getMonthName(m._id),
    count: m.count,
  }));

  // Salary statistics
  const salaryStats = await Employee.aggregate([
    {
      $group: {
        _id: null,
        minSalary: { $min: "$salary" },
        maxSalary: { $max: "$salary" },
        avgSalary: { $avg: "$salary" },
        totalSalary: { $sum: "$salary" },
      },
    },
  ]);

  // Status distribution
  const statusDistribution = await Employee.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Department distribution
  const departmentDistribution = await Employee.aggregate([
    {
      $group: {
        _id: "$department",
        count: { $sum: 1 },
        averageSalary: { $avg: "$salary" },
        averagePerformance: { $avg: "$performance" },
        activeCount: {
          $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        department: "$_id",
        count: 1,
        averageSalary: { $round: ["$averageSalary", 2] },
        averagePerformance: { $round: ["$averagePerformance", 1] },
        activeCount: 1,
        percentage: {
          $multiply: [{ $divide: ["$count", totalEmployees || 1] }, 100],
        },
        _id: 0,
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  // Calculate turnover rate
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const turnoverCount = await Employee.countDocuments({
    status: "inactive",
    updatedAt: { $gte: sixMonthsAgo },
  });

  const turnoverRate =
    totalEmployees > 0 ? (turnoverCount / totalEmployees) * 100 : 0;

  // Get top performers
  const topPerformers = await Employee.find({
    performance: { $gte: 4.5 },
    status: "active",
  })
    .select("name position department performance")
    .sort({ performance: -1 })
    .limit(5);

  // Get upcoming anniversaries
  const today = new Date();
  const next30Days = new Date();
  next30Days.setDate(today.getDate() + 30);

  const upcomingAnniversaries = await Employee.find({
    joinDate: {
      $gte: today,
      $lte: next30Days,
    },
    status: "active",
  })
    .select("name joinDate position department")
    .limit(5);

  // Calculate average employment duration
  const employeesWithJoinDate = await Employee.find({
    status: "active",
    joinDate: { $exists: true },
  });
  let totalDuration = 0;
  employeesWithJoinDate.forEach((emp) => {
    const diff = Date.now() - new Date(emp.joinDate);
    const years = diff / (1000 * 60 * 60 * 24 * 365);
    totalDuration += years;
  });
  const avgEmploymentDuration =
    employeesWithJoinDate.length > 0
      ? totalDuration / employeesWithJoinDate.length
      : 0;

  // Get average performance
  const avgPerformanceResult = await Employee.aggregate([
    {
      $group: {
        _id: null,
        avg: { $avg: "$performance" },
      },
    },
  ]);
  const avgPerformance = avgPerformanceResult[0]?.avg || 0;

  return {
    overview: {
      total: totalEmployees,
      active: activeEmployees,
      onLeave: onLeaveCount,
      inactive: inactiveCount,
      newHiresThisYear,
      turnoverRate: parseFloat(turnoverRate.toFixed(1)),
      averageEmploymentDuration: avgEmploymentDuration.toFixed(1),
      averagePerformance: parseFloat(avgPerformance.toFixed(2)),
    },
    performance: {
      average: avgPerformance.toFixed(2),
      distribution: performanceDistribution,
      topPerformers,
    },
    demographics: {
      gender: genderStats,
      status: statusDistribution,
    },
    salary: {
      average: Math.round(salaryStats[0]?.avgSalary || 0),
      minimum: salaryStats[0]?.minSalary || 0,
      maximum: salaryStats[0]?.maxSalary || 0,
      total: salaryStats[0]?.totalSalary || 0,
    },
    departments: departmentDistribution,
    hiring: {
      monthly: monthlyHires,
      totalThisYear: newHiresThisYear,
    },
    upcomingAnniversaries,
  };
};

// Department Statistics Function
const getDepartmentStats = async () => {
  const departments = await Department.find();

  const departmentMetrics = await Promise.all(
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
        head: dept.head || "Not assigned",
        budget: dept.budget || 0,
        location: dept.location || "Not specified",
        metrics: {
          averageSalary: count > 0 ? Math.round(totalSalary / count) : 0,
          averagePerformance:
            count > 0 ? (totalPerformance / count).toFixed(1) : 0,
          budgetUtilization:
            dept.budget && count > 0 && totalSalary > 0
              ? Math.round((totalSalary / dept.budget) * 100)
              : 0,
          activeEmployees: employees.filter((e) => e.status === "active")
            .length,
        },
      };
    }),
  );

  const totalEmployees = departmentMetrics.reduce(
    (sum, dept) => sum + dept.employeeCount,
    0,
  );
  const totalBudget = departmentMetrics.reduce(
    (sum, dept) => sum + (dept.budget || 0),
    0,
  );
  const departmentsWithEmployees = departmentMetrics.filter(
    (d) => d.employeeCount > 0,
  ).length;

  const largestDepartment =
    departmentMetrics.length > 0
      ? departmentMetrics.reduce(
          (max, dept) => (dept.employeeCount > max.employeeCount ? dept : max),
          departmentMetrics[0],
        )
      : null;

  return {
    overview: {
      totalDepartments: departments.length,
      totalEmployees,
      totalBudget,
      averageBudgetPerDepartment:
        departments.length > 0
          ? Math.round(totalBudget / departments.length)
          : 0,
      departmentsWithEmployees,
      departmentsWithoutEmployees:
        departments.length - departmentsWithEmployees,
    },
    departments: departmentMetrics,
    largestDepartment,
  };
};

// Attendance Statistics Function
const getAttendanceStats = async (startOfMonth, endOfMonth) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Calculate working days in current month (Monday-Friday)
  const getWorkingDaysCount = (year, month) => {
    let workingDays = 0;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }
    return workingDays;
  };

  const totalWorkingDays = getWorkingDaysCount(currentYear, currentMonth);

  // Get all active employees
  const activeEmployees = await Employee.find({ status: "active" }).select(
    "name department joinDate",
  );

  // Calculate attendance metrics (based on real data where available)
  const totalEmployees = activeEmployees.length;

  // For demo, calculate realistic attendance based on employee data
  // In production, you would have an Attendance collection
  const presentCount = Math.floor(totalEmployees * 0.85); // 85% attendance rate
  const onTimeCount = Math.floor(presentCount * 0.9); // 90% of present are on time
  const lateCount = presentCount - onTimeCount;
  const absentCount = totalEmployees - presentCount;
  const onLeaveCount = Math.floor(totalEmployees * 0.05); // 5% on leave

  const attendanceMetrics = {
    totalEmployees,
    workingDays: totalWorkingDays,
    presentToday: presentCount,
    onTime: onTimeCount,
    late: lateCount,
    absent: absentCount,
    onLeave: onLeaveCount,
    attendancePercentage:
      totalEmployees > 0
        ? ((presentCount / totalEmployees) * 100).toFixed(1)
        : 0,
  };

  // Department-wise attendance
  const departments = [...new Set(activeEmployees.map((e) => e.department))];
  const departmentAttendance = await Promise.all(
    departments.map(async (dept) => {
      const deptEmployees = activeEmployees.filter(
        (e) => e.department === dept,
      );
      const deptTotal = deptEmployees.length;
      // Simulate attendance based on department size
      const presentCount = Math.floor(deptTotal * (0.8 + Math.random() * 0.15));
      return {
        department: dept,
        totalEmployees: deptTotal,
        present: presentCount,
        attendancePercentage:
          deptTotal > 0 ? ((presentCount / deptTotal) * 100).toFixed(1) : 0,
      };
    }),
  );

  // Monthly attendance trend (last 6 months)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    // Simulate realistic attendance rates between 75% and 95%
    const baseRate = 85;
    const variation = (Math.random() - 0.5) * 10;
    monthlyTrend.push({
      month: getMonthName(date.getMonth()),
      year: date.getFullYear(),
      attendanceRate: Math.min(98, Math.max(70, baseRate + variation)),
    });
  }

  return {
    overview: {
      totalEmployees: attendanceMetrics.totalEmployees,
      workingDays: attendanceMetrics.workingDays,
      presentToday: attendanceMetrics.presentToday,
      attendanceRate: attendanceMetrics.attendancePercentage,
      onTimeRate:
        totalEmployees > 0
          ? ((attendanceMetrics.onTime / totalEmployees) * 100).toFixed(1)
          : 0,
    },
    today: {
      present: attendanceMetrics.presentToday,
      absent: attendanceMetrics.absent,
      late: attendanceMetrics.late,
      onLeave: attendanceMetrics.onLeave,
    },
    departmentWise: departmentAttendance,
    monthlyTrend,
  };
};

// Report Statistics Function
const getReportStats = async (currentYear) => {
  // Monthly hiring report
  const monthlyHiringRaw = await Employee.aggregate([
    {
      $match: {
        joinDate: {
          $gte: new Date(currentYear, 0, 1),
          $lte: new Date(currentYear, 11, 31),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$joinDate" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const monthlyHiring = monthlyHiringRaw.map((m) => ({
    month: getMonthName(m._id),
    count: m.count,
  }));

  // Department performance report
  const departmentPerformanceRaw = await Employee.aggregate([
    {
      $group: {
        _id: "$department",
        totalEmployees: { $sum: 1 },
        averagePerformance: { $avg: "$performance" },
        averageSalary: { $avg: "$salary" },
        totalSalary: { $sum: "$salary" },
        activeCount: {
          $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        department: "$_id",
        totalEmployees: 1,
        averagePerformance: { $round: ["$averagePerformance", 2] },
        averageSalary: { $round: ["$averageSalary", 2] },
        totalSalary: 1,
        activeCount: 1,
        _id: 0,
      },
    },
  ]);

  // Salary distribution
  const salaryDistributionRaw = await Employee.aggregate([
    {
      $bucket: {
        groupBy: "$salary",
        boundaries: [0, 30000, 50000, 70000, 90000, 120000, 200000],
        default: "Other",
        output: {
          count: { $sum: 1 },
        },
      },
    },
  ]);

  const salaryDistribution = salaryDistributionRaw.map((s) => ({
    range: getSalaryRange(s._id),
    count: s.count,
  }));

  // Status distribution
  const totalEmployees = await Employee.countDocuments();
  const statusDistributionRaw = await Employee.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const statusDistribution = statusDistributionRaw.map((s) => ({
    _id: s._id || "unknown",
    count: s.count,
    percentage: totalEmployees > 0 ? (s.count / totalEmployees) * 100 : 0,
  }));

  // Summary statistics
  const salarySummary = await Employee.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$salary" },
        avg: { $avg: "$salary" },
      },
    },
  ]);

  const performanceSummary = await Employee.aggregate([
    {
      $group: {
        _id: null,
        avg: { $avg: "$performance" },
      },
    },
  ]);

  const availableReports = [
    {
      id: "employee-summary",
      name: "Employee Summary Report",
      description:
        "Complete overview of all employees including demographics and status",
      type: "employee",
      lastGenerated: new Date().toISOString(),
    },
    {
      id: "department-performance",
      name: "Department Performance Report",
      description: "Department-wise performance metrics and analytics",
      type: "department",
      lastGenerated: new Date().toISOString(),
    },
    {
      id: "salary-analysis",
      name: "Salary Analysis Report",
      description: "Salary distribution, averages, and comparisons",
      type: "salary",
      lastGenerated: new Date().toISOString(),
    },
    {
      id: "hiring-trends",
      name: "Hiring Trends Report",
      description: "Monthly and yearly hiring patterns",
      type: "hiring",
      lastGenerated: new Date().toISOString(),
    },
    {
      id: "performance-review",
      name: "Performance Review Report",
      description: "Employee performance ratings and distributions",
      type: "performance",
      lastGenerated: new Date().toISOString(),
    },
  ];

  return {
    summary: {
      totalEmployees,
      totalDepartments: await Department.countDocuments(),
      totalSalary: salarySummary[0]?.total || 0,
      averageSalary: Math.round(salarySummary[0]?.avg || 0),
      averagePerformance: performanceSummary[0]?.avg?.toFixed(2) || 0,
    },
    monthlyHiring,
    departmentPerformance: departmentPerformanceRaw,
    salaryDistribution,
    statusDistribution,
    availableReports,
    lastReportGenerated: new Date().toISOString(),
  };
};

// Recent Activities Function
const getRecentActivities = async () => {
  // Get recent employee additions
  const recentEmployees = await Employee.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name department position createdAt");

  // Get recent department updates
  const recentDepartments = await Department.find()
    .sort({ updatedAt: -1 })
    .limit(3)
    .select("name head updatedAt");

  const activities = [];

  // Add recent employee hires
  recentEmployees.forEach((emp) => {
    activities.push({
      id: `hire-${emp._id}`,
      type: "hire",
      action: "New employee joined",
      title: `${emp.name} joined as ${emp.position}`,
      department: emp.department,
      time: getTimeAgo(emp.createdAt),
      timestamp: emp.createdAt,
      color: "green",
    });
  });

  // Add recent department updates
  recentDepartments.forEach((dept) => {
    activities.push({
      id: `dept-${dept._id}`,
      type: "department",
      action: "Department updated",
      title: `${dept.name} department information updated`,
      department: dept.name,
      time: getTimeAgo(dept.updatedAt),
      timestamp: dept.updatedAt,
      color: "blue",
    });
  });

  // Sort by timestamp (newest first)
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return activities.slice(0, 10);
};

// Helper Functions
const getMonthName = (monthNumber) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months[monthNumber - 1];
};

const getSalaryRange = (boundary) => {
  if (boundary === 0) return "Under $30k";
  if (boundary === 30000) return "$30k - $50k";
  if (boundary === 50000) return "$50k - $70k";
  if (boundary === 70000) return "$70k - $90k";
  if (boundary === 90000) return "$90k - $120k";
  if (boundary === 120000) return "$120k - $200k";
  return "Above $200k";
};

const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
    }
  }
  return "Just now";
};

// Individual stat endpoints
export const getEmployeeStatsOnly = async (req, res, next) => {
  try {
    const stats = await getEmployeeStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentStatsOnly = async (req, res, next) => {
  try {
    const stats = await getDepartmentStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceStatsOnly = async (req, res, next) => {
  try {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );
    const endOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
    );
    const stats = await getAttendanceStats(startOfMonth, endOfMonth);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getReportStatsOnly = async (req, res, next) => {
  try {
    const stats = await getReportStats(new Date().getFullYear());
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
