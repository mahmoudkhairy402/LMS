const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const connectDB = require("../config/db");
const User = require("../models/user.model");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");

const avatarByEmail = {
  "admin@lms.com":
    "https://api.dicebear.com/7.x/initials/svg?seed=Admin%20User",
  "mahmoudkhairy402@gmail.com":
    "https://api.dicebear.com/7.x/initials/svg?seed=Mahmoud%20Khairy",
  "sara@lms.com":
    "https://api.dicebear.com/7.x/initials/svg?seed=Sara%20Instructor",
  "omar@lms.com":
    "https://api.dicebear.com/7.x/initials/svg?seed=Omar%20Instructor",
  "ali@lms.com": "https://api.dicebear.com/7.x/initials/svg?seed=Ali%20Student",
  "mona@lms.com":
    "https://api.dicebear.com/7.x/initials/svg?seed=Mona%20Student",
  "huda@lms.com":
    "https://api.dicebear.com/7.x/initials/svg?seed=Huda%20Student",
  "youssef@lms.com":
    "https://api.dicebear.com/7.x/initials/svg?seed=Youssef%20Student",
  "nour@lms.com":
    "https://api.dicebear.com/7.x/initials/svg?seed=Nour%20Student",
};

const courseThumbnailByTitle = {
  "React Fundamentals":
    "https://picsum.photos/seed/react-fundamentals/1280/720",
  "Advanced Node.js APIs":
    "https://picsum.photos/seed/advanced-nodejs-apis/1280/720",
  "MongoDB Schema Design":
    "https://picsum.photos/seed/mongodb-schema-design/1280/720",
  "Next.js App Router": "https://picsum.photos/seed/nextjs-app-router/1280/720",
};

const sampleVideoUrls = [
  "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
  "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",
  "https://samplelib.com/lib/preview/mp4/sample-15s.mp4",
  "https://samplelib.com/lib/preview/mp4/sample-20s.mp4",
];

function buildCourseContent(title, baseTopic, videoIndexOffset = 0) {
  return {
    sections: [
      {
        title: `${baseTopic} Basics`,
        order: 1,
        lessons: [
          {
            title: `${baseTopic} Introduction`,
            type: "video",
            order: 1,
            durationMinutes: 12,
            content: `Introduction to ${baseTopic}.`,
            videoUrl:
              sampleVideoUrls[(videoIndexOffset + 0) % sampleVideoUrls.length],
            isPreview: true,
          },
          {
            title: `${baseTopic} Core Concepts`,
            type: "article",
            order: 2,
            durationMinutes: 18,
            content: `Core concepts and workflow for ${baseTopic}.`,
            isPreview: false,
          },
        ],
      },
      {
        title: `${baseTopic} Practice`,
        order: 2,
        lessons: [
          {
            title: `${title} Project Walkthrough`,
            type: "video",
            order: 1,
            durationMinutes: 20,
            content: `A practical walkthrough for ${title}.`,
            videoUrl:
              sampleVideoUrls[(videoIndexOffset + 1) % sampleVideoUrls.length],
            isPreview: false,
          },
          {
            title: `${baseTopic} Quiz`,
            type: "quiz",
            order: 2,
            durationMinutes: 10,
            content: `Test your understanding of ${baseTopic}.`,
            isPreview: false,
          },
        ],
      },
    ],
    lessons: [
      {
        title: `${baseTopic} Overview`,
        type: "video",
        order: 1,
        durationMinutes: 8,
        content: `A short overview of ${baseTopic}.`,
        videoUrl: sampleVideoUrls[videoIndexOffset % sampleVideoUrls.length],
        isPreview: true,
      },
    ],
  };
}

async function createUserIfMissing(userData) {
  const existingUser = await User.findOne({ email: userData.email });

  if (existingUser) {
    return { user: existingUser, created: false };
  }

  const [createdUser] = await User.insertMany([userData]);
  return { user: createdUser, created: true };
}

