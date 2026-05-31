// store/slices/departmentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const fetchDepartments = createAsyncThunk(
  "departments/fetchDepartments",
  async () => {
    const response = await axios.get(`${API_URL}/departments`);
    return response.data;
  },
);

export const createDepartment = createAsyncThunk(
  "departments/createDepartment",
  async (departmentData) => {
    const response = await axios.post(`${API_URL}/departments`, departmentData);
    return response.data;
  },
);

export const updateDepartment = createAsyncThunk(
  "departments/updateDepartment",
  async ({ id, departmentData }) => {
    const response = await axios.put(
      `${API_URL}/departments/${id}`,
      departmentData,
    );
    return response.data;
  },
);

export const deleteDepartment = createAsyncThunk(
  "departments/deleteDepartment",
  async (id) => {
    await axios.delete(`${API_URL}/departments/${id}`);
    return id;
  },
);

const departmentSlice = createSlice({
  name: "departments",
  initialState: {
    departments: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Departments
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload.data;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create Department
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload.data);
      })
      // Update Department
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex(
          (dept) => dept._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.departments[index] = action.payload.data;
        }
      })
      // Delete Department
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter(
          (dept) => dept._id !== action.payload,
        );
      });
  },
});

export default departmentSlice.reducer;
