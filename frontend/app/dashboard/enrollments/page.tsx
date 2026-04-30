"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BookOpen, PlayCircle, Award, Clock } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getMyEnrollments } from "@/store/thunks/courseThunks";

export default function MyEnrollmentsPage() {
  const dispatch = useAppDispatch();
  const { myEnrollments, status } = useAppSelector((state) => state.courses);

  useEffect(() => {
    dispatch(getMyEnrollments());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">My Enrollments</h1>
        <p className="text-surface-500 mt-1">Jump back into your courses and continue learning.</p>
      </div>

      {status === "loading" && myEnrollments.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 h-80 rounded-none" />
          ))}
        </div>
      ) : myEnrollments.length === 0 ? (
        <div className="text-center py-20 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
          <BookOpen className="w-12 h-12 text-surface-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">No courses yet</h3>
          <p className="text-surface-500 mb-6 max-w-md mx-auto">
            You haven't enrolled in any courses. Explore our catalog and start your learning journey today.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors border border-primary-600 shadow-sm"
          >
            Explore Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myEnrollments.map((enrollment) => {
            const course = enrollment.course;
            const isCompleted = enrollment.status === "completed" || enrollment.progressPercent === 100;

            return (
              <div
                key={enrollment._id}
                className="group flex flex-col bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 hover:border-primary-500/50 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-surface-200 dark:bg-surface-800 overflow-hidden border-b border-surface-200 dark:border-surface-700">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-surface-400" />
                    </div>
                  )}
                  {isCompleted && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 uppercase tracking-wider flex items-center gap-1 shadow-sm border border-green-600">
                      <Award className="w-3 h-3" />
                      Completed
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col grow">
                  <div className="flex items-center gap-2 text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
                    <span>{course.category || "General"}</span>
                  </div>

                  <h3 className="text-lg font-bold text-surface-900 dark:text-white line-clamp-2 mb-2 group-hover:text-primary-500 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-sm text-surface-500 line-clamp-2 mb-4 grow">
                    {course.shortDescription || course.description}
                  </p>

                  <div className="mt-auto space-y-4">
                    {/* Progress Bar */}
                    <div className="w-full">
                      <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span className={isCompleted ? "text-green-500" : "text-primary-500"}>
                          {enrollment.progressPercent || 0}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-surface-200 dark:bg-surface-800 h-2 border border-surface-300 dark:border-surface-700">
                        <div
                          className={`h-full transition-all duration-500 ${isCompleted ? "bg-green-500" : "bg-primary-500"}`}
                          style={{ width: `${enrollment.progressPercent || 0}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/enrollments/${course._id}`}
                      className={`w-full flex items-center justify-center gap-2 py-2 px-4 font-medium transition-colors border shadow-sm ${
                        isCompleted
                          ? "bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-900 dark:text-white border-surface-300 dark:border-surface-600"
                          : "bg-primary-500 hover:bg-primary-600 text-white border-primary-600"
                      }`}
                    >
                      <PlayCircle className="w-4 h-4" />
                      {isCompleted ? "Review Course" : "Continue Learning"}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
