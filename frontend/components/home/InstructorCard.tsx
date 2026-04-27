import type { HomeInstructor } from "@/types/home";

type InstructorCardProps = {
  instructor: HomeInstructor;
};

export default function InstructorCard({ instructor }: InstructorCardProps) {
  return (
    <article className="w-80 border-2 border-border bg-surface-raised p-5">
      <div className="flex items-center gap-4">
        {instructor.avatar ? (
          <img
            src={instructor.avatar}
            alt={instructor.name}
            className="h-14 w-14 rounded-full border-2 border-primary-500/70 object-cover"
          />
        ) : (
          <div className="inline-flex h-14 w-14 items-center justify-center border-2 border-primary-500/70 bg-primary-500/15 text-lg font-black text-primary-200">
            {instructor.name.charAt(0)}
          </div>
        )}

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-secondary-300">
            {instructor.learners}
          </p>
          <h3 className="mt-1 text-xl font-bold text-primary-200">{instructor.name}</h3>
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold text-foreground">{instructor.role}</p>
      <p className="mt-3 text-sm text-muted-foreground">{instructor.specialty}</p>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
        <span>{instructor.email || "Verified mentor"}</span>
        <span>{instructor.courseCount || 1} courses</span>
      </div>
    </article>
  );
}
