import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  createEmployee,
  updateEmployee,
  fetchEmployeeById,
  clearCurrentEmployee,
} from "../store/slices/employeeSlice";
import { fetchDepartments } from "../store/slices/departmentSlice";
import { addNotification } from "../store/slices/uiSlice";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  Calendar,
  Award,
  Save,
  X,
  Upload,
  Building2,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";

const AddEditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentEmployee, loading } = useSelector((state) => state.employees);
  const { departments: departmentList, loading: deptLoading } = useSelector(
    (state) => state.departments,
  );
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    salary: "",
    joinDate: "",
    status: "active",
    performance: 0,
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch departments on component mount
  useEffect(() => {
    if (departmentList.length === 0) {
      dispatch(fetchDepartments());
    }
  }, [dispatch, departmentList.length]);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchEmployeeById(id));
    }
    return () => {
      dispatch(clearCurrentEmployee());
    };
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && currentEmployee) {
      setFormData({
        name: currentEmployee.name || "",
        email: currentEmployee.email || "",
        phone: currentEmployee.phone || "",
        department: currentEmployee.department || "",
        position: currentEmployee.position || "",
        salary: currentEmployee.salary || "",
        joinDate: currentEmployee.joinDate
          ? new Date(currentEmployee.joinDate).toISOString().split("T")[0]
          : "",
        status: currentEmployee.status || "active",
        performance: currentEmployee.performance || 0,
        address: currentEmployee.address || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        emergencyContact: currentEmployee.emergencyContact || {
          name: "",
          relationship: "",
          phone: "",
        },
      });
    }
  }, [isEditMode, currentEmployee]);

  // Validation function
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value) return "Name is required";
        if (value.length < 2) return "Name must be at least 2 characters";
        if (value.length > 50) return "Name cannot exceed 50 characters";
        return "";
      case "email":
        if (!value) return "Email is required";
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(value))
          return "Please enter a valid email address";
        return "";
      case "phone":
        if (!value) return "Phone number is required";
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(value)) return "Please enter a valid phone number";
        return "";
      case "department":
        if (!value) return "Department is required";
        return "";
      case "position":
        if (!value) return "Position is required";
        if (value.length < 2) return "Position must be at least 2 characters";
        return "";
      case "salary":
        if (!value) return "Salary is required";
        if (value < 0) return "Salary cannot be negative";
        if (value > 1000000) return "Salary cannot exceed 1,000,000";
        return "";
      case "joinDate":
        if (!value) return "Join date is required";
        if (new Date(value) > new Date())
          return "Join date cannot be in the future";
        return "";
      case "performance":
        if (value < 0 || value > 5)
          return "Performance must be between 0 and 5";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate field on change
    const error = validateField(name, value);
    setErrors({
      ...errors,
      [name]: error,
    });
  };

  const handleNestedChange = (section, field, value) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value,
      },
    });
  };

  const handleBlur = (field) => {
    setTouched({
      ...touched,
      [field]: true,
    });
    const error = validateField(field, formData[field]);
    setErrors({
      ...errors,
      [field]: error,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "name",
      "email",
      "phone",
      "department",
      "position",
      "salary",
      "joinDate",
    ];

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      dispatch(
        addNotification({
          type: "error",
          message: "Please fix all validation errors before submitting",
        }),
      );
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await dispatch(updateEmployee({ id, employeeData: formData })).unwrap();
        dispatch(
          addNotification({
            type: "success",
            message: "Employee updated successfully",
          }),
        );
      } else {
        await dispatch(createEmployee(formData)).unwrap();
        dispatch(
          addNotification({
            type: "success",
            message: "Employee created successfully",
          }),
        );
      }
      navigate("/employees");
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

  const statuses = ["active", "on-leave", "inactive"];

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50";
      case "on-leave":
        return "text-yellow-600 bg-yellow-50";
      case "inactive":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if ((loading && isEditMode) || deptLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">
            Loading employee data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? "Edit Employee" : "Add New Employee"}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEditMode
            ? "Update employee information and details"
            : "Fill in the information to add a new team member"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Personal and contact details
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur("name")}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      touched.name && errors.name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter full name"
                  />
                </div>
                {touched.name && errors.name && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.name}</span>
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur("email")}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      touched.email && errors.email
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter email address"
                  />
                </div>
                {touched.email && errors.email && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={() => handleBlur("phone")}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      touched.phone && errors.phone
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter phone number"
                  />
                </div>
                {touched.phone && errors.phone && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.phone}</span>
                  </div>
                )}
              </div>

              {/* Department Field - Dynamic from Database */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    onBlur={() => handleBlur("department")}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none ${
                      touched.department && errors.department
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Department</option>
                    {departmentList.map((dept) => (
                      <option key={dept._id || dept.name} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                {touched.department && errors.department && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.department}</span>
                  </div>
                )}
              </div>

              {/* Position Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="position"
                    required
                    value={formData.position}
                    onChange={handleChange}
                    onBlur={() => handleBlur("position")}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      touched.position && errors.position
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter job position"
                  />
                </div>
                {touched.position && errors.position && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.position}</span>
                  </div>
                )}
              </div>

              {/* Salary Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary ($) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    name="salary"
                    required
                    value={formData.salary}
                    onChange={handleChange}
                    onBlur={() => handleBlur("salary")}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      touched.salary && errors.salary
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter salary amount"
                  />
                </div>
                {touched.salary && errors.salary && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.salary}</span>
                  </div>
                )}
              </div>

              {/* Join Date Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Join Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    name="joinDate"
                    required
                    value={formData.joinDate}
                    onChange={handleChange}
                    onBlur={() => handleBlur("joinDate")}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      touched.joinDate && errors.joinDate
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {touched.joinDate && errors.joinDate && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.joinDate}</span>
                  </div>
                )}
              </div>

              {/* Status Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status} className="capitalize">
                      {status.replace("-", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Performance Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Performance Rating (0-5)
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    name="performance"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.performance}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        filled={star <= Math.round(formData.performance)}
                        className="w-4 h-4"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    Click to rate
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Information Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-teal-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Address Information
              </h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Employee's residential address
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) =>
                    handleNestedChange("address", "street", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter street address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) =>
                    handleNestedChange("address", "city", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) =>
                    handleNestedChange("address", "state", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter state"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) =>
                    handleNestedChange("address", "zipCode", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter ZIP code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.address.country}
                  onChange={(e) =>
                    handleNestedChange("address", "country", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Emergency Contact
              </h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Emergency contact information
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact.name}
                  onChange={(e) =>
                    handleNestedChange(
                      "emergencyContact",
                      "name",
                      e.target.value,
                    )
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter emergency contact name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) =>
                    handleNestedChange(
                      "emergencyContact",
                      "relationship",
                      e.target.value,
                    )
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContact.phone}
                  onChange={(e) =>
                    handleNestedChange(
                      "emergencyContact",
                      "phone",
                      e.target.value,
                    )
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter emergency phone number"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={() => navigate("/employees")}
            className="flex items-center gap-2 px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditMode ? "Update Employee" : "Create Employee"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Star Icon Component for rating
const StarIcon = ({ filled, className }) => (
  <svg
    className={`${className} ${filled ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

export default AddEditEmployee;
