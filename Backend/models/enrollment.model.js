const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    progressPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    completedLessonIds: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ payment: 1 }, { unique: true, sparse: true });
enrollmentSchema.index({ course: 1, status: 1 });

// Auto-update completion status when progress reaches 100%
enrollmentSchema.pre("save", function updateCompletion() {
  if (this.progressPercent >= 100 && this.status !== "completed") {
    this.status = "completed";
    this.completedAt = new Date();
  }

  if (this.status !== "completed") {
    this.completedAt = null;
  }
});

// Update user stats after saving enrollment
enrollmentSchema.post("save", async function updateUserStats() {
  const User = require("./user.model");

  if (this.isNew) {
    // Increment enrolled courses count
    await User.updateOne(
      { _id: this.student },
      { $inc: { "stats.enrolledCoursesCount": 1 } },
    );
  }
});

// Decrement user stats when enrollment is deleted
enrollmentSchema.post("deleteOne", async function updateUserStatsOnDelete(doc) {
  const User = require("./user.model");

  if (doc && doc.student) {
    await User.updateOne(
      { _id: doc.student },
      { $inc: { "stats.enrolledCoursesCount": -1 } },
    );
  }
});

// Handle bulkWrite or deleteMany by listening to pre-hook
enrollmentSchema.pre(
  ["deleteMany", "updateMany"],
  async function updateStatsOnBulkDelete() {
    if (this.op === "deleteMany" || this.op === "delete") {
      const enrollments = await this.model.find(this.getFilter());
      const students = new Map();

      enrollments.forEach((enrollment) => {
        const studentId = String(enrollment.student);
        students.set(studentId, (students.get(studentId) || 0) + 1);
      });

      const User = require("./user.model");
      for (const [studentId, count] of students.entries()) {
        await User.updateOne(
          { _id: studentId },
          { $inc: { "stats.enrolledCoursesCount": -count } },
        );
      }
    }
  },
);

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

module.exports = Enrollment;
