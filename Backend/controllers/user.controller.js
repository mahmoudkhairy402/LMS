const User = require("../models/user.model");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { ROLES } = require("../middlewares/auth.middleware");

const USER_SAFE_SELECT =
  "name email avatar isActive role isEmailVerified createdAt updatedAt";

// Helper: Calculate fresh stats for a user
async function recalculateUserStats(userId) {
  const enrollmentCount = await Enrollment.countDocuments({
    student: userId,
  });

  const courseCount = await Course.countDocuments({
    instructor: userId,
  });

  return {
    enrolledCoursesCount: enrollmentCount,
    createdCoursesCount: courseCount,
  };
}

const getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};

  if (req.query.role) {
    filter.role = req.query.role;
  }

  // Status filter: active/inactive
  if (req.query.status === "active") {
    filter.isActive = true;
  } else if (req.query.status === "inactive") {
    filter.isActive = false;
  }

  if (
    req.query.isEmailVerified === "true" ||
    req.query.isEmailVerified === "false"
  ) {
    filter.isEmailVerified = req.query.isEmailVerified === "true";
  }

  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  }

  // Dynamic sorting
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  // Only allow sorting by safe fields
  const allowedSortFields = [
    "name",
    "email",
    "role",
    "createdAt",
    "lastLoginAt",
  ];
  if (!allowedSortFields.includes(sortBy)) {
    throw new AppError("Invalid sortBy field", 400);
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(USER_SAFE_SELECT)
      .sort(sort)
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  // Enrich with stats (already in document)
  const usersData = users.map((user) => ({
    ...user.toObject(),
    enrollmentCount: user.stats?.enrolledCoursesCount || 0,
    courseCount: user.stats?.createdCoursesCount || 0,
  }));

  return res.status(200).json({
    success: true,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    users: usersData,
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select(USER_SAFE_SELECT);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return res.status(200).json({
    success: true,
    user: {
      ...user.toObject(),
      enrollmentCount: user.stats?.enrolledCoursesCount || 0,
      courseCount: user.stats?.createdCoursesCount || 0,
    },
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, role, isEmailVerified, isActive } = req.body;

  const user = await User.findById(id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Only admin can change role and email verification status
  if (typeof role !== "undefined" && !Object.values(ROLES).includes(role)) {
    throw new AppError("Invalid role", 400);
  }

  if (typeof name !== "undefined") {
    user.name = name.trim();
  }

  if (typeof role !== "undefined") {
    user.role = role;
  }

  if (typeof isEmailVerified === "boolean") {
    user.isEmailVerified = isEmailVerified;
  }
  if (typeof isActive === "boolean") {
    user.isActive = isActive;
  }

  await user.save();

  return res.status(200).json({
    success: true,
    message: "User updated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
    },
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const permanent = req.body?.permanent === true;

  const user = await User.findById(id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Prevent deleting admin users for safety
  if (user.role === ROLES.ADMIN) {
    throw new AppError("Cannot delete admin users", 403);
  }

  // Soft delete (deactivate)
  if (!permanent) {
    user.isActive = false;
    user.deactivatedAt = new Date();
    user.deactivatedBy = req.user._id;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  }

  await Course.deleteMany({ instructor: user._id });
  await Enrollment.deleteMany({ student: user._id });
  await user.deleteOne();

  return res.status(200).json({
    success: true,
    message: "User deleted permanently",
  });
});

const getUserEnrollments = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const user = await User.findById(userId).select("_id name email");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const [enrollments, total] = await Promise.all([
    Enrollment.find({ student: user._id })
      .populate({
        path: "course",
        select: "title slug category level isPublished instructor",
        populate: {
          path: "instructor",
          select: "name",
        },
      })
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limit),
    Enrollment.countDocuments({ student: user._id }),
  ]);

  return res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    enrollments,
  });
});

