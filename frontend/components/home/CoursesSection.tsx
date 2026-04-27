import Marquee from "@/components/home/Marquee";
import CourseCard from "@/components/home/CourseCard";
import SectionTitle from "@/components/home/SectionTitle";
import type { Course } from "@/types/course";

type CoursesSectionProps = {
  courses?: Course[];
};

export default function CoursesSection({
  courses = [],
}: CoursesSectionProps) {
  return (
    <section id="courses" className="mt-16 scroll-mt-28">
      <SectionTitle
        title="Professional Courses Built for Real Careers"
        subtitle="Project-based curriculum with assessments, milestones, and guided mentorship."
      />

      <Marquee reverse speed={30}>
        {courses.map((course) => (
          <CourseCard key={course._id || course.title} course={course} />
        ))}
      </Marquee>
    </section>
  );
}
