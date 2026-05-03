import type { Course } from "@/types/course";
import type { Instructor } from "@/types/user";
import type { PaginatedMeta } from "@/types/api";

interface CoursesPageData {
  courses: Course[];
  instructors: Instructor[];
  meta: PaginatedMeta;
}

const fallbackData: CoursesPageData = {
  courses: [],
  instructors: [],
  meta: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  },
};

export async function getCoursesPageData(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<CoursesPageData> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "") ||
    "http://localhost:5000";

  try {
    const query = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        query.set(key, String(value));
      }
    });

    const coursesUrl = `${baseUrl}/api/courses?${query.toString()}`;
    const instructorsUrl = `${baseUrl}/api/users/instructors`;

    const [coursesResponse, instructorsResponse] = await Promise.all([
      fetch(coursesUrl, { cache: "no-store" }),
      fetch(instructorsUrl, { next: { revalidate: 3600 } }), // Revalidate every hour
    ]);

    if (!coursesResponse.ok) {
      console.error(`Failed to fetch courses: ${coursesResponse.statusText}`);
      return {
        ...fallbackData,
        instructors: instructorsResponse.ok
          ? (await instructorsResponse.json()).instructors || []
          : [],
      };
    }

    if (!instructorsResponse.ok) {
      console.error(
        `Failed to fetch instructors: ${instructorsResponse.statusText}`,
      );
    }

    const coursesData = await coursesResponse.json();
    const instructorsData = instructorsResponse.ok
      ? await instructorsResponse.json()
      : { instructors: [] };

    return {
      courses: coursesData.courses || [],
      meta: coursesData.meta || fallbackData.meta,
      instructors: instructorsData.instructors || [],
    };
  } catch (error) {
    console.error("Failed to fetch courses page data:", error);
    return fallbackData;
  }
}