const getUserCourses = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const user = await User.findById(userId).select("_id name email role");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role !== ROLES.INSTRUCTOR && user.role !== ROLES.ADMIN) {
    throw new AppError("User is not an instructor", 400);
  }

  const [courses, total] = await Promise.all([
    Course.find({ instructor: user._id })
      .select(
        "title slug category level price isPublished enrolledCount ratingsAverage createdAt",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Course.countDocuments({ instructor: user._id }),
  ]);

  return res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    courses,
  });
});

// Instructor: Get their students across courses or for specific course
const instructorStudents = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;
  const courseId = req.query.courseId;
  const enrollmentStatus = req.query.enrollmentStatus || "active";
  const search = req.query.search;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  // Build enrollment filter
  const enrollmentFilter = { status: enrollmentStatus };

  // If courseId provided, filter to that course only
  if (courseId) {
    const course = await Course.findById(courseId).select("_id instructor");
    if (!course) {
      throw new AppError("Course not found", 404);
    }

    if (String(course.instructor) !== String(instructorId)) {
      throw new AppError("Forbidden: You don't own this course", 403);
    }

    enrollmentFilter.course = courseId;
  } else {
    // Get all courses by this instructor
    const courses = await Course.find({ instructor: instructorId }).select(
      "_id",
    );
    const courseIds = courses.map((c) => c._id);
    if (courseIds.length > 0) {
      enrollmentFilter.course = { $in: courseIds };
    }
  }

  // Search filter
  let enrollments;
  if (search) {
    enrollments = await Enrollment.find(enrollmentFilter)
      .populate({
        path: "student",
        select: "name email avatar",
        match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        },
      })
      .skip(skip)
      .limit(limit)
      .sort({ enrolledAt: -1 });

    enrollments = enrollments.filter((e) => e.student);
  } else {
    enrollments = await Enrollment.find(enrollmentFilter)
      .populate("student", "name email avatar")
      .populate("course", "title")
      .skip(skip)
      .limit(limit)
      .sort({ enrolledAt: -1 });
  }

  const total = await Enrollment.countDocuments(enrollmentFilter);

  return res.status(200).json({
    success: true,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    students: enrollments.map((e) => ({
      id: e._id,
      studentId: e.student._id,
      name: e.student.name,
      email: e.student.email,
      avatar: e.student.avatar,
      enrollmentStatus: e.status,
      progressPercent: e.progressPercent,
      lastAccessedAt: e.lastAccessedAt,
      courseName: e.course?.title,
    })),
  });
});

//! Student: Get classmates in specific course
const getClassmates = asyncHandler(async (req, res) => {
  const courseId = req.params.courseId || req.params.id;
  const currentUserId = req.user._id;

  const course = await Course.findById(courseId).select("_id isPublished");
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (!course.isPublished) {
    throw new AppError("Course is not published", 403);
  }

  // Get current user enrollment to verify access
  const currentUserEnrollment = await Enrollment.findOne({
    course: courseId,
    student: currentUserId,
  });

  if (!currentUserEnrollment) {
    throw new AppError("You are not enrolled in this course", 403);
  }

  // Get all enrollments in this course (active only)
  const enrollments = await Enrollment.find({
    course: courseId,
    status: "active",
    student: { $ne: currentUserId }, // Exclude current user
  })
    .populate({
      path: "student",
      select: "name avatar _id",
    })
    .sort({ enrolledAt: -1 });

  return res.status(200).json({
    success: true,
    total: enrollments.length,
    classmates: enrollments.map((e) => ({
      id: e.student._id,
      name: e.student.name,
      avatar: e.student.avatar,
      progressPercent: e.progressPercent,
    })),
  });
});

