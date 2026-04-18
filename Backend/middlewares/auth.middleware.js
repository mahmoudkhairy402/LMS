const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const ROLES = Object.freeze({
  STUDENT: "student",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
});

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select(
      "-password -refreshToken",
    );

    if (!user) {
      throw new AppError("User not found", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    throw new AppError("Invalid or expired token", 401);
  }
});

const authorize = (...roles) => {
  const allowedRoles = roles.map((role) => String(role).toLowerCase());

  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    if (!allowedRoles.includes(String(req.user.role).toLowerCase())) {
      return next(new AppError("Forbidden", 403));
    }

    return next();
  };
};

// Middleware: Check if user account is active (for write operations)
const requireActiveAccount = (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Unauthorized", 401));
  }

  if (req.user.isActive === false) {
    return next(
      new AppError(
        "Your account is deactivated. Please contact support.",
        403,
      ),
    );
  }

  return next();
};

module.exports = {
  protect,
  authorize,
  requireActiveAccount,
  ROLES,
};
