import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Async thunks
export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async (params = {}) => {
    const response = await axios.get(`${API_URL}/employees`, { params });
    return response.data;
  },
);

export const fetchEmployeeById = createAsyncThunk(
  "employees/fetchEmployeeById",
  async (id) => {
    const response = await axios.get(`${API_URL}/employees/${id}`);
    return response.data;
  },
);

export const createEmployee = createAsyncThunk(
  "employees/createEmployee",
  async (employeeData) => {
    const response = await axios.post(`${API_URL}/employees`, employeeData);
    return response.data;
  },
);

export const updateEmployee = createAsyncThunk(
  "employees/updateEmployee",
  async ({ id, employeeData }) => {
    const response = await axios.put(
      `${API_URL}/employees/${id}`,
      employeeData,
    );
    return response.data;
  },
);

export const deleteEmployee = createAsyncThunk(
  "employees/deleteEmployee",
  async (id) => {
    await axios.delete(`${API_URL}/employees/${id}`);
    return id;
  },
);

export const fetchDashboardStats = createAsyncThunk(
  "employees/fetchDashboardStats",
  async () => {
    const response = await axios.get(`${API_URL}/employees/stats/dashboard`);
    return response.data;
  },
);

export const updateEmployeeStatus = createAsyncThunk(
  "employees/updateEmployeeStatus",
  async ({ id, status }) => {
    const response = await axios.patch(`${API_URL}/employees/${id}/status`, {
      status,
    });
    return response.data;
  },
);

const employeeSlice = createSlice({
  name: "employees",
  initialState: {
    employees: [],
    currentEmployee: null,
    stats: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
    filters: {
      department: "All",
      status: "",
      search: "",
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        department: "All",
        status: "",
        search: "",
      };
    },
    setCurrentPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch Employee By ID
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEmployee = action.payload.data;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create Employee
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.employees.unshift(action.payload.data);
        state.pagination.total += 1;
      })
      // Update Employee
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.employees.findIndex(
          (emp) => emp._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.employees[index] = action.payload.data;
        }
        if (state.currentEmployee?._id === action.payload.data._id) {
          state.currentEmployee = action.payload.data;
        }
      })
      // Delete Employee
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter(
          (emp) => emp._id !== action.payload,
        );
        state.pagination.total -= 1;
      })
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload.data;
      })
      // Update Employee Status
      .addCase(updateEmployeeStatus.fulfilled, (state, action) => {
        const index = state.employees.findIndex(
          (emp) => emp._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.employees[index] = action.payload.data;
        }
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setCurrentPage,
  clearCurrentEmployee,
} = employeeSlice.actions;
export default employeeSlice.reducer;
