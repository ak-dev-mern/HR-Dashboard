import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../store/slices/departmentSlice";
import { addNotification } from "../store/slices/uiSlice";
import { useDeleteConfirmation } from "./DeleteConfirmationModal";
import {
  Plus,
  Edit,
  Trash2,
  Building2,
  Users,
  MoreVertical,
  X,
  Save,
  AlertCircle,
  DollarSign,
  MapPin,
  User,
  FileText,
  TrendingUp,
  Clock,
} from "lucide-react";

const Departments = () => {
  const dispatch = useDispatch();
  const { departments, loading } = useSelector((state) => state.departments);
  const { employees } = useSelector((state) => state.employees);
  const { showDeleteConfirmation, DeleteModalComponent } =
    useDeleteConfirmation();

  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    head: "",
    budget: "",
    location: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Get employee count for a department
  const getEmployeeCount = (departmentName) => {
    return (
      employees?.filter((emp) => emp.department === departmentName).length || 0
    );
  };

  // Get department statistics
  const getDepartmentStats = (departmentName) => {
    const deptEmployees =
      employees?.filter((emp) => emp.department === departmentName) || [];
    const avgSalary =
      deptEmployees.length > 0
        ? deptEmployees.reduce((sum, emp) => sum + (emp.salary || 0), 0) /
          deptEmployees.length
        : 0;
    const avgPerformance =
      deptEmployees.length > 0
        ? deptEmployees.reduce((sum, emp) => sum + (emp.performance || 0), 0) /
          deptEmployees.length
        : 0;
    return { avgSalary, avgPerformance, employeeCount: deptEmployees.length };
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Department name is required";
    if (formData.name.length < 2)
      newErrors.name = "Name must be at least 2 characters";
    if (formData.name.length > 50)
      newErrors.name = "Name cannot exceed 50 characters";
    if (formData.budget && formData.budget < 0)
      newErrors.budget = "Budget cannot be negative";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingDepartment) {
        await dispatch(
          updateDepartment({
            id: editingDepartment._id,
            departmentData: formData,
          }),
        ).unwrap();
        dispatch(
          addNotification({
            type: "success",
            message: `${formData.name} department updated successfully`,
          }),
        );
      } else {
        await dispatch(createDepartment(formData)).unwrap();
        dispatch(
          addNotification({
            type: "success",
            message: `${formData.name} department created successfully`,
          }),
        );
      }
      resetModal();
      dispatch(fetchDepartments());
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          message: error.message || "Operation failed",
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name || "",
      description: department.description || "",
      head: department.head || "",
      budget: department.budget || "",
      location: department.location || "",
    });
    setShowModal(true);
  };

  const handleDelete = (department) => {
    const stats = getDepartmentStats(department.name);
    const hasEmployees = stats.employeeCount > 0;

    showDeleteConfirmation({
      itemType: "department",
      itemName: department.name,
      itemId: department._id,
      additionalInfo: hasEmployees
        ? `This department has ${stats.employeeCount} employee(s). Average salary: $${stats.avgSalary.toLocaleString()}`
        : "No employees currently in this department",
      warningMessage: hasEmployees
        ? `⚠️ WARNING: This department has ${stats.employeeCount} active employee(s). You must reassign or transfer these employees before deleting the department.`
        : `This will permanently delete the ${department.name} department. This action cannot be undone.`,
      onConfirm: async (departmentId) => {
        if (hasEmployees) {
          dispatch(
            addNotification({
              type: "error",
              message: `Cannot delete ${department.name} department. Please reassign ${stats.employeeCount} employee(s) first.`,
            }),
          );
          return;
        }
        await dispatch(deleteDepartment(departmentId)).unwrap();
        dispatch(
          addNotification({
            type: "success",
            message: `${department.name} department deleted successfully`,
          }),
        );
        dispatch(fetchDepartments());
      },
    });
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingDepartment(null);
    setFormData({
      name: "",
      description: "",
      head: "",
      budget: "",
      location: "",
    });
    setErrors({});
  };

  const departmentColors = {
    Engineering: "bg-gradient-to-br from-blue-500 to-blue-600",
    Marketing: "bg-gradient-to-br from-purple-500 to-purple-600",
    Sales: "bg-gradient-to-br from-green-500 to-green-600",
    HR: "bg-gradient-to-br from-pink-500 to-pink-600",
    Finance: "bg-gradient-to-br from-yellow-500 to-yellow-600",
    Operations: "bg-gradient-to-br from-indigo-500 to-indigo-600",
  };

  const getBudgetStatus = (budget) => {
    if (!budget) return { status: "Not Set", color: "text-gray-500" };
    if (budget > 100000)
      return { status: "High Budget", color: "text-green-600" };
    if (budget > 50000)
      return { status: "Medium Budget", color: "text-yellow-600" };
    return { status: "Low Budget", color: "text-blue-600" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">
            Loading departments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Departments</h2>
          <p className="text-gray-500 mt-1">
            Manage your organization departments and track performance
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">
                Total Departments
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {departments.length}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500 opacity-75" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">
                Total Employees
              </p>
              <p className="text-2xl font-bold text-green-900">
                {employees?.length || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-500 opacity-75" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Avg Salary</p>
              <p className="text-2xl font-bold text-purple-900">
                $
                {Math.round(
                  employees?.reduce((sum, emp) => sum + (emp.salary || 0), 0) /
                    (employees?.length || 1),
                ).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500 opacity-75" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">
                Avg Performance
              </p>
              <p className="text-2xl font-bold text-orange-900">
                {(
                  employees?.reduce(
                    (sum, emp) => sum + (emp.performance || 0),
                    0,
                  ) / (employees?.length || 1)
                ).toFixed(1)}
                /5.0
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500 opacity-75" />
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const stats = getDepartmentStats(dept.name);
          const budgetStatus = getBudgetStatus(dept.budget);

          return (
            <div
              key={dept._id}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Card Header with Gradient */}
              <div
                className={`h-2 ${departmentColors[dept.name] || "bg-gradient-to-br from-gray-500 to-gray-600"}`}
              ></div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl ${departmentColors[dept.name] || "bg-gray-100"} text-white shadow-lg`}
                  >
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleEdit(dept)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Department"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {dept.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {dept.description || "No description provided"}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Employees</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stats.employeeCount}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <DollarSign className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Avg Salary</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${Math.round(stats.avgSalary).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Department Head:</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {dept.head || "Not assigned"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Budget:</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">
                        ${dept.budget?.toLocaleString() || "0"}
                      </span>
                      {dept.budget && (
                        <p className={`text-xs ${budgetStatus.color}`}>
                          {budgetStatus.status}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Location:</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {dept.location || "Not specified"}
                    </span>
                  </div>

                  {stats.avgPerformance > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Avg Performance:</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-900">
                          {stats.avgPerformance.toFixed(1)}
                        </span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {departments.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Departments Yet
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by creating your first department
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create Department
          </button>
        </div>
      )}

      {/* Add/Edit Department Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingDepartment ? "Edit Department" : "Add New Department"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingDepartment
                    ? "Update department information"
                    : "Fill in the details to create a new department"}
                </p>
              </div>
              <button
                onClick={resetModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Department Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    placeholder="e.g., Engineering, Marketing, Sales"
                  />
                </div>
                {errors.name && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.name}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <textarea
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe the department's role and responsibilities"
                  />
                </div>
              </div>

              {/* Department Head */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Head
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.head}
                    onChange={(e) =>
                      setFormData({ ...formData, head: e.target.value })
                    }
                    placeholder="Name of department head"
                  />
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Budget ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.budget
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    value={formData.budget}
                    onChange={(e) => {
                      setFormData({ ...formData, budget: e.target.value });
                      if (errors.budget) setErrors({ ...errors, budget: "" });
                    }}
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>
                {errors.budget && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.budget}</span>
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g., New York Office, Remote"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={resetModal}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editingDepartment ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingDepartment
                        ? "Update Department"
                        : "Create Department"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModalComponent />
    </div>
  );
};

export default Departments;
