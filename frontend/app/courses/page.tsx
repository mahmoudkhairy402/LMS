import {
  fetchPublicCourses,
  fetchInstructors,
} from "@/lib/apiService";
import CoursesPageClient from "@/components/courses/CoursesPageClient";
import { CourseFilterParams } from "@/types/course";

type CoursesPageProps = {
  searchParams: CourseFilterParams;
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const coursesData = await fetchPublicCourses(searchParams);
  const instructorsData = await fetchInstructors();

  const courses = coursesData?.courses ?? [];
  const meta = coursesData?.meta;
  const instructors = instructorsData?.instructors ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-size-[36px_36px]" />
      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-6 md:px-8">
        <CoursesPageClient
          courses={courses}
          instructors={instructors}
          meta={meta}
        />
      </main>
    </div>
  );
}
