import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  Classmate,
  Course,
  Enrollment,
  InstructorStudent,
  PaginatedMeta,
} from "@/types/course";
import {
  createCourse,
  deleteCourse,
  enrollInCourse,
  getClassmates,
  getCourseById,
  getCourseEnrollments,
  getInstructorStudents,
  getMyCourses,
  getMyEnrollments,
  getPublicCourses,
  publishCourse,
  unpublishCourse,
  updateCourse,
  updateMyProgress,
} from "@/store/thunks/courseThunks";

interface CourseState {
  publicCourses: Course[];
  myCourses: Course[];
  selectedCourse: Course | null;
  myEnrollments: Enrollment[];
  courseEnrollments: Enrollment[];
  classmates: Classmate[];
  instructorStudents: InstructorStudent[];
  publicMeta: PaginatedMeta;
  instructorStudentsMeta: PaginatedMeta;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const defaultMeta: PaginatedMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

const initialState: CourseState = {
  publicCourses: [],
  myCourses: [],
  selectedCourse: null,
  myEnrollments: [],
  courseEnrollments: [],
  classmates: [],
  instructorStudents: [],
  publicMeta: defaultMeta,
  instructorStudentsMeta: defaultMeta,
  status: "idle",
  error: null,
};

function mergeCourseInList(list: Course[], course: Course) {
  const index = list.findIndex((item) => item._id === course._id);
  if (index >= 0) {
    list[index] = { ...list[index], ...course };
    return;
  }

  list.unshift(course);
}

const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    clearSelectedCourse(state) {
      state.selectedCourse = null;
    },
    setLandingCourses(state, action: PayloadAction<Course[]>) {
      state.publicCourses = action.payload;
    },
    clearCourseError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPublicCourses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getPublicCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.publicCourses = action.payload.courses;
        state.publicMeta = action.payload.meta;
      })
      .addCase(getPublicCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(getCourseById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getCourseById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedCourse = action.payload;
      })
      .addCase(getCourseById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(getMyCourses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getMyCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.myCourses = action.payload;
      })
      .addCase(getMyCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        mergeCourseInList(state.myCourses, action.payload);
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        mergeCourseInList(state.myCourses, action.payload);
        mergeCourseInList(state.publicCourses, action.payload);
        if (state.selectedCourse?._id === action.payload._id) {
          state.selectedCourse = { ...state.selectedCourse, ...action.payload };
        }
      })
      .addCase(publishCourse.fulfilled, (state, action) => {
        mergeCourseInList(state.myCourses, action.payload);
        mergeCourseInList(state.publicCourses, action.payload);
      })
      .addCase(unpublishCourse.fulfilled, (state, action) => {
        mergeCourseInList(state.myCourses, action.payload);
        state.publicCourses = state.publicCourses.filter(
          (course) => course._id !== action.payload._id,
        );
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.myCourses = state.myCourses.filter(
          (course) => course._id !== action.payload,
        );
        state.publicCourses = state.publicCourses.filter(
          (course) => course._id !== action.payload,
        );
        if (state.selectedCourse?._id === action.payload) {
          state.selectedCourse = null;
        }
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        const index = state.myEnrollments.findIndex(
          (item) => item._id === action.payload._id,
        );

        if (index >= 0) {
          state.myEnrollments[index] = action.payload;
        } else {
          state.myEnrollments.unshift(action.payload);
        }
      })
      .addCase(getMyEnrollments.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getMyEnrollments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.myEnrollments = action.payload;
      })
      .addCase(getMyEnrollments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(updateMyProgress.fulfilled, (state, action) => {
        const enrollment = action.payload;
        const index = state.myEnrollments.findIndex(
          (item) => item._id === enrollment._id,
        );

        if (index >= 0) {
          state.myEnrollments[index] = enrollment;
        }
      })
      .addCase(getCourseEnrollments.fulfilled, (state, action) => {
        state.courseEnrollments = action.payload;
      })
      .addCase(getClassmates.fulfilled, (state, action) => {
        state.classmates = action.payload;
      })
      .addCase(getInstructorStudents.fulfilled, (state, action) => {
        state.instructorStudents = action.payload.students;
        state.instructorStudentsMeta = action.payload.meta;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("courses/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.status = "failed";
          state.error = (action.payload as string) || "Request failed";
        },
      );
  },
});

export const { clearSelectedCourse, setLandingCourses, clearCourseError } =
  courseSlice.actions;

export default courseSlice.reducer;
