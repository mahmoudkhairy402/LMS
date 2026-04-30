export type UserRole = "student" | "instructor" | "admin";

export interface AuthUser {
  id: string;
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: UserRole;
  isEmailVerified?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: "student" | "instructor";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface GoogleAuthPayload {
  idToken?: string;
  accessToken?: string;
  role?: "student" | "instructor";
}

export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  user: AuthUser;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: AuthUser;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

export interface RefreshResponse {
  success: boolean;
  message: string;
  accessToken: string;
}

export interface MeResponse {
  success: boolean;
  user: AuthUser;
}
