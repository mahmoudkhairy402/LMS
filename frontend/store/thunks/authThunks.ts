import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import type {
  AuthResponse,
  AuthUser,
  GoogleAuthPayload,
  LoginPayload,
  MeResponse,
  RefreshResponse,
  RegisterPayload,
  RegisterResponse,
  VerifyEmailResponse,
} from "@/types/auth";
import type { RootState } from "@/store";

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


