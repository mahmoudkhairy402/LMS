import { Course, Enrollment } from "./course";

export type { Course, Enrollment };

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CoursesResponse extends PaginatedMeta {
  courses: Course[];
}

export interface CourseResponse {
  course: Course;
}

export interface MyEnrollmentsResponse {
  enrollments: Enrollment[];
}

export interface EnrollmentResponse {
  enrollment: Enrollment;
}

export interface CourseEnrollmentsResponse {
  enrollments: Enrollment[];
}

export interface Classmate {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface ClassmatesResponse {
  classmates: Classmate[];
}

export interface InstructorStudent {
  id: string;
  studentId: string;
  name: string;
  email: string;
  avatar?: string | null;
  enrollmentStatus: string;
  progressPercent: number;
  lastAccessedAt?: string;
  courseName?: string;
}

export interface InstructorStudentsResponse extends PaginatedMeta {
  students: InstructorStudent[];
}

export interface GetCoursesQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  level?: string;
  instructor?: string;
}

export interface CreateCoursePayload {
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  category?: string;
  tags?: string[];
  language?: string;
  level?: string;
  price?: number;
  isPublished?: boolean;
}

export interface UpdateCoursePayload {
  id: string;
  data: Partial<CreateCoursePayload>;
}

export interface UpdateProgressPayload {
  courseId: string;
}
