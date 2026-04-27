import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import type {
  Classmate,
  Course,
  CourseEnrollmentsResponse,
  CourseResponse,
  CreateCoursePayload,
  Enrollment,
  EnrollmentResponse,
  GetCoursesQuery,
  ClassmatesResponse,
  InstructorStudent,
  InstructorStudentsResponse,
  PaginatedMeta,
  CoursesResponse,
  MyEnrollmentsResponse,
  UpdateCoursePayload,
  UpdateProgressPayload,
} from "@/types/api";
import type { RootState } from "@/store";

type RejectValue = string;

function getAuthHeaders(state: RootState) {
  const token = state.auth.accessToken;
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined;
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

export const getPublicCourses = createAsyncThunk<
  { courses: Course[]; meta: PaginatedMeta },
  GetCoursesQuery | undefined,
  { rejectValue: RejectValue }
>("courses/getPublicCourses", async (query = {}, { rejectWithValue }) => {
  try {
    const response = await api.get<CoursesResponse>("/api/courses", {
      params: query,
    });

    return {
      courses: response.data.courses || [],
      meta: toMeta(response.data),
    };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch courses",
    );
  }
});

export const getCourseById = createAsyncThunk<
  Course,
  string,
  { state: RootState; rejectValue: RejectValue }
>("courses/getCourseById", async (id, { getState, rejectWithValue }) => {
  try {
    const response = await api.get<CourseResponse>(`/api/courses/${id}`, {
      headers: getAuthHeaders(getState()),
    });

    return response.data.course;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch course",
    );
  }
});

export const getMyCourses = createAsyncThunk<
  Course[],
  void,
  { state: RootState; rejectValue: RejectValue }
>("courses/getMyCourses", async (_, { getState, rejectWithValue }) => {
  try {
    const response = await api.get<{ courses: Course[] }>("/api/courses/manage/mine", {
      headers: getAuthHeaders(getState()),
    });

    return response.data.courses || [];
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch your courses",
    );
  }
});

export const createCourse = createAsyncThunk<
  Course,
  CreateCoursePayload,
  { state: RootState; rejectValue: RejectValue }
>("courses/createCourse", async (payload, { getState, rejectWithValue }) => {
  try {
    const response = await api.post<CourseResponse>("/api/courses", payload, {
      headers: getAuthHeaders(getState()),
    });

    return response.data.course;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to create course",
    );
  }
});

export const updateCourse = createAsyncThunk<
  Course,
  UpdateCoursePayload,
  { state: RootState; rejectValue: RejectValue }
>("courses/updateCourse", async ({ id, data }, { getState, rejectWithValue }) => {
  try {
    const response = await api.put<CourseResponse>(`/api/courses/${id}`, data, {
      headers: getAuthHeaders(getState()),
    });

    return response.data.course;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to update course",
    );
  }
});

export const publishCourse = createAsyncThunk<
  Course,
  string,
  { state: RootState; rejectValue: RejectValue }
>("courses/publishCourse", async (id, { getState, rejectWithValue }) => {
  try {
    const response = await api.patch<CourseResponse>(`/api/courses/${id}/publish`, undefined, {
      headers: getAuthHeaders(getState()),
    });

    return response.data.course;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to publish course",
    );
  }
});

export const unpublishCourse = createAsyncThunk<
  Course,
  string,
  { state: RootState; rejectValue: RejectValue }
>("courses/unpublishCourse", async (id, { getState, rejectWithValue }) => {
  try {
    const response = await api.patch<CourseResponse>(`/api/courses/${id}/unpublish`, undefined, {
      headers: getAuthHeaders(getState()),
    });

    return response.data.course;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to unpublish course",
    );
  }
});

export const deleteCourse = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: RejectValue }
>("courses/deleteCourse", async (id, { getState, rejectWithValue }) => {
  try {
    await api.delete(`/api/courses/${id}`, {
      headers: getAuthHeaders(getState()),
    });

    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete course",
    );
  }
});

export const enrollInCourse = createAsyncThunk<
  Enrollment,
  string,
  { state: RootState; rejectValue: RejectValue }
>("courses/enrollInCourse", async (courseId, { getState, rejectWithValue }) => {
  try {
    const response = await api.post<EnrollmentResponse>(`/api/courses/${courseId}/enroll`, undefined, {
      headers: getAuthHeaders(getState()),
    });

    return response.data.enrollment;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to enroll");
  }
});

export const getMyEnrollments = createAsyncThunk<
  Enrollment[],
  void,
  { state: RootState; rejectValue: RejectValue }
>("courses/getMyEnrollments", async (_, { getState, rejectWithValue }) => {
  try {
    const response = await api.get<MyEnrollmentsResponse>("/api/courses/enrollments/mine", {
      headers: getAuthHeaders(getState()),
    });

    return response.data.enrollments || [];
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch enrollments",
    );
  }
});

export const updateMyProgress = createAsyncThunk<
  Enrollment,
  UpdateProgressPayload,
  { state: RootState; rejectValue: RejectValue }
>(
  "courses/updateMyProgress",
  async ({ courseId, ...payload }, { getState, rejectWithValue }) => {
    try {
      const response = await api.patch<EnrollmentResponse>(
        `/api/courses/${courseId}/progress`,
        payload,
        {
          headers: getAuthHeaders(getState()),
        },
      );

      return response.data.enrollment;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update progress",
      );
    }
  },
);

export const getCourseEnrollments = createAsyncThunk<
  Enrollment[],
  string,
  { state: RootState; rejectValue: RejectValue }
>("courses/getCourseEnrollments", async (courseId, { getState, rejectWithValue }) => {
  try {
    const response = await api.get<CourseEnrollmentsResponse>(`/api/courses/${courseId}/students`, {
      headers: getAuthHeaders(getState()),
    });

    return response.data.enrollments || [];
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch course enrollments",
    );
  }
});

export const getClassmates = createAsyncThunk<
  Classmate[],
  string,
  { state: RootState; rejectValue: RejectValue }
>("courses/getClassmates", async (courseId, { getState, rejectWithValue }) => {
  try {
    const response = await api.get<ClassmatesResponse>(`/api/courses/${courseId}/classmates`, {
      headers: getAuthHeaders(getState()),
    });

    return response.data.classmates || [];
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch classmates",
    );
  }
});

export const getInstructorStudents = createAsyncThunk<
  { students: InstructorStudent[]; meta: PaginatedMeta },
  { page?: number; limit?: number; courseId?: string; enrollmentStatus?: string } | undefined,
  { state: RootState; rejectValue: RejectValue }
>("courses/getInstructorStudents", async (query = {}, { getState, rejectWithValue }) => {
  try {
    const response = await api.get<InstructorStudentsResponse>("/api/courses/instructor/students", {
      params: query,
      headers: getAuthHeaders(getState()),
    });

    return {
      students: response.data.students || [],
      meta: toMeta(response.data),
    };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch instructor students",
    );
  }
});
