import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchEmployees,
  deleteEmployee,
  setFilters,
  setCurrentPage,
  updateEmployeeStatus,
} from "../store/slices/employeeSlice";
import { addNotification } from "../store/slices/uiSlice";
import { useDeleteConfirmation } from "./DeleteConfirmationModal";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ChevronDown,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Award,
  MapPin,
  User,
  Briefcase,
  Building2,
  Heart,
  FileText,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const EmployeeList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employees, loading, pagination, filters } = useSelector(
    (state) => state.employees,
  );
  const { showDeleteConfirmation, DeleteModalComponent } =
    useDeleteConfirmation();
  const [showStatusMenu, setShowStatusMenu] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    status: "",
    minSalary: "",
    maxSalary: "",
    minPerformance: "",
  });

  useEffect(() => {
    dispatch(fetchEmployees({ ...filters, page: pagination.page }));
  }, [dispatch, filters, pagination.page]);

  const handleSearch = (e) => {
    dispatch(setFilters({ search: e.target.value }));
    dispatch(setCurrentPage(1));
  };

  const handleDepartmentFilter = (dept) => {
    dispatch(setFilters({ department: dept }));
    dispatch(setCurrentPage(1));
  };

  const handleApplyFilters = () => {
    dispatch(setFilters({ ...filters, ...localFilters }));
    dispatch(setCurrentPage(1));
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setLocalFilters({
      status: "",
      minSalary: "",
      maxSalary: "",
      minPerformance: "",
    });
    dispatch(setFilters({ department: "All", search: "" }));
    dispatch(setCurrentPage(1));
  };

  const handleDelete = (employee) => {
    showDeleteConfirmation({
      itemType: "employee",
      itemName: employee.name,
      itemId: employee._id,
      additionalInfo: `Position: ${employee.position} | Department: ${employee.department} | Employee ID: ${employee.employeeId || "N/A"}`,
      warningMessage: `This will permanently delete ${employee.name}'s record including all associated data, employment history, documents, and attendance records.`,
      onConfirm: async (employeeId) => {
        await dispatch(deleteEmployee(employeeId)).unwrap();
        dispatch(
          addNotification({
            type: "success",
            message: `${employee.name} deleted successfully`,
          }),
        );
        dispatch(fetchEmployees({ ...filters, page: pagination.page }));
      },
    });
  };

  const handleStatusChange = async (id, status) => {
    await dispatch(updateEmployeeStatus({ id, status }));
    setShowStatusMenu(null);
    dispatch(
      addNotification({
        type: "success",
        message: `Status updated to ${status}`,
      }),
    );
    dispatch(fetchEmployees({ ...filters, page: pagination.page }));
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "on-leave":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "on-leave":
        return <Clock className="w-4 h-4" />;
      case "inactive":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPerformanceColor = (performance) => {
    if (performance >= 4.5) return "text-green-600";
    if (performance >= 3.5) return "text-blue-600";
    if (performance >= 2.5) return "text-yellow-600";
    return "text-red-600";
  };

  const departments = [
    "All",
    "Engineering",
    "Marketing",
    "Sales",
    "HR",
    "Finance",
    "Operations",
  ];

  const statusOptions = ["", "active", "on-leave", "inactive", "terminated"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Employees</h2>
          <p className="text-gray-500 mt-1">
            Manage your workforce and track performance
          </p>
        </div>
        <button
          onClick={() => navigate("/employees/add")}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, position..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={handleSearch}
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                value={filters.department}
                onChange={(e) => handleDepartmentFilter(e.target.value)}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-all duration-200 ${
                  showFilters
                    ? "bg-blue-50 border-blue-500 text-blue-600"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              {(localFilters.status ||
                localFilters.minSalary ||
                localFilters.maxSalary) && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={localFilters.status}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        status: e.target.value,
                      })
                    }
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status || "All"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Salary
                  </label>
                  <input
                    type="number"
                    placeholder="Min Salary"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={localFilters.minSalary}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        minSalary: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Salary
                  </label>
                  <input
                    type="number"
                    placeholder="Max Salary"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={localFilters.maxSalary}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        maxSalary: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Performance
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Min Performance"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={localFilters.minPerformance}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        minPerformance: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto">
          <table className="w-full ">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-[15%] text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="w-[20%] text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="w-[10%] text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="w-[15%] text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="w-[10%] text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary
                </th>
                <th className="w-[10%] text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="w-[10%] text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="w-[8%] text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="w-[7%] text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr
                  key={employee._id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {/* Employee Column - No Wrap */}
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {employee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {employee.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          ID: {employee.employeeId || "N/A"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contact Column - No Wrap */}
                  <td className="px-4 py-3 align-top">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-gray-600 min-w-0">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="text-xs truncate">
                          {employee.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 min-w-0">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span className="text-xs truncate">
                          {employee.phone}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Department Column */}
                  <td className="px-4 py-3 align-top">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 whitespace-nowrap">
                      {employee.department}
                    </span>
                  </td>

                  {/* Position Column */}
                  <td className="px-4 py-3 align-top">
                    <span className="text-xs text-gray-700 line-clamp-2">
                      {employee.position}
                    </span>
                  </td>

                  {/* Salary Column */}
                  <td className="px-4 py-3 align-top">
                    <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                      ${employee.salary?.toLocaleString()}
                    </span>
                  </td>

                  {/* Performance Column */}
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span
                        className={`text-sm font-medium ${getPerformanceColor(employee.performance)}`}
                      >
                        {employee.performance}
                      </span>
                      <span className="text-yellow-500 text-xs">★</span>
                    </div>
                  </td>

                  {/* Join Date Column */}
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      {new Date(employee.joinDate).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="px-4 py-3 align-top">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowStatusMenu(
                            showStatusMenu === employee._id
                              ? null
                              : employee._id,
                          )
                        }
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap ${getStatusColor(
                          employee.status,
                        )}`}
                      >
                        {getStatusIcon(employee.status)}
                        <span className="capitalize">{employee.status}</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      {showStatusMenu === employee._id && (
                        <div className="absolute z-10 mt-1 w-28 bg-white rounded-lg shadow-lg border border-gray-200">
                          {["active", "on-leave", "inactive", "terminated"].map(
                            (status) => (
                              <button
                                key={status}
                                onClick={() =>
                                  handleStatusChange(employee._id, status)
                                }
                                className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 capitalize"
                              >
                                {status}
                              </button>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 py-3 text-right align-top">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleViewEmployee(employee)}
                        className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/employees/edit/${employee._id}`)
                        }
                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Edit Employee"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee)}
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {employees.length} of {pagination.total} employees
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => dispatch(setCurrentPage(pagination.page - 1))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="px-3 py-1 bg-blue-600 text-white rounded-md">
              {pagination.page}
            </span>
            <button
              onClick={() => dispatch(setCurrentPage(pagination.page + 1))}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* View Employee Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-xl">
                  {selectedEmployee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedEmployee.name}</h2>
                  <p className="text-sm text-white/80">
                    {selectedEmployee.position}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Employee ID Badge */}
              <div className="mb-6 inline-block px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                Employee ID: {selectedEmployee.employeeId || "Not assigned"}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Full Name:</span>
                      <span className="font-medium text-gray-900">
                        {selectedEmployee.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium text-gray-900">
                        {selectedEmployee.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium text-gray-900">
                        {selectedEmployee.phone}
                      </span>
                    </div>
                    {selectedEmployee.dateOfBirth && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date of Birth:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(
                            selectedEmployee.dateOfBirth,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedEmployee.gender && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Gender:</span>
                        <span className="font-medium text-gray-900 capitalize">
                          {selectedEmployee.gender}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Employment Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-green-600" />
                    Employment Information
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Department:</span>
                      <span className="font-medium text-gray-900">
                        {selectedEmployee.department}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Position:</span>
                      <span className="font-medium text-gray-900">
                        {selectedEmployee.position}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Join Date:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(
                          selectedEmployee.joinDate,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEmployee.status)}`}
                      >
                        {getStatusIcon(selectedEmployee.status)}
                        <span className="capitalize">
                          {selectedEmployee.status}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Salary & Performance */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                    Compensation & Performance
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Annual Salary:</span>
                      <span className="font-medium text-green-600 text-lg">
                        ${selectedEmployee.salary?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Performance Rating:</span>
                      <div className="flex items-center gap-1">
                        <span
                          className={`font-medium text-lg ${getPerformanceColor(selectedEmployee.performance)}`}
                        >
                          {selectedEmployee.performance}
                        </span>
                        <span className="text-yellow-500">★</span>
                        <span className="text-gray-400 text-sm ml-1">
                          (
                          {selectedEmployee.performance >= 4.5
                            ? "Excellent"
                            : selectedEmployee.performance >= 3.5
                              ? "Good"
                              : selectedEmployee.performance >= 2.5
                                ? "Average"
                                : "Needs Improvement"}
                          )
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                {selectedEmployee.address && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      Address Information
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      {selectedEmployee.address.street && (
                        <p className="text-gray-900">
                          {selectedEmployee.address.street}
                        </p>
                      )}
                      <div className="flex gap-2 text-gray-600">
                        {selectedEmployee.address.city && (
                          <span>{selectedEmployee.address.city},</span>
                        )}
                        {selectedEmployee.address.state && (
                          <span>{selectedEmployee.address.state}</span>
                        )}
                        {selectedEmployee.address.zipCode && (
                          <span>{selectedEmployee.address.zipCode}</span>
                        )}
                      </div>
                      {selectedEmployee.address.country && (
                        <p className="text-gray-600">
                          {selectedEmployee.address.country}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Emergency Contact */}
                {selectedEmployee.emergencyContact && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-600" />
                      Emergency Contact
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      {selectedEmployee.emergencyContact.name && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Name:</span>
                          <span className="font-medium text-gray-900">
                            {selectedEmployee.emergencyContact.name}
                          </span>
                        </div>
                      )}
                      {selectedEmployee.emergencyContact.relationship && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Relationship:</span>
                          <span className="font-medium text-gray-900">
                            {selectedEmployee.emergencyContact.relationship}
                          </span>
                        </div>
                      )}
                      {selectedEmployee.emergencyContact.phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Phone:</span>
                          <span className="font-medium text-gray-900">
                            {selectedEmployee.emergencyContact.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {selectedEmployee.skills &&
                  selectedEmployee.skills.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Award className="w-5 h-5 text-orange-600" />
                        Skills & Expertise
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex flex-wrap gap-2">
                          {selectedEmployee.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    navigate(`/employees/edit/${selectedEmployee._id}`);
                  }}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModalComponent />
    </div>
  );
};

export default EmployeeList;
