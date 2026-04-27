import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UiState } from "@/types/ui";

const initialState: UiState = {
  isGlobalLoading: false,
  isSidebarOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.isGlobalLoading = action.payload;
    },
    toggleSidebar(state) {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.isSidebarOpen = action.payload;
    },
  },
});

export const { setGlobalLoading, toggleSidebar, setSidebarOpen } =
  uiSlice.actions;

export default uiSlice.reducer;