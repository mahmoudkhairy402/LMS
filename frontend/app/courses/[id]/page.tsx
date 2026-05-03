import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, BookOpen, Clock3, Star, Users } from "lucide-react";
import { cookies } from "next/headers";
import {
  checkCourseEnrollment,
  fetchCourseById,
  fetchCourseMetadataById,
} from "@/lib/apiService";

function formatPrice(price?: number) {
  if (typeof price !== "number") return "Free";
  return price === 0 ? "Free" : `$${price.toFixed(2)}`;
}

function formatDuration(minutes?: number) {
  if (!minutes) return "Self-paced";
  if (minutes < 60) return `${minutes} mins`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export default async function CourseDetailsPage(props: {
  params: { id: string };
}) {
  const params = await props.params;
  const { id } = params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value ?? "";

  const enrollmentState = accessToken
    ? await checkCourseEnrollment(id, accessToken)
    : { isEnrolled: false, canViewFullCourse: false };

  const course = enrollmentState.canViewFullCourse
    ? await fetchCourseById(id, accessToken)
    : await fetchCourseMetadataById(id);


  try {
    if (!course) {
      notFound();
    }

    return (
      <main className="min-h-screen bg-background px-6 py-8 text-foreground md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 border-2 border-border bg-surface/90 p-4 shadow-(--shadow-soft)">
          
              
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-2 border-2 border-border px-4 py-2 text-sm font-bold uppercase tracking-wide text-foreground transition hover:border-primary-500/70"
              >
                <ArrowLeft className="h-4 w-4" />
                Back home
              </Link>

              <div className="flex items-center gap-3">
                <Link
                  href={`/courses/${id}/enroll`}
                  className="inline-flex items-center justify-center border-2 border-border px-4 py-2 text-sm font-bold uppercase tracking-wide text-foreground transition hover:border-primary-500/70"
                >
                  Explore enrollment
                </Link>
                <Link
                  href={`/courses/${id}/enroll`}
                  className="inline-flex items-center justify-center border-2 border-primary-500 bg-primary-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-primary-600"
                >
                  Enroll Now
                </Link>
              </div>
            </div>

             
          
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <section className="overflow-hidden border-2 border-border bg-surface/90 shadow-(--shadow-soft)">
              {!enrollmentState.canViewFullCourse ? (
                <div className="border-b-2 border-border bg-primary-500/10 p-4">
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-primary-200">
                    Preview mode
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You are viewing a public preview. Enroll to unlock sections and lessons.
                  </p>
                </div>
              ) : null}

              <div className="relative aspect-16/8 border-b-2 border-border bg-surface-raised">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,rgba(124,58,237,0.2),rgba(245,158,11,0.12))]">
                    <BookOpen className="h-16 w-16 text-primary-200" />
                  </div>
                )}

                <div className="absolute left-5 top-5 border-2 border-border bg-surface/90 px-4 py-1.5 text-xs font-black uppercase tracking-[0.24em] text-foreground">
                  {course.level || "all levels"}
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <span className="border border-border px-3 py-1">
                    {course.category || "General"}
                  </span>
                  <span className="border border-border px-3 py-1">
                    {course.language || "English"}
                  </span>
                  <span className="border border-border px-3 py-1">
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <h1 className="mt-5 text-3xl font-black uppercase tracking-wide md:text-5xl">
                  {course.title}
                </h1>

                <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
                  {course.shortDescription || course.description || "No description available."}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="border-2 border-border bg-surface-raised p-4">
                    <Clock3 className="h-5 w-5 text-primary-300" />
                    <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">Duration</p>
                    <p className="mt-1 text-lg font-black text-foreground">{formatDuration(course.totalDurationMinutes)}</p>
                  </div>

                  <div className="border-2 border-border bg-surface-raised p-4">
                    <Star className="h-5 w-5 text-primary-300" />
                    <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">Rating</p>
                    <p className="mt-1 text-lg font-black text-foreground">
                      {course.ratingsAverage ? `${course.ratingsAverage.toFixed(1)} / 5` : "No ratings yet"}
                    </p>
                  </div>

                  <div className="border-2 border-border bg-surface-raised p-4">
                    <Users className="h-5 w-5 text-primary-300" />
                    <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">Enrolled</p>
                    <p className="mt-1 text-lg font-black text-foreground">{course.enrolledCount ?? 0}</p>
                  </div>

                  <div className="border-2 border-border bg-surface-raised p-4">
                    <BadgeCheck className="h-5 w-5 text-primary-300" />
                    <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">Price</p>
                    <p className="mt-1 text-lg font-black text-foreground">{formatPrice(course.price)}</p>
                  </div>
                </div>

                {course.tags?.length ? (
                  <div className="mt-8 flex flex-wrap gap-2">
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border-2 border-border bg-surface-raised px-3 py-1.5 text-xs font-semibold text-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {/* Curriculum Section */}
                {enrollmentState.canViewFullCourse && course.sections && course.sections.length > 0 && (
                  <div className="mt-12">
                    <h2 className="text-2xl font-black uppercase tracking-wide mb-6 border-b-2 border-border pb-2">
                      Course Curriculum
                    </h2>
                    <div className="space-y-4">
                      {course.sections.map((section, idx) => (
                        <div key={section._id} className="border-2 border-border bg-surface-raised">
                          <div className="p-4 border-b-2 border-border bg-surface/50 font-bold uppercase tracking-wide">
                            Section {idx + 1}: {section.title}
                          </div>
                          <div className="divide-y divide-border/50">
                            {section.lessons?.map((lesson, lessonIdx) => (
                              <div key={lesson._id} className="p-4 flex items-center justify-between group hover:bg-surface/30 transition-colors">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-bold text-muted-foreground w-6 text-right">
                                    {lessonIdx + 1}.
                                  </span>
                                  <span className={`font-medium ${lesson.isPreview ? "text-primary-400 font-bold" : "text-foreground"}`}>
                                    {lesson.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                  {lesson.isPreview && (
                                    <span className="bg-primary-500/20 text-primary-400 px-2 py-1 border border-primary-500/30">
                                      Preview
                                    </span>
                                  )}
                                  <span className="w-16 text-right">{lesson.durationMinutes || 0} min</span>
                                </div>
                              </div>
                            ))}
                            {(!section.lessons || section.lessons.length === 0) && (
                              <div className="p-4 text-sm text-muted-foreground italic">
                                No lessons added to this section yet.
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-6">
              <div className="border-2 border-border bg-surface/90 p-6 shadow-(--shadow-soft)">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-primary-200">Instructor</p>
                <div className="mt-4 flex items-center gap-4">
                  {course.instructor?.avatar ? (
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="h-16 w-16 border-2 border-primary-500/70 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center border-2 border-primary-500/70 bg-primary-500/15 text-xl font-black text-primary-200">
                      {(course.instructor?.name || "I").charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <p className="text-xl font-black text-foreground">
                      {course.instructor?.name || "Instructor not assigned"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {course.instructor?.email || course.instructor?.role || "Course mentor"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-border bg-surface/90 p-6 shadow-(--shadow-soft)">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-primary-200">Course Data</p>
                <dl className="mt-5 space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                    <dt className="text-muted-foreground">Course ID</dt>
                    <dd className="font-semibold text-foreground">{course._id}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                    <dt className="text-muted-foreground">Slug</dt>
                    <dd className="font-semibold text-foreground">{course.slug || "--"}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="font-semibold text-foreground">{course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "--"}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Updated</dt>
                    <dd className="font-semibold text-foreground">{course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : "--"}</dd>
                  </div>
                </dl>
              </div>

              {!enrollmentState.canViewFullCourse ? (
                <div className="border-2 border-primary-500 bg-primary-500/10 p-6 shadow-(--shadow-soft)">
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-primary-200">Unlock course</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Enroll to access the full curriculum, lessons, and progress tracking.
                  </p>
                  <Link
                    href={`/courses/${id}/enroll`}
                    className="mt-5 inline-flex w-full items-center justify-center border-2 border-primary-500 bg-primary-500 px-4 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-primary-600"
                  >
                    Go to enrollment page
                  </Link>
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </main>
    );
  } catch {
    notFound();
  }
}