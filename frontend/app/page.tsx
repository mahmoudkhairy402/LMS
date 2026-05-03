import { cookies } from "next/headers";
import Link from "next/link";
import HeroSection from "@/components/home/HeroSection";
import InstructorsSection from "@/components/home/InstructorsSection";
import CoursesSection from "@/components/home/CoursesSection";
import ExperienceSection from "@/components/home/ExperienceSection";
import YourCoursesSection from "@/components/home/YourCoursesSection";
import {
  fetchPublicCourses,
  fetchInstructors,
  fetchMyEnrollments,
} from "@/lib/apiService";

export default async function Home() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const coursesData = await fetchPublicCourses({ limit: "6" });
  const instructorsData = await fetchInstructors();
  const enrollmentsData = await fetchMyEnrollments(accessToken||"");

  const courses = coursesData?.courses ?? [];
  const instructors = instructorsData?.instructors ?? [];
  const enrollments = enrollmentsData?.enrollments ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-size-[36px_36px]" />

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-6 md:px-8">
       
        <HeroSection />
        {/* <YourCoursesSection
          enrollments={enrollments}
        /> */}
        <InstructorsSection instructors={instructors} />
        <CoursesSection courses={courses} />
        <ExperienceSection />
      </main>
    </div>
  );
}
