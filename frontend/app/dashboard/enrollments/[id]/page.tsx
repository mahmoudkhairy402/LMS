"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, PlayCircle, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCourseById, getMyEnrollments, updateMyProgress } from "@/store/thunks/courseThunks";
import { clearSelectedCourse } from "@/store/slices/courseSlice";
import type { Lesson } from "@/types/course";

export default function CoursePlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { selectedCourse, myEnrollments, status } = useAppSelector((state) => state.courses);

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);

  // Load course details
  useEffect(() => {
    dispatch(getCourseById(courseId));
    dispatch(getMyEnrollments()); // Ensure we have the user's progress

    return () => {
      import("@/store/slices/courseSlice").then(({ clearSelectedCourse: clearAction }) => {
        dispatch(clearAction());
      });
    };
  }, [dispatch, courseId]);

  // Find current enrollment to get progress
  const enrollment = myEnrollments.find((e) => e.course._id === courseId || (e.course as any) === courseId);

  // Initialize progress and active lesson
  useEffect(() => {
    if (enrollment && enrollment.completedLessonIds) {
      setCompletedLessonIds(new Set(enrollment.completedLessonIds));
    }

    // Auto-select first lesson if none is selected and course is loaded
    if (!activeLesson && selectedCourse?.sections && selectedCourse.sections.length > 0) {
      // Try to find the first incomplete lesson
      let firstIncomplete: Lesson | null = null;
      let firstLesson: Lesson | null = null;

      for (const section of selectedCourse.sections) {
        if (!section.lessons) continue;
        for (const lesson of section.lessons) {
          if (!firstLesson) firstLesson = lesson;
          if (!enrollment?.completedLessonIds?.includes(lesson._id)) {
            firstIncomplete = lesson;
            break;
          }
        }
        if (firstIncomplete) break;
      }

      setActiveLesson(firstIncomplete || firstLesson);
    }
  }, [enrollment, selectedCourse, activeLesson]);

  const handleLessonSelect = (lesson: Lesson) => {
    setActiveLesson(lesson);
  };

  const handleMarkComplete = async () => {
    if (!activeLesson || !selectedCourse || isUpdating) return;

    setIsUpdating(true);
    const newCompletedIds = new Set(completedLessonIds);
    newCompletedIds.add(activeLesson._id);
    setCompletedLessonIds(newCompletedIds);

    // Calculate new progress percent
    let totalLessons = 0;
    selectedCourse.sections?.forEach((s) => {
      totalLessons += s.lessons?.length || 0;
    });

    const progressPercent = totalLessons === 0 ? 100 : Math.round((newCompletedIds.size / totalLessons) * 100);

    try {
      await dispatch(
        updateMyProgress({
          courseId,
          completedLessonIds: Array.from(newCompletedIds),
          progressPercent,
        })
      ).unwrap();

      toast.success("Progress saved!");

      // Auto-advance to next lesson
      let foundCurrent = false;
      let nextLesson: Lesson | null = null;

      for (const section of selectedCourse.sections || []) {
        if (!section.lessons) continue;
        for (const lesson of section.lessons) {
          if (foundCurrent) {
            nextLesson = lesson;
            break;
          }
          if (lesson._id === activeLesson._id) {
            foundCurrent = true;
          }
        }
        if (nextLesson) break;
      }

      if (nextLesson) {
        setActiveLesson(nextLesson);
      }
    } catch (error: any) {
      toast.error(error || "Failed to save progress");
      // Revert optimism
      const reverted = new Set(completedLessonIds);
      reverted.delete(activeLesson._id);
      setCompletedLessonIds(reverted);
    } finally {
      setIsUpdating(false);
    }
  };

  if (status === "loading" && !selectedCourse) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-pulse flex space-x-2">
          <div className="w-4 h-4 bg-primary-500 rounded-full" />
          <div className="w-4 h-4 bg-primary-500 rounded-full delay-75" />
          <div className="w-4 h-4 bg-primary-500 rounded-full delay-150" />
        </div>
      </div>
    );
  }

  if (!selectedCourse) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Failed to load course player.</p>
        <Link href="/dashboard/enrollments" className="text-primary-500 hover:underline">
          Return to My Enrollments
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] -m-4 md:-m-8 flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-grow flex flex-col h-full md:overflow-y-auto border-r border-border">
        {/* Top bar */}
        <div className="h-14 border-b border-border bg-surface/90 flex items-center px-4 justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/enrollments"
              className="p-1.5 text-surface-500 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-bold text-foreground line-clamp-1">
              {selectedCourse.title}
            </h1>
          </div>
          <Link
            href={`/dashboard/enrollments/${courseId}/classmates`}
            className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors hidden sm:block"
          >
            View Classmates
          </Link>
        </div>

        {/* Video Player / Content Placeholder */}
        <div className="bg-black aspect-video w-full relative flex items-center justify-center flex-shrink-0">
          {activeLesson ? (
            <div className="text-center">
              <PlayCircle className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <p className="text-white/70 font-medium">Video Player Placeholder</p>
              <p className="text-white/40 text-sm mt-2">{activeLesson.title}</p>
            </div>
          ) : (
            <p className="text-white/50">Select a lesson to begin</p>
          )}
        </div>

        {/* Lesson Info */}
        <div className="p-6 md:p-8 flex-grow">
          {activeLesson && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-wide text-foreground">
                    {activeLesson.title}
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground font-medium uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      {activeLesson.type === "video" ? <PlayCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      {activeLesson.type}
                    </span>
                    <span>{activeLesson.durationMinutes || 0} min</span>
                  </div>
                </div>

                <button
                  onClick={handleMarkComplete}
                  disabled={completedLessonIds.has(activeLesson._id) || isUpdating}
                  className={`inline-flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-wider transition-all border-2 flex-shrink-0 ${completedLessonIds.has(activeLesson._id)
                    ? "bg-green-500/10 text-green-500 border-green-500 cursor-default"
                    : "bg-primary-500 text-white border-primary-500 hover:bg-primary-600 hover:border-primary-600 shadow-[4px_4px_0px_0px_rgba(var(--primary-600))] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(var(--primary-600))]"
                    }`}
                >
                  {completedLessonIds.has(activeLesson._id) ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Completed
                    </>
                  ) : isUpdating ? (
                    "Saving..."
                  ) : (
                    "Mark Complete"
                  )}
                </button>
              </div>

              <div className="prose prose-invert max-w-none text-muted-foreground border-t border-border pt-6 mt-6">
                <p>
                  {activeLesson.content || "No detailed content provided for this lesson."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Curriculum Sidebar */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col h-full flex-shrink-0 bg-surface border-l border-border md:overflow-y-auto">
        <div className="p-4 border-b border-border bg-surface/90 sticky top-0 z-10">
          <h3 className="font-black uppercase tracking-wide text-foreground mb-2">Course Content</h3>
          {enrollment && (
            <div className="w-full">
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-primary-500">{enrollment.progressPercent || 0}% Complete</span>
              </div>
              <div className="w-full bg-surface-raised h-2 border border-border">
                <div
                  className="h-full transition-all duration-500 bg-primary-500"
                  style={{ width: `${enrollment.progressPercent || 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-grow">
          {selectedCourse.sections?.map((section, idx) => (
            <div key={section._id} className="border-b border-border">
              <div className="p-4 bg-surface-raised font-bold uppercase tracking-wide text-sm flex justify-between items-center">
                <span>Section {idx + 1}: {section.title}</span>
              </div>
              <div className="divide-y divide-border/50">
                {section.lessons?.map((lesson, lessonIdx) => {
                  const isCompleted = completedLessonIds.has(lesson._id);
                  const isActive = activeLesson?._id === lesson._id;

                  return (
                    <button
                      key={lesson._id}
                      onClick={() => handleLessonSelect(lesson)}
                      className={`w-full text-left p-4 flex items-start gap-3 transition-colors ${isActive
                        ? "bg-primary-500/10 border-l-4 border-l-primary-500 pl-3"
                        : "hover:bg-surface/50 border-l-4 border-l-transparent pl-3"
                        }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className={`font-medium text-sm ${isActive ? "text-primary-500" : "text-foreground"}`}>
                          {lessonIdx + 1}. {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {lesson.type === "video" ? <PlayCircle className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                          <span>{lesson.durationMinutes || 0} min</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
