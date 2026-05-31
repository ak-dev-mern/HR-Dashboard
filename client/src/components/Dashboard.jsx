import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchDashboardStats,
  fetchEmployeeStats,
  fetchDepartmentStats,
  fetchAttendanceStats,
  fetchReportStats,
  selectDashboardStats,
  selectDashboardLoading,
  selectDashboardError,
  selectDashboardLastUpdated,
  selectEmployeeOverview,
  selectEmployeePerformance,
  selectEmployeeDemographics,
  selectEmployeeSalary,
  selectDepartmentDistribution,
  selectTopPerformers,
  selectUpcomingAnniversaries,
  selectDepartmentOverview,
  selectAllDepartments,
  selectAttendanceOverview,
  selectTodayAttendance,
  selectDepartmentAttendance,
  selectAttendanceTrend,
  selectReportsSummary,
  selectMonthlyHiring,
  selectDepartmentPerformance,
  selectSalaryDistribution,
  selectStatusDistribution,
  selectAvailableReports,
  selectRecentActivities,
  setDashboardFilters,
} from "../store/slices/dashboardSlice";
import {
  Users,
  UserCheck,
  UserMinus,
  TrendingUp,
  Award,
  DollarSign,
  Calendar,
  Clock,
  Briefcase,
  Activity,
  ArrowUp,
  ArrowDown,
  Download,
  RefreshCw,
  FileText,
  AlertCircle,
  Building2,
  Heart,
  PieChart,
  BarChart3,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendValue,
  subtitle,
}) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300 group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        {trend && (
          <div
            className={`flex items-center gap-1 mt-2 ${trendValue >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {trendValue >= 0 ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
            <span className="text-xs font-medium">
              {Math.abs(trendValue)}% {trend}
            </span>
          </div>
        )}
      </div>
      <div
        className={`p-4 rounded-2xl ${color} group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Selectors for different data sections
  const stats = useSelector(selectDashboardStats);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const lastUpdated = useSelector(selectDashboardLastUpdated);

  // Employee selectors
  const employeeOverview = useSelector(selectEmployeeOverview);
  const employeePerformance = useSelector(selectEmployeePerformance);
  const employeeDemographics = useSelector(selectEmployeeDemographics);
  const employeeSalary = useSelector(selectEmployeeSalary);
  const departmentDistribution = useSelector(selectDepartmentDistribution);
  const topPerformers = useSelector(selectTopPerformers);
  const upcomingAnniversaries = useSelector(selectUpcomingAnniversaries);

  // Department selectors
  const departmentOverview = useSelector(selectDepartmentOverview);
  const allDepartments = useSelector(selectAllDepartments);

  // Attendance selectors
  const attendanceOverview = useSelector(selectAttendanceOverview);
  const todayAttendance = useSelector(selectTodayAttendance);
  const departmentAttendance = useSelector(selectDepartmentAttendance);
  const attendanceTrend = useSelector(selectAttendanceTrend);

  // Reports selectors
  const reportsSummary = useSelector(selectReportsSummary);
  const monthlyHiring = useSelector(selectMonthlyHiring);
  const departmentPerformance = useSelector(selectDepartmentPerformance);
  const salaryDistribution = useSelector(selectSalaryDistribution);
  const statusDistribution = useSelector(selectStatusDistribution);
  const availableReports = useSelector(selectAvailableReports);

  // Recent activities
  const recentActivities = useSelector(selectRecentActivities);

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadAllDashboardData();
  }, []);

  const loadAllDashboardData = async () => {
    try {
      await dispatch(fetchDashboardStats()).unwrap();
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  const loadEmployeeData = async () => {
    try {
      await dispatch(fetchEmployeeStats()).unwrap();
    } catch (error) {
      console.error("Failed to load employee data:", error);
    }
  };

  const loadDepartmentData = async () => {
    try {
      await dispatch(fetchDepartmentStats()).unwrap();
    } catch (error) {
      console.error("Failed to load department data:", error);
    }
  };

  const loadAttendanceData = async () => {
    try {
      await dispatch(fetchAttendanceStats()).unwrap();
    } catch (error) {
      console.error("Failed to load attendance data:", error);
    }
  };

  const loadReportData = async () => {
    try {
      await dispatch(fetchReportStats()).unwrap();
    } catch (error) {
      console.error("Failed to load report data:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllDashboardData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleExport = () => {
    const exportData = {
      stats,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `dashboard-export-${new Date().toISOString().split("T")[0]}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "on-leave":
        return "bg-yellow-100 text-yellow-700";
      case "inactive":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">
            Loading dashboard data...
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Please wait while we fetch the latest insights
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Data
          </h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!employeeOverview || employeeOverview.total === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Data Available
          </h3>
          <p className="text-gray-500 mb-6">
            Start by adding employees to see dashboard insights
          </p>
          <button
            onClick={() => navigate("/employees/add")}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
          >
            Add Your First Employee
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Here's what's happening with your workforce today.
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
            disabled={refreshing}
          >
            <RefreshCw
              className={`w-5 h-5 text-gray-600 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Export</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">
              {new Date().toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {[
            { id: "overview", label: "Overview", icon: PieChart },
            { id: "employees", label: "Employees", icon: Users },
            { id: "departments", label: "Departments", icon: Building2 },
            { id: "attendance", label: "Attendance", icon: Calendar },
            { id: "reports", label: "Reports", icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <StatCard
              title="Total Employees"
              value={employeeOverview?.total || 0}
              icon={Users}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              trend="from last month"
              trendValue={5.2}
              subtitle="Across all departments"
            />
            <StatCard
              title="Active Employees"
              value={employeeOverview?.active || 0}
              icon={UserCheck}
              color="bg-gradient-to-br from-green-500 to-green-600"
              trend="from last month"
              trendValue={3.1}
              subtitle={`${employeeOverview?.total > 0 ? Math.round((employeeOverview.active / employeeOverview.total) * 100) : 0}% of workforce`}
            />
            <StatCard
              title="On Leave"
              value={employeeOverview?.onLeave || 0}
              icon={UserMinus}
              color="bg-gradient-to-br from-yellow-500 to-yellow-600"
              trend="from last month"
              trendValue={-2.5}
            />
            <StatCard
              title="New Hires"
              value={employeeOverview?.newHiresThisYear || 0}
              icon={TrendingUp}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              trend="this year"
              trendValue={12.5}
              subtitle="Year to date"
            />
            <StatCard
              title="Avg Performance"
              value={`${employeePerformance?.average || 0}/5.0`}
              icon={Award}
              color="bg-gradient-to-br from-pink-500 to-pink-600"
              trend="improvement"
              trendValue={8.3}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Distribution */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Department Distribution
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Employee count by department
                  </p>
                </div>
                <Building2 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-5">
                {departmentDistribution && departmentDistribution.length > 0 ? (
                  departmentDistribution.map((dept, idx) => {
                    const colors = [
                      "from-blue-500 to-blue-400",
                      "from-purple-500 to-purple-400",
                      "from-green-500 to-green-400",
                      "from-yellow-500 to-yellow-400",
                      "from-pink-500 to-pink-400",
                      "from-indigo-500 to-indigo-400",
                    ];
                    return (
                      <div key={dept.department}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors[idx % colors.length]}`}
                            ></div>
                            <span className="text-sm font-medium text-gray-700">
                              {dept.department}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                              {dept.count} employees
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {dept.percentage?.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`bg-gradient-to-r ${colors[idx % colors.length]} h-2 rounded-full transition-all duration-1000`}
                            style={{ width: `${dept.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No department data available
                  </div>
                )}
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Top Performers
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Highest performing employees
                  </p>
                </div>
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="space-y-4">
                {topPerformers && topPerformers.length > 0 ? (
                  topPerformers.map((performer, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold">
                          {performer.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {performer.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {performer.position} • {performer.department}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-yellow-600">
                          {performer.performance}
                        </span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No top performers data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Anniversaries & Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Anniversaries */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Upcoming Anniversaries
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Work anniversaries in the next 30 days
                  </p>
                </div>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {upcomingAnniversaries && upcomingAnniversaries.length > 0 ? (
                  upcomingAnniversaries.map((anniversary, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                        {anniversary.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {anniversary.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {anniversary.position} • {anniversary.department}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">
                          {new Date(anniversary.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No upcoming anniversaries
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-600 text-sm font-medium">
                      Average Salary
                    </p>
                    <p className="text-2xl font-bold text-indigo-900">
                      ${employeeSalary?.average?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-indigo-500 opacity-75" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">
                      Turnover Rate
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {employeeOverview?.turnoverRate || 0}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500 opacity-75" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">
                      Total Salary Budget
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      ${employeeSalary?.total?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-500 opacity-75" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Employees Tab */}
      {activeTab === "employees" && (
        <div className="space-y-6">
          {/* Employee Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-sm">Total Employees</p>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {employeeOverview?.total || 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-sm">Active</p>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {employeeOverview?.active || 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-sm">On Leave</p>
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {employeeOverview?.onLeave || 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-sm">Inactive</p>
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {employeeOverview?.inactive || 0}
              </p>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 text-lg mb-4">
              Status Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {statusDistribution?.map((status) => (
                <div key={status._id} className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 capitalize">
                    {status._id}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {status.count}
                  </p>
                  <p className="text-xs text-gray-400">
                    {status.percentage?.toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Salary Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 text-lg mb-4">
              Salary Distribution
            </h3>
            <div className="space-y-4">
              {salaryDistribution?.map((range, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{range.range}</span>
                    <span className="font-medium text-gray-900">
                      {range.count} employees
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{
                        width: `${(range.count / employeeOverview?.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === "departments" && (
        <div className="space-y-6">
          {/* Department Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <p className="text-gray-500 text-sm">Total Departments</p>
              <p className="text-3xl font-bold text-gray-900">
                {departmentOverview?.totalDepartments || 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <p className="text-gray-500 text-sm">Total Budget</p>
              <p className="text-3xl font-bold text-gray-900">
                ${departmentOverview?.totalBudget?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <p className="text-gray-500 text-sm">
                Departments with Employees
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {departmentOverview?.departmentsWithEmployees || 0}
              </p>
            </div>
          </div>

          {/* Department List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Department
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Head
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Employees
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Avg Salary
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Avg Performance
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Budget
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allDepartments?.map((dept) => (
                    <tr key={dept.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {dept.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {dept.head || "Not assigned"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {dept.employeeCount}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        ${dept.metrics?.averageSalary?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">
                            {dept.metrics?.averagePerformance || 0}
                          </span>
                          <Award className="w-4 h-4 text-yellow-500" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        ${dept.budget?.toLocaleString() || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          {/* Attendance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <p className="text-gray-500 text-sm">Present Today</p>
              <p className="text-3xl font-bold text-green-600">
                {todayAttendance?.present || 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Attendance Rate: {attendanceOverview?.attendanceRate || 0}%
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <p className="text-gray-500 text-sm">Absent</p>
              <p className="text-3xl font-bold text-red-600">
                {todayAttendance?.absent || 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <p className="text-gray-500 text-sm">Late</p>
              <p className="text-3xl font-bold text-yellow-600">
                {todayAttendance?.late || 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <p className="text-gray-500 text-sm">On Leave</p>
              <p className="text-3xl font-bold text-blue-600">
                {todayAttendance?.onLeave || 0}
              </p>
            </div>
          </div>

          {/* Attendance Trend */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 text-lg mb-4">
              Monthly Attendance Trend
            </h3>
            <div className="relative h-64">
              <div className="absolute inset-0 flex items-end justify-between gap-2">
                {attendanceTrend?.map((month, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-2 group"
                  >
                    <div className="relative w-full flex justify-center">
                      <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded-lg">
                        {month.attendanceRate}%
                      </div>
                      <div
                        className="w-12 bg-gradient-to-t from-green-500 to-green-400 rounded-xl transition-all duration-500"
                        style={{
                          height: `${month.attendanceRate}%`,
                          minHeight: "4px",
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium mt-3">
                      {month.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Department-wise Attendance */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 text-lg mb-4">
              Department-wise Attendance
            </h3>
            <div className="space-y-4">
              {departmentAttendance?.map((dept) => (
                <div key={dept.department}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{dept.department}</span>
                    <span className="font-medium text-gray-900">
                      {dept.attendancePercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                      style={{ width: `${dept.attendancePercentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          {/* Reports Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <p className="text-gray-500 text-sm">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900">
                {availableReports?.length || 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <p className="text-gray-500 text-sm">Total Salary</p>
              <p className="text-3xl font-bold text-gray-900">
                ${reportsSummary?.totalSalary?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <p className="text-gray-500 text-sm">Avg Performance</p>
              <p className="text-3xl font-bold text-gray-900">
                {reportsSummary?.averagePerformance || 0}/5.0
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <p className="text-gray-500 text-sm">Monthly Hiring</p>
              <p className="text-3xl font-bold text-gray-900">
                {monthlyHiring?.reduce((sum, m) => sum + m.count, 0) || 0}
              </p>
            </div>
          </div>

          {/* Available Reports List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 text-lg mb-4">
              Available Reports
            </h3>
            <div className="space-y-3">
              {availableReports?.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{report.name}</p>
                      <p className="text-xs text-gray-500">
                        {report.description}
                      </p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Generate
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
