import Marquee from "@/components/home/Marquee";
import InstructorCard from "@/components/home/InstructorCard";
import SectionTitle from "@/components/home/SectionTitle";
import type { HomeInstructor } from "@/types/home";

type InstructorsSectionProps = {
  instructors?: HomeInstructor[];
};

const fallbackInstructors: HomeInstructor[] = [];

export default function InstructorsSection({
  instructors = fallbackInstructors,
}: InstructorsSectionProps) {
  return (
    <section id="instructors" className="mt-16 scroll-mt-28">
      <SectionTitle
        title="Meet Our Professional Instructors"
        subtitle="Experienced mentors from real product teams and enterprise environments."
      />

      <Marquee speed={26}>
        {instructors.map((instructor) => (
          <InstructorCard key={instructor._id || instructor.name} instructor={instructor} />
        ))}
      </Marquee>
    </section>
  );
}
