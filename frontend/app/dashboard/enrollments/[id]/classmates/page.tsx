"use client";

import { useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getClassmates, getCourseById } from "@/store/thunks/courseThunks";

export default function ClassmatesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  
  const dispatch = useAppDispatch();
  const { classmates, selectedCourse, status } = useAppSelector((state) => state.courses);

  useEffect(() => {
    dispatch(getCourseById(courseId));
    dispatch(getClassmates(courseId));
  }, [dispatch, courseId]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link
            href={`/dashboard/enrollments/${courseId}`}
            className="p-2 border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Classmates</h1>
            <p className="text-surface-500 mt-1 line-clamp-1">
              {selectedCourse?.title ? `People enrolled in ${selectedCourse.title}` : "Loading course..."}
            </p>
          </div>
        </div>
      </div>

      {status === "loading" && classmates.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 h-24 rounded-none" />
          ))}
        </div>
      ) : classmates.length === 0 ? (
        <div className="text-center py-20 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
          <Users className="w-12 h-12 text-surface-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">No classmates yet</h3>
          <p className="text-surface-500 max-w-md mx-auto">
            You are the first to enroll in this course. Or privacy settings prevent others from being shown.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {classmates.map((student) => (
            <div
              key={student.id}
              className="flex items-center space-x-4 p-4 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 hover:border-primary-500/30 transition-colors"
            >
              <div className="w-12 h-12 bg-surface-200 dark:bg-surface-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
                {student.avatar ? (
                  <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-surface-500 font-bold text-lg">{student.name.charAt(0)}</span>
                )}
              </div>
              <div>
                <p className="font-bold text-surface-900 dark:text-white line-clamp-1">{student.name}</p>
                <p className="text-xs text-surface-500">Student</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
