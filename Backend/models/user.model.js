const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
      default: null,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      required: function requirePassword() {
        return !this.googleId;
      },
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
      select: false,
    },
    verificationTokenExpires: {
      type: Date,
      default: null,
      select: false,
    },
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    deactivatedAt: {
      type: Date,
      default: null,
      select: false,
    },
    deactivatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      select: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastSeenAt: {
      type: Date,
      default: null,
    },
    stats: {
      enrolledCoursesCount: {
        type: Number,
        min: 0,
        default: 0,
      },
      createdCoursesCount: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function hashPassword() {
  if (!this.password || !this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(
  candidatePassword,
) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes for efficient querying and sorting
userSchema.index({ role: 1, isActive: 1, createdAt: -1 });
userSchema.index({ name: 1, email: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;
