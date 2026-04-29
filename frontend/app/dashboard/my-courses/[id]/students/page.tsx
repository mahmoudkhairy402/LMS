"use client";

import { useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCourseEnrollments, getCourseById } from "@/store/thunks/courseThunks";
import { clearSelectedCourse } from "@/store/slices/courseSlice";
import { DataTable, type Column } from "@/components/ui/DataTable";
import type { Enrollment } from "@/types/course";

export default function CourseStudentsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const dispatch = useAppDispatch();
  const { selectedCourse, courseEnrollments, status } = useAppSelector((state) => state.courses);

  useEffect(() => {
    dispatch(getCourseById(courseId));
    dispatch(getCourseEnrollments(courseId));

    return () => {
      import("@/store/slices/courseSlice").then(({ clearSelectedCourse: clearAction }) => {
        dispatch(clearAction());
      });
    };
  }, [dispatch, courseId]);

  const columns: Column<Enrollment>[] = [
    {
      header: "Student",
      accessorKey: "student",
      cell: (enrollment: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-surface-200 dark:bg-surface-700 flex-shrink-0 overflow-hidden rounded-none flex items-center justify-center text-surface-500 font-bold">
            {enrollment.student?.name?.charAt(0) || "U"}
          </div>
          <div>
            <p className="font-bold text-surface-900 dark:text-white">{enrollment.student?.name || "Unknown Student"}</p>
            <p className="text-xs text-surface-500">{enrollment.student?.email || ""}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Progress",
      accessorKey: "progressPercent",
      cell: (enrollment) => (
        <div className="w-full max-w-[200px]">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-surface-700 dark:text-surface-300">{enrollment.progressPercent || 0}%</span>
          </div>
          <div className="w-full bg-surface-200 dark:bg-surface-700 h-2 rounded-none overflow-hidden border border-surface-300 dark:border-surface-600">
            <div
              className="bg-primary-500 h-full transition-all duration-300"
              style={{ width: `${enrollment.progressPercent || 0}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (enrollment) => (
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-medium border ${enrollment.status === "completed"
              ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400"
              : "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400"
            }`}
        >
          {enrollment.status === "completed" ? "Completed" : "Active"}
        </span>
      ),
    },
    {
      header: "Enrolled At",
      accessorKey: "enrolledAt",
      cell: (enrollment) => (
        <span className="text-surface-600 dark:text-surface-400">
          {new Date(enrollment.createdAt || enrollment.enrolledAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/my-courses"
          className="p-2 border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Course Students</h1>
          <p className="text-surface-500 mt-1">
            {selectedCourse?.title ? `Students enrolled in ${selectedCourse.title}` : "Loading course details..."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6">
          <p className="text-sm text-surface-500 font-medium">Total Students</p>
          <p className="text-3xl font-bold text-surface-900 dark:text-white mt-2">{courseEnrollments.length}</p>
        </div>
        <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6">
          <p className="text-sm text-surface-500 font-medium">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {courseEnrollments.filter((e) => e.status === "completed").length}
          </p>
        </div>
        <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6">
          <p className="text-sm text-surface-500 font-medium">Average Progress</p>
          <p className="text-3xl font-bold text-primary-500 mt-2">
            {courseEnrollments.length > 0
              ? Math.round(
                courseEnrollments.reduce((acc, e) => acc + (e.progressPercent || 0), 0) / courseEnrollments.length
              )
              : 0}%
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={courseEnrollments}
        keyExtractor={(enrollment) => enrollment._id}
        isLoading={status === "loading" && courseEnrollments.length === 0}
      />
    </div>
  );
}
