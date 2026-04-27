import Link from "next/link";
import type { Course } from "@/types/course";

type CourseCardProps = {
  course: Course;
};

export default function CourseCard({ course }: CourseCardProps) {
  const courseId = course._id;
  const durationHours = Math.max(
    1,
    Math.round((course.totalDurationMinutes || 0) / 60)
  );
  const lessonsCount = Math.max(12, Math.round(durationHours * 4));
  const rating = Number(course.ratingsAverage || 0).toFixed(1);

  return (
    <article className="w-84 overflow-hidden border-2 border-primary-500/35 bg-surface p-0">
      <div
        className="h-44 border-b-2 border-border bg-cover bg-center"
        style={{
          backgroundImage: course.thumbnail
            ? `url('${course.thumbnail}')`
            : "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(245,158,11,0.15))",
        }}
      />

      <div className="p-5">
        <div className="mb-3 inline-flex border border-primary-500/50 bg-primary-500/10 px-2 py-1 text-xs font-semibold text-primary-300">
          {course.level}
        </div>

        <h3 className="text-xl font-extrabold text-foreground">{course.title}</h3>

        {course.shortDescription ? (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {course.shortDescription}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {course.category ? (
            <span className="border border-border px-2 py-1">{course.category}</span>
          ) : null}
          {course.language ? (
            <span className="border border-border px-2 py-1">{course.language}</span>
          ) : null}
          {typeof course.enrolledCount === "number" ? (
            <span className="border border-border px-2 py-1">{course.enrolledCount} learners</span>
          ) : null}
        </div>

        <div className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            {course.instructor.avatar ? (
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name || "Instructor"}
                className="h-10 w-10 rounded-full border-2 border-primary-500/60 object-cover"
              />
            ) : (
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary-500/60 bg-primary-500/20 font-bold text-primary-200">
                {(course.instructor.name || "P").charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-secondary-300">Instructor</p>
              <p className="truncate font-semibold text-foreground">
                {course.instructor.name || "Professional Instructor"}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 text-xs sm:text-sm">
            <span>{durationHours} hours</span>
            <span>{lessonsCount} lessons</span>
            <span className="font-bold text-secondary-300">{rating} / 5</span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="font-semibold text-primary-200">
              {typeof course.price === "number" && course.price > 0
                ? `$${course.price}`
                : "Free"}
            </span>

            <Link
              href={`/courses/${courseId}`}
              className="border-2 border-primary-500 px-3 py-2 text-xs font-bold text-primary-100 transition hover:bg-primary-500 hover:text-white"
            >
              Know More
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
