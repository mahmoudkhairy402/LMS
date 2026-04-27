import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/store/slices/authSlice";
import courseReducer from "@/store/slices/courseSlice";
import uiReducer from "@/store/slices/uiSlice";
import userManagementReducer from "@/store/slices/userManagementSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    ui: uiReducer,
    userManagement: userManagementReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;