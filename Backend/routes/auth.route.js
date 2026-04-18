const express = require("express");

const {
  register,
  verifyEmail,
  login,
  updateProfile,
  changePassword,
  googleAuth,
  refresh,
  logout,
  me,
} = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  updateProfileSchema,

  changePasswordSchema,
} = require("../validators/auth.validator");
const { protect, authorize, ROLES } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", validate(loginSchema), login);
router.post("/google", validate(googleAuthSchema), googleAuth);
router.put("/profile", protect, validate(updateProfileSchema), updateProfile);
router.put(
  "/password",
  protect,
  validate(changePasswordSchema),
  changePassword,
);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, me);

// Role-based authorization examples
// router.get("/admin/me", protect, authorize(ROLES.ADMIN), me);
// router.get(
//   "/instructor/me",
//   protect,
//   authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
//   me,
// );

module.exports = router;
