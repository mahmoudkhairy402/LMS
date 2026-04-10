const express = require("express");

const {
  register,
  verifyEmail,
  login,
  updateAvatar,
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
  updateAvatarSchema,
} = require("../validators/auth.validator");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", validate(loginSchema), login);
router.post("/google", validate(googleAuthSchema), googleAuth);
router.put("/avatar", protect, validate(updateAvatarSchema), updateAvatar);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, me);

module.exports = router;
