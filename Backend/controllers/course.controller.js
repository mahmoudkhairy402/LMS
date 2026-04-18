const Course = require("../models/course.model");
const User = require("../models/user.model");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { ROLES } = require("../middlewares/auth.middleware");

const COURSE_METADATA_SELECT =
  "title slug shortDescription thumbnail category tags language level price isPublished instructor totalDurationMinutes enrolledCount ratingsAverage ratingsCount createdAt updatedAt";

function canManageCourse(user, course) {
  if (!user || !course) {
    return false;
  }

  if (user.role === ROLES.ADMIN) {
    return true;
  }

  return String(course.instructor) === String(user._id);
}

const createCourse = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    instructor: req.user._id,
  };

  const course = await Course.create(payload);

  // Update user's created courses count
  await User.updateOne(
    { _id: req.user._id },
    { $inc: { "stats.createdCoursesCount": 1 } },
  );

  return res.status(201).json({
    success: true,
    message: "Course created successfully",
    courseId: course._id,
    course,
  });
});

const getCourses = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter = {
    isPublished: true,
  };

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.level) {
    filter.level = req.query.level;
  }

  if (req.query.instructor) {
    filter.instructor = req.query.instructor;
  }

  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
      { tags: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .select(COURSE_METADATA_SELECT)
      .populate("instructor", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    courses,
  });
});

const getMyCourses = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === ROLES.ADMIN ? {} : { instructor: req.user._id };

  const courses = await Course.find(filter)
    .populate("instructor", "name email avatar")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    total: courses.length,
    courses,
  });
});

const getCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id)
    .select(COURSE_METADATA_SELECT)
    .populate("instructor", "name email avatar role");

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (!course.isPublished && !canManageCourse(req.user, course)) {
    throw new AppError("Forbidden", 403);
  }

  return res.status(200).json({
    success: true,
    course,
  });
});

const publishCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (!canManageCourse(req.user, course)) {
    throw new AppError("Forbidden", 403);
  }

  if (course.isPublished) {
    return res.status(200).json({
      success: true,
      message: "Course is already published",
      course,
    });
  }

  course.isPublished = true;
  await course.save();

  return res.status(200).json({
    success: true,
    message: "Course published successfully",
    course,
  });
});

const unpublishCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (!canManageCourse(req.user, course)) {
    throw new AppError("Forbidden", 403);
  }

  if (!course.isPublished) {
    return res.status(200).json({
      success: true,
      message: "Course is already unpublished",
      course,
    });
  }

  course.isPublished = false;
  await course.save();

  return res.status(200).json({
    success: true,
    message: "Course unpublished successfully",
    course,
  });
});

const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (!canManageCourse(req.user, course)) {
    throw new AppError("Forbidden", 403);
  }

  const forbiddenFields = [
    "instructor",
    "enrolledCount",
    "ratingsAverage",
    "ratingsCount",
  ];
  forbiddenFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      delete req.body[field];
    }
  });

  Object.assign(course, req.body);
  await course.save();

  return res.status(200).json({
    success: true,
    message: "Course updated successfully",
    course,
  });
});

const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (!canManageCourse(req.user, course)) {
    throw new AppError("Forbidden", 403);
  }

  await course.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Course deleted successfully",
  });
});

module.exports = {
  createCourse,
  getCourses,
  getMyCourses,
  getCourseById,
  publishCourse,
  unpublishCourse,
  updateCourse,
  deleteCourse,
};
