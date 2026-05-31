import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api/dashboard";

// Initial state
const initialState = {
  stats: {
    employees: null,
    departments: null,
    attendance: null,
    reports: null,
    recentActivities: [],
  },
  loading: false,
  error: null,
  lastUpdated: null,
  filters: {
    period: "monthly", // daily, weekly, monthly, yearly
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  },
};

// Async Thunks

// Fetch complete dashboard stats
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchDashboardStats",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/stats`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Fetch only employee stats
export const fetchEmployeeStats = createAsyncThunk(
  "dashboard/fetchEmployeeStats",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/employees`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Fetch only department stats
export const fetchDepartmentStats = createAsyncThunk(
  "dashboard/fetchDepartmentStats",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/departments`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Fetch only attendance stats
export const fetchAttendanceStats = createAsyncThunk(
  "dashboard/fetchAttendanceStats",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/attendance`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Fetch only reports stats
export const fetchReportStats = createAsyncThunk(
  "dashboard/fetchReportStats",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/reports`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Dashboard Slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardStats: (state) => {
      state.stats = initialState.stats;
      state.error = null;
      state.lastUpdated = null;
    },
    setDashboardFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetDashboardFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
        state.lastUpdated =
          action.payload.data.lastUpdated || new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch Employee Stats
      .addCase(fetchEmployeeStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats.employees = action.payload.data;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchEmployeeStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch Department Stats
      .addCase(fetchDepartmentStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats.departments = action.payload.data;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDepartmentStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch Attendance Stats
      .addCase(fetchAttendanceStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats.attendance = action.payload.data;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAttendanceStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch Reports Stats
      .addCase(fetchReportStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats.reports = action.payload.data;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchReportStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

// Export actions
export const {
  clearDashboardStats,
  setDashboardFilters,
  resetDashboardFilters,
  clearError,
} = dashboardSlice.actions;

// Selectors
export const selectDashboardStats = (state) => state.dashboard.stats;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectDashboardLastUpdated = (state) =>
  state.dashboard.lastUpdated;
export const selectDashboardFilters = (state) => state.dashboard.filters;

// Employee specific selectors
export const selectEmployeeOverview = (state) =>
  state.dashboard.stats?.employees?.overview;
export const selectEmployeePerformance = (state) =>
  state.dashboard.stats?.employees?.performance;
export const selectEmployeeDemographics = (state) =>
  state.dashboard.stats?.employees?.demographics;
export const selectEmployeeSalary = (state) =>
  state.dashboard.stats?.employees?.salary;
export const selectDepartmentDistribution = (state) =>
  state.dashboard.stats?.employees?.departments;
export const selectTopPerformers = (state) =>
  state.dashboard.stats?.employees?.performance?.topPerformers;
export const selectUpcomingAnniversaries = (state) =>
  state.dashboard.stats?.employees?.upcomingAnniversaries;

// Department specific selectors
export const selectDepartmentOverview = (state) =>
  state.dashboard.stats?.departments?.overview;
export const selectAllDepartments = (state) =>
  state.dashboard.stats?.departments?.departments;
export const selectLargestDepartment = (state) =>
  state.dashboard.stats?.departments?.largestDepartment;

// Attendance specific selectors
export const selectAttendanceOverview = (state) =>
  state.dashboard.stats?.attendance?.overview;
export const selectTodayAttendance = (state) =>
  state.dashboard.stats?.attendance?.today;
export const selectDepartmentAttendance = (state) =>
  state.dashboard.stats?.attendance?.departmentWise;
export const selectAttendanceTrend = (state) =>
  state.dashboard.stats?.attendance?.monthlyTrend;

// Reports specific selectors
export const selectReportsSummary = (state) =>
  state.dashboard.stats?.reports?.summary;
export const selectMonthlyHiring = (state) =>
  state.dashboard.stats?.reports?.monthlyHiring;
export const selectDepartmentPerformance = (state) =>
  state.dashboard.stats?.reports?.departmentPerformance;
export const selectSalaryDistribution = (state) =>
  state.dashboard.stats?.reports?.salaryDistribution;
export const selectStatusDistribution = (state) =>
  state.dashboard.stats?.reports?.statusDistribution;
export const selectAvailableReports = (state) =>
  state.dashboard.stats?.reports?.availableReports;

// Recent activities selector
export const selectRecentActivities = (state) =>
  state.dashboard.stats?.recentActivities;

export default dashboardSlice.reducer;
