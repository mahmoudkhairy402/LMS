import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import type { AuthUser } from "@/store/slices/authSlice";
import type { RootState } from "@/store";

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: "student" | "instructor";
}

interface LoginPayload {
  email: string;
  password: string;
}

interface GoogleAuthPayload {
  idToken?: string;
  accessToken?: string;
  role?: "student" | "instructor";
}

interface AuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  user: AuthUser;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  user: AuthUser;
}

interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

interface RefreshResponse {
  success: boolean;
  message: string;
  accessToken: string;
}

interface MeResponse {
  success: boolean;
  user: AuthUser;
}

// Register user
export const registerUser = createAsyncThunk<AuthUser, RegisterPayload>(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post<RegisterResponse>(
        "/api/auth/register",
        payload,
      );
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

// Verify email
export const verifyUserEmail = createAsyncThunk<
  void,
  string // token
>(
  "auth/verifyUserEmail",
  async (token, { rejectWithValue }) => {
    try {
      await api.get<VerifyEmailResponse>(`/api/auth/verify-email/${token}`);
      return;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Email verification failed",
      );
    }
  },
);

// Login user
export const loginUser = createAsyncThunk<AuthResponse, LoginPayload>(
  "auth/loginUser",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>("/api/auth/login", payload);
      return {
        success: response.data.success,
        message: response.data.message,
        accessToken: response.data.accessToken,
        user: response.data.user,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

// Google authentication
export const googleAuth = createAsyncThunk<AuthResponse, GoogleAuthPayload>(
  "auth/googleAuth",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>("/api/auth/google", payload);
      return {
        success: response.data.success,
        message: response.data.message,
        accessToken: response.data.accessToken,
        user: response.data.user,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Google authentication failed",
      );
    }
  },
);

// Refresh access token
export const refreshAccessToken = createAsyncThunk<string>(
  "auth/refreshAccessToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post<RefreshResponse>("/api/auth/refresh");
      return response.data.accessToken;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Token refresh failed",
      );
    }
  },
);

// Logout user
export const logoutUser = createAsyncThunk<void>(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/api/auth/logout");
      return;
    } catch (error: any) {
      // Even if logout fails, clear local state
      return;
    }
  },
);

// Fetch current user
export const fetchMe = createAsyncThunk<
  AuthUser,
  string | undefined,
  { state: RootState; rejectValue: string }
>(
  "auth/fetchMe",
  async (providedToken, { getState, rejectWithValue }) => {
    try {
      const stateToken = getState().auth.accessToken;
      const token = providedToken || stateToken;

      const response = await api.get<MeResponse>("/api/auth/me", {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });

      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user",
      );
    }
  },
);