// Bulk Operations
const bulkDeactivateUsers = asyncHandler(async (req, res) => {
  const { userIds, reason } = req.body;

  if (!userIds || userIds.length === 0) {
    throw new AppError("No user IDs provided", 400);
  }

  const deactivatedAt = new Date();

  const result = await User.updateMany(
    {
      _id: { $in: userIds },
      role: { $ne: ROLES.ADMIN }, // Prevent deactivating admins
    },
    {
      $set: {
        isActive: false,
        deactivatedAt,
        deactivatedBy: req.user._id,
      },
    },
  );

  return res.status(200).json({
    success: true,
    message: `${result.modifiedCount} user(s) deactivated`,
    result: {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      reason: reason || null,
    },
  });
});

const bulkActivateUsers = asyncHandler(async (req, res) => {
  const { userIds } = req.body;

  if (!userIds || userIds.length === 0) {
    throw new AppError("No user IDs provided", 400);
  }

  const result = await User.updateMany(
    {
      _id: { $in: userIds },
      isActive: false,
    },
    {
      $set: {
        isActive: true,
        deactivatedAt: null,
        deactivatedBy: null,
      },
    },
  );

  return res.status(200).json({
    success: true,
    message: `${result.modifiedCount} user(s) activated`,
    result: {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    },
  });
});

const bulkUpdateRole = asyncHandler(async (req, res) => {
  const { userIds, newRole } = req.body;

  if (!userIds || userIds.length === 0) {
    throw new AppError("No user IDs provided", 400);
  }

  if (!Object.values(ROLES).includes(newRole)) {
    throw new AppError("Invalid role", 400);
  }

  // Prevent downgrading last admin
  const adminCount = await User.countDocuments({
    role: ROLES.ADMIN,
    _id: { $nin: userIds },
  });

  const adminsBeingDowngraded = await User.countDocuments({
    _id: { $in: userIds },
    role: ROLES.ADMIN,
  });

  if (adminCount === 0 && adminsBeingDowngraded > 0) {
    throw new AppError("Cannot remove the last admin user", 400);
  }

  const result = await User.updateMany(
    { _id: { $in: userIds } },
    { $set: { role: newRole } },
  );

  return res.status(200).json({
    success: true,
    message: `Role updated for ${result.modifiedCount} user(s)`,
    result: {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    },
  });
});

const bulkDeleteUsers = asyncHandler(async (req, res) => {
  const { userIds, permanent } = req.body;

  if (!userIds || userIds.length === 0) {
    throw new AppError("No user IDs provided", 400);
  }

  // Prevent deleting admin users
  const adminUsers = await User.find({
    _id: { $in: userIds },
    role: ROLES.ADMIN,
  });

  if (adminUsers.length > 0) {
    throw new AppError(
      `Cannot delete admin users: ${adminUsers.map((u) => u.email).join(", ")}`,
      403,
    );
  }

  if (permanent) {
    // Hard delete: remove courses and enrollments
    const users = await User.find({ _id: { $in: userIds } });

    await Promise.all(
      users.map(async (user) => {
        await Course.deleteMany({ instructor: user._id });
        await Enrollment.deleteMany({ student: user._id });
        await user.deleteOne();
      }),
    );

    return res.status(200).json({
      success: true,
      message: `${users.length} user(s) permanently deleted`,
      result: {
        deletedCount: users.length,
      },
    });
  }

  // Soft delete: deactivate
  const result = await User.updateMany(
    { _id: { $in: userIds } },
    {
      $set: {
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: req.user._id,
      },
    },
  );

  return res.status(200).json({
    success: true,
    message: `${result.modifiedCount} user(s) deactivated`,
    result: {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    },
  });
});

const getInstructors = asyncHandler(async (req, res) => {
  const filter = {
    role: ROLES.INSTRUCTOR,
    isActive: true,
  };

  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const instructors = await User.find(filter).select("name email avatar stats");

  return res.status(200).json({
    success: true,
    total: instructors.length,
    instructors,
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserEnrollments,
  getUserCourses,
  getInstructors,
  instructorStudents,
  getClassmates,
  bulkDeactivateUsers,
  bulkActivateUsers,
  bulkUpdateRole,
  bulkDeleteUsers,
};
