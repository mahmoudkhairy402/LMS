import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import type { RootState } from "@/store";
import type {
  BulkDeactivatePayload,
  BulkDeletePayload,
  BulkIdsPayload,
  BulkRolePayload,
  ManagedUser,
  UpdateUserPayload,
  UserCoursesResponse,
  UserEnrollmentsResponse,
  UserListResponse,
} from "@/types/user-management";
import type { Course, Enrollment } from "@/types/course";
import type { PaginatedMeta } from "@/types/api";
type RejectValue = string;

interface UsersApiResponse {
  users: ManagedUser[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UserApiResponse {
  user: ManagedUser;
}

interface UserEnrollmentsApiResponse {
  enrollments: Enrollment[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UserCoursesApiResponse {
  courses: Course[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function toMeta(data: {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}): PaginatedMeta {
  return {
    page: data.page || 1,
    limit: data.limit || 10,
    total: data.total || 0,
    totalPages: data.totalPages || 1,
  };
}

function getAuthHeaders(state: RootState) {
  const token = state.auth.accessToken;
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined;
}

export const getAllUsers = createAsyncThunk<
  UserListResponse,
  {
    page?: number;
    limit?: number;
    status?: "active" | "inactive";
    role?: "student" | "instructor" | "admin";
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } | undefined,
  { state: RootState; rejectValue: RejectValue }
>("users/getAllUsers", async (query = {}, { getState, rejectWithValue }) => {
  try {
    const response = await api.get<UsersApiResponse>("/api/users", {
      params: query,
      headers: getAuthHeaders(getState()),
    });

    return {
      users: response.data.users || [],
      meta: toMeta(response.data),
    };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
  }
});

export const getUserById = createAsyncThunk<
  ManagedUser,
  string,
  { state: RootState; rejectValue: RejectValue }
>("users/getUserById", async (userId, { getState, rejectWithValue }) => {
  try {
    const response = await api.get<UserApiResponse>(`/api/users/${userId}`, {
      headers: getAuthHeaders(getState()),
    });

    return response.data.user;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch user");
  }
});

export const updateUser = createAsyncThunk<
  ManagedUser,
  UpdateUserPayload,
  { state: RootState; rejectValue: RejectValue }
>("users/updateUser", async ({ userId, data }, { getState, rejectWithValue }) => {
  try {
    const response = await api.put<UserApiResponse>(`/api/users/${userId}`, data, {
      headers: getAuthHeaders(getState()),
    });

    return response.data.user;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to update user");
  }
});

export const deactivateUser = createAsyncThunk<
  string,
  { userId: string; permanent?: boolean },
  { state: RootState; rejectValue: RejectValue }
>("users/deactivateUser", async ({ userId, permanent = false }, { getState, rejectWithValue }) => {
  try {
    await api.delete(`/api/users/${userId}`, {
      headers: getAuthHeaders(getState()),
      data: { permanent },
    });

    return userId;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to deactivate user");
  }
});

export const getUserEnrollments = createAsyncThunk<
  UserEnrollmentsResponse,
  { userId: string; page?: number; limit?: number },
  { state: RootState; rejectValue: RejectValue }
>("users/getUserEnrollments", async ({ userId, page = 1, limit = 10 }, { getState, rejectWithValue }) => {
  try {
    const response = await api.get<UserEnrollmentsApiResponse>(`/api/users/${userId}/enrollments`, {
      params: { page, limit },
      headers: getAuthHeaders(getState()),
    });

    return {
      enrollments: response.data.enrollments || [],
      meta: toMeta(response.data),
    };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch user enrollments");
  }
});

export const getUserCourses = createAsyncThunk<
  UserCoursesResponse,
  { userId: string; page?: number; limit?: number },
  { state: RootState; rejectValue: RejectValue }
>("users/getUserCourses", async ({ userId, page = 1, limit = 10 }, { getState, rejectWithValue }) => {
  try {
    const response = await api.get<UserCoursesApiResponse>(`/api/users/${userId}/courses`, {
      params: { page, limit },
      headers: getAuthHeaders(getState()),
    });

    return {
      courses: response.data.courses || [],
      meta: toMeta(response.data),
    };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch user courses");
  }
});

export const bulkDeactivateUsers = createAsyncThunk<
  string[],
  BulkDeactivatePayload,
  { state: RootState; rejectValue: RejectValue }
>("users/bulkDeactivateUsers", async (payload, { getState, rejectWithValue }) => {
  try {
    await api.post("/api/users/bulk/deactivate", payload, {
      headers: getAuthHeaders(getState()),
    });

    return payload.userIds;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to bulk deactivate users");
  }
});

export const bulkActivateUsers = createAsyncThunk<
  string[],
  BulkIdsPayload,
  { state: RootState; rejectValue: RejectValue }
>("users/bulkActivateUsers", async (payload, { getState, rejectWithValue }) => {
  try {
    await api.post("/api/users/bulk/activate", payload, {
      headers: getAuthHeaders(getState()),
    });

    return payload.userIds;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to bulk activate users");
  }
});

export const bulkUpdateRole = createAsyncThunk<
  { userIds: string[]; newRole: "student" | "instructor" | "admin" },
  BulkRolePayload,
  { state: RootState; rejectValue: RejectValue }
>("users/bulkUpdateRole", async (payload, { getState, rejectWithValue }) => {
  try {
    await api.post("/api/users/bulk/update-role", payload, {
      headers: getAuthHeaders(getState()),
    });

    return { userIds: payload.userIds, newRole: payload.newRole };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to bulk update role");
  }
});

export const bulkDeleteUsers = createAsyncThunk<
  string[],
  BulkDeletePayload,
  { state: RootState; rejectValue: RejectValue }
>("users/bulkDeleteUsers", async (payload, { getState, rejectWithValue }) => {
  try {
    await api.post("/api/users/bulk/delete", payload, {
      headers: getAuthHeaders(getState()),
    });

    return payload.userIds;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to bulk delete users");
  }
});
