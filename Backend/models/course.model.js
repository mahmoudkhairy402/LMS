const mongoose = require("mongoose");

function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    type: {
      type: String,
      enum: ["video", "article", "quiz"],
      default: "video",
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    durationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    videoUrl: {
      type: String,
      trim: true,
      default: null,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
    timestamps: false,
  },
);

const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    lessons: {
      type: [lessonSchema],
      default: [],
    },
  },
  {
    _id: true,
    timestamps: false,
  },
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 160,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 4000,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: 280,
      default: "",
    },
    thumbnail: {
      type: String,
      trim: true,
      default: null,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    tags: {
      type: [String],
      default: [],
    },
    language: {
      type: String,
      trim: true,
      default: "English",
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    price: {
      type: Number,
      min: 0,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sections: {
      type: [sectionSchema],
      default: [],
    },
    lessons: {
      type: [lessonSchema],
      default: [],
    },
    totalDurationMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },
    enrolledCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    ratingsAverage: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    ratingsCount: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

courseSchema.pre("validate", async function setSlug() {
  if (!this.slug && this.title) {
    this.slug = createSlug(this.title);
  }

  if (this.slug) {
    this.slug = createSlug(this.slug);
  }

  if (!this.slug) {
    throw new Error("Course slug is required");
  }
});

// Update user stats when course is deleted
courseSchema.post("deleteOne", async function updateUserStatsOnDelete(doc) {
  const User = require("./user.model");

  if (doc && doc.instructor) {
    await User.updateOne(
      { _id: doc.instructor },
      { $inc: { "stats.createdCoursesCount": -1 } },
    );
  }
});

// Handle bulk deletes
courseSchema.pre(
  ["deleteMany", "updateMany"],
  async function updateStatsOnBulkDelete() {
    if (this.op === "deleteMany" || this.op === "delete") {
      const courses = await this.model.find(this.getFilter());
      const instructors = new Map();

      courses.forEach((course) => {
        const instructorId = String(course.instructor);
        instructors.set(instructorId, (instructors.get(instructorId) || 0) + 1);
      });

      const User = require("./user.model");
      for (const [instructorId, count] of instructors.entries()) {
        await User.updateOne(
          { _id: instructorId },
          { $inc: { "stats.createdCoursesCount": -count } },
        );
      }
    }
  },
);

courseSchema.index({ instructor: 1, createdAt: -1 });
courseSchema.index({ category: 1, level: 1, isPublished: 1 });

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
