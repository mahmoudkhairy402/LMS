import type { Instructor } from "./user";

export type Lesson = {
  _id: string;
  title: string;
  type: "video" | "article" | "quiz";
  order: number;
  durationMinutes: number;
  content: string;
  videoUrl: string | null;
  isPreview: boolean;
};

export type Section = {
  _id: string;
  title: string;
  order: number;
  lessons: Lesson[];
};

export type Course = {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description?: string;
  thumbnail: string;
  category: string;
  tags: string[];
  language: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  price: number;
  isPublished: boolean;
  instructor: Instructor;
  totalDurationMinutes: number;
  enrolledCount: number;
  ratingsAverage: number;
  ratingsCount: number;
  sections?: Section[];
  lessons?: Lesson[];
  createdAt: string;
  updatedAt: string;
};

export type Enrollment = {
  _id: string;
  student: string;
  course: Course;
  status: "active" | "completed";
  progressPercent: number;
  completedLessonIds: string[];
  totalDurationMinutes: number;
  completedAt: string | null;
  enrolledAt: string;
  lastAccessedAt: string;
  createdAt: string;
  updatedAt: string;
};

export interface UpdateProgressPayload {
  courseId: string;
  progressPercent?: number;
  completedLessonIds?: string[];
}

export interface CoursesResponse {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  courses: Course[];
}

export interface CourseResponse {
  success: boolean;
  course: Course;
}

export interface EnrollmentResponse {
  success: boolean;
  message?: string;
  enrollment: Enrollment;
}

export interface MyEnrollmentsResponse {
  success: boolean;
  total: number;
  enrollments: Enrollment[];
}

export interface CourseEnrollmentsResponse {
  success: boolean;
  course: {
    id: string;
    title: string;
  };
  total: number;
  enrollments: Enrollment[];
}

export interface ClassmatesResponse {
  success: boolean;
  total: number;
  classmates: Classmate[];
}

export interface InstructorStudentsResponse {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  students: InstructorStudent[];
}

export type Classmate = {
  id: string;
  name: string;
  avatar?: string | null;
};

export type InstructorStudent = {
  id: string;
  studentId: string;
  name: string;
  email: string;
  avatar?: string | null;
  enrollmentStatus: string;
  progressPercent: number;
  lastAccessedAt?: string;
  courseName?: string;
};
