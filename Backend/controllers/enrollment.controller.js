const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { ROLES } = require("../middlewares/auth.middleware");

function canManageCourse(user, course) {
  if (!user || !course) {
    return false;
  }

  if (user.role === ROLES.ADMIN) {
    return true;
  }

  return String(course.instructor) === String(user._id);
}

const enrollInCourse = asyncHandler(async (req, res) => {
  const { id: courseId } = req.params;

  const course = await Course.findById(courseId).select(
    "_id title instructor isPublished",
  );
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (!course.isPublished) {
    throw new AppError("Course is not published yet", 400);
  }

  if (course.price > 0) {
    throw new AppError(
      "This course requires payment. Please complete checkout first.",
      402,
    );
  }

  const existingEnrollment = await Enrollment.findOne({
    student: req.user._id,
    course: course._id,
  });

  if (existingEnrollment) {
    return res.status(200).json({
      success: true,
      message: "Already enrolled in this course",
      enrollment: existingEnrollment,
    });
  }

  const enrollment = await Enrollment.create({
    student: req.user._id,
    course: course._id,
  });

  await Course.updateOne({ _id: course._id }, { $inc: { enrolledCount: 1 } });

  return res.status(201).json({
    success: true,
    message: "Enrolled successfully",
    enrollment,
  });
});

const checkCourseEnrollment = asyncHandler(async (req, res) => {
  const { id: courseId } = req.params;

  const course = await Course.findById(courseId).select(
    "_id instructor isPublished",
  );
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (!course.isPublished) {
    throw new AppError("Forbidden", 403);
  }

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: course._id,
  }).select("_id");

  return res.status(200).json({
    success: true,
    isEnrolled: Boolean(enrollment),
    canViewFullCourse: Boolean(enrollment),
  });
});

//!get enrollment of course as a student
const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({
    student: req.user._id,
  })
    .populate({
      path: "course",
      populate: {
        path: "instructor",
        select: "name email avatar",
      },
    })
    .sort({ updatedAt: -1 });

  return res.status(200).json({
    success: true,
    total: enrollments.length,
    enrollments,
  });
});

//! get students enrolled in a course
const getCourseEnrollments = asyncHandler(async (req, res) => {
  const { id: courseId } = req.params;

  const course = await Course.findById(courseId).select("_id title instructor");
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (!canManageCourse(req.user, course)) {
    throw new AppError("Forbidden", 403);
  }

  const enrollments = await Enrollment.find({ course: course._id })
    .populate("student", "name email avatar role")
    .sort({ enrolledAt: -1 });

  return res.status(200).json({
    success: true,
    course: {
      id: course._id,
      title: course.title,
    },
    total: enrollments.length,
    enrollments,
  });
});

const updateMyProgress = asyncHandler(async (req, res) => {
  const { id: courseId } = req.params;
  const { progressPercent, completedLessonIds } = req.body;

  const enrollment = await Enrollment.findOne({
    course: courseId,
    student: req.user._id,
  });

  if (!enrollment) {
    throw new AppError("Enrollment not found for this course", 404);
  }

  if (typeof progressPercent === "number") {
    enrollment.progressPercent = progressPercent;
  }

  if (Array.isArray(completedLessonIds)) {
    const existingSet = new Set(
      enrollment.completedLessonIds.map((item) => String(item)),
    );

    completedLessonIds.forEach((lessonId) => {
      existingSet.add(String(lessonId));
    });

    enrollment.completedLessonIds = Array.from(existingSet);
  }

  enrollment.lastAccessedAt = new Date();
  await enrollment.save();

  return res.status(200).json({
    success: true,
    message: "Progress updated successfully",
    enrollment,
  });
});

module.exports = {
  enrollInCourse,
  checkCourseEnrollment,
  getMyEnrollments,
  getCourseEnrollments,
  updateMyProgress,
};