async function createUsers() {
  const passwordHash = await bcrypt.hash("12345678", 12);

  const seedUsers = [
    {
      name: "Admin User",
      email: "admin@lms.com",
      password: passwordHash,
      role: "admin",
      isEmailVerified: true,
      isActive: true,
      avatar: avatarByEmail["admin@lms.com"],
    },
    {
      name: "Mahmoud Khairy",
      email: "mahmoudkhairy402@gmail.com",
      password: passwordHash,
      role: "admin",
      isEmailVerified: true,
      isActive: true,
      avatar: avatarByEmail["mahmoudkhairy402@gmail.com"],
    },
    {
      name: "Sara Instructor",
      email: "sara@lms.com",
      password: passwordHash,
      role: "instructor",
      isEmailVerified: true,
      isActive: true,
      avatar: avatarByEmail["sara@lms.com"],
    },
    {
      name: "Omar Instructor",
      email: "omar@lms.com",
      password: passwordHash,
      role: "instructor",
      isEmailVerified: true,
      isActive: true,
      avatar: avatarByEmail["omar@lms.com"],
    },
    {
      name: "Ali Student",
      email: "ali@lms.com",
      password: passwordHash,
      role: "student",
      isEmailVerified: true,
      isActive: true,
      avatar: avatarByEmail["ali@lms.com"],
    },
    {
      name: "Mona Student",
      email: "mona@lms.com",
      password: passwordHash,
      role: "student",
      isEmailVerified: true,
      isActive: true,
      avatar: avatarByEmail["mona@lms.com"],
    },
    {
      name: "Huda Student",
      email: "huda@lms.com",
      password: passwordHash,
      role: "student",
      isEmailVerified: true,
      isActive: true,
      avatar: avatarByEmail["huda@lms.com"],
    },
    {
      name: "Youssef Student",
      email: "youssef@lms.com",
      password: passwordHash,
      role: "student",
      isEmailVerified: true,
      isActive: true,
      avatar: avatarByEmail["youssef@lms.com"],
    },
    {
      name: "Nour Student",
      email: "nour@lms.com",
      password: passwordHash,
      role: "student",
      isEmailVerified: true,
      isActive: true,
      avatar: avatarByEmail["nour@lms.com"],
    },
  ];

  const users = [];
  for (const userData of seedUsers) {
    const result = await createUserIfMissing(userData);
    users.push(result);
  }

  const map = Object.fromEntries(users.map(({ user }) => [user.email, user]));
  return map;
}

async function createCourses(users) {
  const seedCourses = [
    {
      title: "React Fundamentals",
      description:
        "Learn React from the ground up with components, props, hooks, and real UI patterns.",
      shortDescription: "React for beginners.",
      thumbnail: courseThumbnailByTitle["React Fundamentals"],
      category: "Frontend",
      tags: ["react", "frontend", "javascript"],
      language: "English",
      level: "beginner",
      price: 0,
      isPublished: true,
      instructor: users["sara@lms.com"]._id,
      totalDurationMinutes: 420,
      enrolledCount: 0,
      ratingsAverage: 4.8,
      ratingsCount: 124,
      ...buildCourseContent("React Fundamentals", "React", 0),
    },
    {
      title: "Advanced Node.js APIs",
      description:
        "Build scalable REST APIs with Node.js, Express, authentication, validation, and architecture.",
      shortDescription: "Node.js backend deep dive.",
      thumbnail: courseThumbnailByTitle["Advanced Node.js APIs"],
      category: "Backend",
      tags: ["node", "express", "api"],
      language: "English",
      level: "advanced",
      price: 49,
      isPublished: true,
      instructor: users["sara@lms.com"]._id,
      totalDurationMinutes: 600,
      enrolledCount: 0,
      ratingsAverage: 4.7,
      ratingsCount: 86,
      ...buildCourseContent("Advanced Node.js APIs", "Node.js", 1),
    },
    {
      title: "MongoDB Schema Design",
      description:
        "Design practical MongoDB schemas using embedding, referencing, indexing, and data modeling patterns.",
      shortDescription: "MongoDB modeling made simple.",
      thumbnail: courseThumbnailByTitle["MongoDB Schema Design"],
      category: "Database",
      tags: ["mongodb", "schema", "database"],
      language: "English",
      level: "intermediate",
      price: 29,
      isPublished: true,
      instructor: users["omar@lms.com"]._id,
      totalDurationMinutes: 360,
      enrolledCount: 0,
      ratingsAverage: 4.9,
      ratingsCount: 52,
      ...buildCourseContent("MongoDB Schema Design", "MongoDB", 2),
    },
    {
      title: "Next.js App Router",
      description:
        "Master the Next.js App Router, layouts, data fetching, and production patterns.",
      shortDescription: "Modern Next.js workflows.",
      thumbnail: courseThumbnailByTitle["Next.js App Router"],
      category: "Frontend",
      tags: ["nextjs", "react", "frontend"],
      language: "English",
      level: "intermediate",
      price: 39,
      isPublished: true,
      instructor: users["omar@lms.com"]._id,
      totalDurationMinutes: 480,
      enrolledCount: 0,
      ratingsAverage: 4.6,
      ratingsCount: 73,
      ...buildCourseContent("Next.js App Router", "Next.js", 3),
    },
  ];

  const courses = [];
  for (const courseData of seedCourses) {
    const existingCourse = await Course.findOne({ title: courseData.title });

    if (existingCourse) {
      courses.push({
        course: existingCourse,
        created: false,
        data: courseData,
      });
      continue;
    }

    const [createdCourse] = await Course.insertMany([courseData]);
    courses.push({ course: createdCourse, created: true, data: courseData });
  }

  const courseMap = Object.fromEntries(
    courses.map(({ course }) => [course.title, course]),
  );

  const createdByInstructor = new Map();

  for (const courseEntry of courses) {
    if (!courseEntry.created) {
      continue;
    }

    const instructorEmail =
      courseEntry.data.instructor.toString() ===
      users["sara@lms.com"]._id.toString()
        ? "sara@lms.com"
        : "omar@lms.com";

    createdByInstructor.set(
      instructorEmail,
      (createdByInstructor.get(instructorEmail) || 0) + 1,
    );
  }

  for (const [email, count] of createdByInstructor.entries()) {
    await User.updateOne(
      { _id: users[email]._id },
      { $inc: { "stats.createdCoursesCount": count } },
    );
  }

  return courseMap;
}

