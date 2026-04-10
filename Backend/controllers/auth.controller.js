const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/user.model");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const sendEmail = require("../utils/sendEmail");
const verifyGoogleIdToken = require("../utils/verifyGoogleIdToken");

function createAccessToken(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
}

function createRefreshToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
}

function createEmailVerificationToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);

  return { rawToken, hashedToken, expiresAt };
}

function getApiBaseUrl() {
  return (
    process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`
  );
}

async function sendVerificationEmail(email, token) {
  const verifyUrl = `${getApiBaseUrl()}/api/auth/verify-email/${token}`;
  const subject = "Verify your LMS account";
  const text = `Welcome to LMS. Verify your email by opening this link: ${verifyUrl}`;
  const html = `
    <p>Welcome to LMS.</p>
    <p>Please verify your email by clicking the link below:</p>
    <p><a href="${verifyUrl}">click here for verification </a></p>
    <p>This link expires in 6 hours.</p>
  `;

  await sendEmail({ to: email, subject, text, html });
}

function refreshCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const { rawToken, hashedToken, expiresAt } = createEmailVerificationToken();

  const user = await User.create({
    name,
    email,
    password,
    role: role || "student",
    verificationToken: hashedToken,
    verificationTokenExpires: expiresAt,
  });

  await sendVerificationEmail(user.email, rawToken);

  return res.status(201).json({
    success: true,
    message: "User registered successfully. Please verify your email.",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    throw new AppError("Verification token is required", 400);
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: new Date() },
  }).select("+verificationToken +verificationTokenExpires");

  if (!user) {
    throw new AppError("Invalid or expired verification token", 400);
  }

  user.isEmailVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpires = null;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Email verified successfully. You can login now.",
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password +refreshToken");
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email before logging in", 403);
  }

  const accessToken = createAccessToken(user._id, user.role);
  const refreshToken = createRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, refreshCookieOptions());

  return res.status(200).json({
    success: true,
    message: "Logged in successfully",
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    },
  });
});

const updateAvatar = asyncHandler(async (req, res) => {
  const { avatar } = req.body;

  const user = await User.findById(req.user._id).select(
    "-password -refreshToken",
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.avatar = avatar;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Avatar updated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
  });
});

const googleAuth = asyncHandler(async (req, res) => {
  const { idToken, role } = req.body;

  const googlePayload = await verifyGoogleIdToken(idToken);
  const googleEmail = googlePayload.email;
  const googleId = googlePayload.sub;
  const googleAvatar = googlePayload.picture || null;

  if (!googleEmail || !googleId) {
    throw new AppError("Google account data is incomplete", 400);
  }

  if (googlePayload.email_verified !== true) {
    throw new AppError("Google email is not verified", 403);
  }

  let user = await User.findOne({ email: googleEmail }).select("+refreshToken");

  if (!user) {
    user = await User.create({
      name: googlePayload.name || "Google User",
      email: googleEmail,
      avatar: googleAvatar,
      googleId,
      role: role || "student",
      isEmailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    });
  } else {
    if (user.googleId && user.googleId !== googleId) {
      throw new AppError("Google account mismatch for this email", 409);
    }

    if (!user.googleId) {
      user.googleId = googleId;
    }

    if (googleAvatar) {
      user.avatar = googleAvatar;
    }

    user.isEmailVerified = true;
  }

  const accessToken = createAccessToken(user._id, user.role);
  const refreshToken = createRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, refreshCookieOptions());

  return res.status(200).json({
    success: true,
    message: "Google authentication successful",
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
  });
});

const refresh = asyncHandler(async (req, res) => {
  const cookieToken = req.cookies.refreshToken;
  if (!cookieToken) {
    throw new AppError("Refresh token is missing", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(cookieToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const user = await User.findById(decoded.userId).select("+refreshToken");
  if (!user || !user.refreshToken || user.refreshToken !== cookieToken) {
    throw new AppError("Refresh token is invalid", 401);
  }

  const accessToken = createAccessToken(user._id, user.role);
  const newRefreshToken = createRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save();

  res.cookie("refreshToken", newRefreshToken, refreshCookieOptions());

  return res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    accessToken,
  });
});

const logout = asyncHandler(async (req, res) => {
  const cookieToken = req.cookies.refreshToken;

  if (cookieToken) {
    const user = await User.findOne({ refreshToken: cookieToken }).select(
      "+refreshToken",
    );
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }

  res.clearCookie("refreshToken", refreshCookieOptions());

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

const me = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

module.exports = {
  register,
  verifyEmail,
  login,
  updateAvatar,
  googleAuth,
  refresh,
  logout,
  me,
};
