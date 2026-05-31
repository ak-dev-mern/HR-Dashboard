import { configureStore } from "@reduxjs/toolkit";
import employeeReducer from "./slices/employeeSlice";
import departmentReducer from "./slices/departmentSlice";
import dashboardReducer from "./slices/dashboardSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    employees: employeeReducer,
    departments: departmentReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
  },
});
