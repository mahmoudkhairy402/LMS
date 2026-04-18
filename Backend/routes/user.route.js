const express = require("express");

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserEnrollments,
  getUserCourses,
  instructorStudents,
  getClassmates,
  bulkDeactivateUsers,
  bulkActivateUsers,
  bulkUpdateRole,
  bulkDeleteUsers,
} = require("../controllers/user.controller");
const validate = require("../middlewares/validate.middleware");
const {
  protect,
  authorize,
  requireActiveAccount,
  ROLES,
} = require("../middlewares/auth.middleware");
const {
  updateUserSchema,
  deactivateUserSchema,
  activateUserSchema,
  bulkUpdateRoleSchema,
  bulkDeleteSchema,
} = require("../validators/user.validator");

const router = express.Router();

// All user management routes are protected and require admin role
router.use(protect);
router.use(authorize(ROLES.ADMIN));
router.use(requireActiveAccount);

// Get all users (with filters, search, sorting)
router.get("/", getAllUsers);

// Get user by ID
router.get("/:id", getUserById);

// Get user enrollments
router.get("/:id/enrollments", getUserEnrollments);

// Get user courses (if instructor)
router.get("/:id/courses", getUserCourses);

// Update user
router.put("/:id", validate(updateUserSchema), updateUser);

// Delete user (soft or hard)
router.delete("/:id", deleteUser);

// Bulk Operations (for Admin)
router.post(
  "/bulk/deactivate",
  validate(deactivateUserSchema),
  bulkDeactivateUsers,
);
router.post("/bulk/activate", validate(activateUserSchema), bulkActivateUsers);
router.post(
  "/bulk/update-role",
  validate(bulkUpdateRoleSchema),
  bulkUpdateRole,
);
router.post("/bulk/delete", validate(bulkDeleteSchema), bulkDeleteUsers);

module.exports = router;
