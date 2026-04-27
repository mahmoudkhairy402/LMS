import type { Course, Enrollment } from "@/types/course";
import type { HomeInstructor } from "@/types/home";
import type { Instructor } from "@/types/user";

const fallbackCourses: Course[] = [];
const fallbackInstructors: HomeInstructor[] = [];
const fallbackEnrollments: Enrollment[] = [];

type CoursesApiResponse = {
  success?: boolean;
  courses?: Course[];
};

type EnrollmentsApiResponse = {
  success?: boolean;
  enrollments?: Enrollment[];
};

function buildInstructorsFromCourses(courses: Course[]): HomeInstructor[] {
  const map = new Map<string, HomeInstructor>();

  for (const course of courses) {
    const instructor = course.instructor;
    if (!instructor?.name) continue;

    // Use instructor-level stats when available (authoritative source)
    if (map.has(instructor.name)) {
      continue; // already added using stats
    }

    const category = course.category || "Professional Track";
    const language = course.language || "English";

    const courseCount = instructor.stats?.createdCoursesCount ?? 1;
    const learnersCount = instructor.stats?.enrolledCoursesCount ?? (course.enrolledCount || 0);

    map.set(instructor.name, {
      ...instructor,
      specialty: `${category} • ${language}`,
      learners: learnersCount > 0 ? `${learnersCount} learners` : "",
      courseCount,
    });
  }

  return Array.from(map.values());
}

export async function getLandingPageData(accessToken?: string): Promise<{
  courses: Course[];
  instructors: HomeInstructor[];
  enrollments: Enrollment[];
  enrollmentsUnauthorized: boolean;
}> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "") ||
    "http://localhost:5000";

  try {
    const [coursesResponse, enrollmentsResponse] = await Promise.all([
      fetch(`${baseUrl}/api/courses?limit=10`, {
        next: { revalidate: 300 },
      }),
      fetch(`${baseUrl}/api/courses/enrollments/mine`, {
        cache: "no-store",
        headers: accessToken
          ? {
            Authorization: `Bearer ${accessToken}`,
          }
          : undefined,
      }),
    ]);
    console.log("🚀 ~ getLandingPageData ~ enrollmentsResponse:", enrollmentsResponse)

    if (!coursesResponse.ok) {
      return {
        courses: fallbackCourses,
        instructors: fallbackInstructors,
        enrollments: fallbackEnrollments,
        enrollmentsUnauthorized: enrollmentsResponse.status === 401,
      };
    }

    const coursesData = (await coursesResponse.json()) as CoursesApiResponse;
    const apiCourses = Array.isArray(coursesData.courses) ? coursesData.courses : [];

    let enrollments: Enrollment[] = fallbackEnrollments;
    const enrollmentsUnauthorized = enrollmentsResponse.status === 401;

    if (enrollmentsResponse.ok) {
      const enrollmentsData = (await enrollmentsResponse.json()) as EnrollmentsApiResponse;
      enrollments = Array.isArray(enrollmentsData.enrollments)
        ? enrollmentsData.enrollments
        : [];
    }

    if (apiCourses.length === 0) {
      return {
        courses: fallbackCourses,
        instructors: fallbackInstructors,
        enrollments,
        enrollmentsUnauthorized,
      };
    }

    const instructors = buildInstructorsFromCourses(apiCourses).slice(0, 10);

    return {
      courses: apiCourses.slice(0, 10),
      instructors: instructors.length > 0 ? instructors : fallbackInstructors,
      enrollments,
      enrollmentsUnauthorized,
    };
  } catch {
    return {
      courses: fallbackCourses,
      instructors: fallbackInstructors,
      enrollments: fallbackEnrollments,
      enrollmentsUnauthorized: false,
    };
  }
}
