import type { Enrollment, Course } from "@/types/course";
import {PaginatedMeta} from "@/types/api";
export interface ManagedUser {
  _id?: string;
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: "student" | "instructor" | "admin";
  isEmailVerified?: boolean;
  isActive?: boolean;
  enrollmentCount?: number;
  courseCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserListResponse {
  users: ManagedUser[];
  meta: PaginatedMeta;
}

export interface UpdateUserPayload {
  userId: string;
  data: {
    name?: string;
    role?: "student" | "instructor" | "admin";
    isEmailVerified?: boolean;
    isActive?: boolean;
  };
}

export interface BulkIdsPayload {
  userIds: string[];
}

export interface BulkDeletePayload extends BulkIdsPayload {
  permanent?: boolean;
}

export interface BulkDeactivatePayload extends BulkIdsPayload {
  reason?: string;
}

export interface BulkRolePayload extends BulkIdsPayload {
  newRole: "student" | "instructor" | "admin";
}

export interface UserEnrollmentsResponse {
  enrollments: Enrollment[];
  meta: PaginatedMeta;
}

export interface UserCoursesResponse {
  courses: Course[];
  meta: PaginatedMeta;
}
