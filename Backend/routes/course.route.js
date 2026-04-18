const express = require("express");

const {
  createCourse,
  getCourses,
  getMyCourses,
  getCourseById,
  publishCourse,
  unpublishCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/course.controller");
const {
  enrollInCourse,
  getMyEnrollments,
  getCourseEnrollments,
  updateMyProgress,
} = require("../controllers/enrollment.controller");
const {
  instructorStudents,
  getClassmates,
} = require("../controllers/user.controller");
const validate = require("../middlewares/validate.middleware");
const {
  protect,
  authorize,
  requireActiveAccount,
  ROLES,
} = require("../middlewares/auth.middleware");
const {
  createCourseSchema,
  updateCourseSchema,
} = require("../validators/course.validator");
const { updateProgressSchema } = require("../validators/enrollment.validator");

const router = express.Router();

router.get("/", getCourses);

router.get(
  "/enrollments/mine",
  protect,
  authorize(ROLES.STUDENT, ROLES.ADMIN),
  requireActiveAccount,
  getMyEnrollments,
);

router.get(
  "/manage/mine",
  protect,
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  requireActiveAccount,
  getMyCourses,
);

// Instructor: Get students in their courses
router.get(
  "/instructor/students",
  protect,
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  requireActiveAccount,
  instructorStudents,
);

// Student: Get classmates in course
router.get(
  "/:courseId/classmates",
  protect,
  authorize(ROLES.STUDENT),
  requireActiveAccount,
  getClassmates,
);

router.get(
  "/:id/students",
  protect,
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  requireActiveAccount,
  getCourseEnrollments,
);

router.post(
  "/:id/enroll",
  protect,
  authorize(ROLES.STUDENT),
  requireActiveAccount,
  enrollInCourse,
);

router.patch(
  "/:id/progress",
  protect,
  authorize(ROLES.STUDENT),
  requireActiveAccount,
  validate(updateProgressSchema),
  updateMyProgress,
);

router.get("/:id", protect, getCourseById);

router.patch(
  "/:id/publish",
  protect,
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  requireActiveAccount,
  publishCourse,
);

router.patch(
  "/:id/unpublish",
  protect,
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  requireActiveAccount,
  unpublishCourse,
);

router.post(
  "/",
  protect,
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  requireActiveAccount,
  validate(createCourseSchema),
  createCourse,
);

router.put(
  "/:id",
  protect,
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  requireActiveAccount,
  validate(updateCourseSchema),
  updateCourse,
);

router.delete(
  "/:id",
  protect,
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  requireActiveAccount,
  deleteCourse,
);

module.exports = router;