async function createEnrollments(users, courses) {
  const enrollmentDocs = [
    {
      student: users["ali@lms.com"]._id,
      course: courses["React Fundamentals"]._id,
      status: "active",
      progressPercent: 35,
    },
    {
      student: users["ali@lms.com"]._id,
      course: courses["Advanced Node.js APIs"]._id,
      status: "active",
      progressPercent: 20,
    },
    {
      student: users["mona@lms.com"]._id,
      course: courses["React Fundamentals"]._id,
      status: "completed",
      progressPercent: 100,
      completedAt: new Date(),
    },
    {
      student: users["huda@lms.com"]._id,
      course: courses["MongoDB Schema Design"]._id,
      status: "cancelled",
      progressPercent: 12,
    },
    {
      student: users["youssef@lms.com"]._id,
      course: courses["Next.js App Router"]._id,
      status: "active",
      progressPercent: 55,
    },
    {
      student: users["nour@lms.com"]._id,
      course: courses["React Fundamentals"]._id,
      status: "active",
      progressPercent: 10,
    },
  ];

  const enrollments = [];
  for (const enrollmentData of enrollmentDocs) {
    const existingEnrollment = await Enrollment.findOne({
      student: enrollmentData.student,
      course: enrollmentData.course,
    });

    if (existingEnrollment) {
      enrollments.push({ enrollment: existingEnrollment, created: false });
      continue;
    }

    const [createdEnrollment] = await Enrollment.insertMany([enrollmentData]);
    enrollments.push({ enrollment: createdEnrollment, created: true });
  }

  const courseEnrollmentCounts = new Map();
  const studentEnrollmentCounts = new Map();

  enrollments.forEach(({ enrollment, created }) => {
    if (!created) {
      return;
    }

    const courseId = String(enrollment.course);
    const studentId = String(enrollment.student);

    courseEnrollmentCounts.set(
      courseId,
      (courseEnrollmentCounts.get(courseId) || 0) + 1,
    );
    studentEnrollmentCounts.set(
      studentId,
      (studentEnrollmentCounts.get(studentId) || 0) + 1,
    );
  });

  for (const [courseId, count] of courseEnrollmentCounts.entries()) {
    await Course.updateOne(
      { _id: courseId },
      { $inc: { enrolledCount: count } },
    );
  }

  for (const [studentId, count] of studentEnrollmentCounts.entries()) {
    await User.updateOne(
      { _id: studentId },
      { $inc: { "stats.enrolledCoursesCount": count } },
    );
  }

  return enrollments.map(({ enrollment }) => enrollment);
}

async function seed() {
  try {
    await connectDB();

    const users = await createUsers();
    const courses = await createCourses(users);
    const enrollments = await createEnrollments(users, courses);

    console.log("Seed completed successfully");
    console.log(`Users: ${Object.keys(users).length}`);
    console.log(`Courses: ${Object.keys(courses).length}`);
    console.log(`Enrollments: ${enrollments.length}`);

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
}

seed();
