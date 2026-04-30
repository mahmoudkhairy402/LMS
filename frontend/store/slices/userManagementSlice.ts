import { createSlice } from "@reduxjs/toolkit";
import type { Course, Enrollment } from "@/types/course";
import type { PaginatedMeta } from "@/types/api";
import type { ManagedUser } from "@/types/user-management";
import {
  bulkActivateUsers,
  bulkDeactivateUsers,
  bulkDeleteUsers,
  bulkUpdateRole,
  deactivateUser,
  getAllUsers,
  getUserById,
  getUserCourses,
  getUserEnrollments,
  updateUser,
} from "@/store/thunks/userThunks";

interface UserManagementState {
  users: ManagedUser[];
  selectedUser: ManagedUser | null;
  selectedUserEnrollments: Enrollment[];
  selectedUserCourses: Course[];
  usersMeta: PaginatedMeta;
  selectedUserEnrollmentsMeta: PaginatedMeta;
  selectedUserCoursesMeta: PaginatedMeta;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const defaultMeta: PaginatedMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

const initialState: UserManagementState = {
  users: [],
  selectedUser: null,
  selectedUserEnrollments: [],
  selectedUserCourses: [],
  usersMeta: defaultMeta,
  selectedUserEnrollmentsMeta: defaultMeta,
  selectedUserCoursesMeta: defaultMeta,
  status: "idle",
  error: null,
};

const userManagementSlice = createSlice({
  name: "userManagement",
  initialState,
  reducers: {
    clearUserError(state) {
      state.error = null;
    },
    clearSelectedUser(state) {
      state.selectedUser = null;
      state.selectedUserEnrollments = [];
      state.selectedUserCourses = [];
      state.selectedUserEnrollmentsMeta = defaultMeta;
      state.selectedUserCoursesMeta = defaultMeta;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload.users;
        state.usersMeta = action.payload.meta;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.users = state.users.map((user) =>
          user._id === action.payload._id ? { ...user, ...action.payload } : user,
        );

        if (state.selectedUser?._id === action.payload._id) {
          state.selectedUser = { ...state.selectedUser, ...action.payload };
        }
      })
      .addCase(deactivateUser.fulfilled, (state, action) => {
        state.users = state.users.map((user) =>
          user._id === action.payload ? { ...user, isActive: false } : user,
        );

        if (state.selectedUser?._id === action.payload) {
          state.selectedUser = { ...state.selectedUser, isActive: false };
        }
      })
      .addCase(getUserEnrollments.fulfilled, (state, action) => {
        state.selectedUserEnrollments = action.payload.enrollments;
        state.selectedUserEnrollmentsMeta = action.payload.meta;
      })
      .addCase(getUserCourses.fulfilled, (state, action) => {
        state.selectedUserCourses = action.payload.courses;
        state.selectedUserCoursesMeta = action.payload.meta;
      })
      .addCase(bulkDeactivateUsers.fulfilled, (state, action) => {
        const ids = new Set(action.payload);
        state.users = state.users.map((user) =>
          ids.has(user.id) ? { ...user, isActive: false } : user,
        );
      })
      .addCase(bulkActivateUsers.fulfilled, (state, action) => {
        const ids = new Set(action.payload);
        state.users = state.users.map((user) =>
          ids.has(user.id) ? { ...user, isActive: true } : user,
        );
      })
      .addCase(bulkUpdateRole.fulfilled, (state, action) => {
        const ids = new Set(action.payload.userIds);
        state.users = state.users.map((user) =>
          ids.has(user.id) ? { ...user, role: action.payload.newRole } : user,
        );
      })
      .addCase(bulkDeleteUsers.fulfilled, (state, action) => {
        const ids = new Set(action.payload);
        state.users = state.users.filter((user) => !ids.has(user.id));
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("users/") && action.type.endsWith("/rejected"),
        (state, action: import("@reduxjs/toolkit").PayloadAction<string>) => {
          state.status = "failed";
          state.error = action.payload || "Request failed";
        },
      );
  },
});

export const { clearUserError, clearSelectedUser } = userManagementSlice.actions;

export default userManagementSlice.reducer;
