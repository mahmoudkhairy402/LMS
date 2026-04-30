"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getUserEnrollments, getUserById } from "@/store/thunks/userThunks";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import type { Enrollment } from "@/types/course";

export default function UserEnrollmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;

  const dispatch = useAppDispatch();
  const { selectedUser, selectedUserEnrollments, selectedUserEnrollmentsMeta, status } = useAppSelector(
    (state) => state.userManagement
  );

  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!selectedUser || selectedUser._id !== userId && selectedUser.id !== userId) {
      dispatch(getUserById(userId));
    }
  }, [dispatch, userId, selectedUser]);

  useEffect(() => {
    dispatch(getUserEnrollments({ userId, page, limit: 10 }));
  }, [dispatch, userId, page]);

  const columns: Column<Enrollment>[] = [
    {
      header: "Course Name",
      accessorKey: "course",
      cell: (enrollment: any) => (
        <span className="font-bold text-surface-900 dark:text-white">
          {enrollment.course?.title || "Unknown Course"}
        </span>
      ),
    },
    {
      header: "Progress",
      accessorKey: "progressPercent",
      cell: (enrollment) => (
        <div className="w-full max-w-[150px]">
          <div className="flex justify-between text-xs mb-1">
            <span className={enrollment.progressPercent === 100 ? "text-green-500" : "text-primary-500"}>
              {enrollment.progressPercent || 0}%
            </span>
          </div>
          <div className="w-full bg-surface-200 dark:bg-surface-700 h-2 rounded-none overflow-hidden border border-surface-300 dark:border-surface-600">
            <div
              className={`h-full transition-all duration-300 ${enrollment.progressPercent === 100 ? "bg-green-500" : "bg-primary-500"}`}
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
          className={`inline-flex items-center px-2 py-1 text-xs font-medium border uppercase tracking-wider ${enrollment.status === "completed" || enrollment.progressPercent === 100
              ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400"
              : "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400"
            }`}
        >
          {enrollment.status === "completed" || enrollment.progressPercent === 100 ? "Completed" : "Active"}
        </span>
      ),
    },
    {
      header: "Enrolled At",
      accessorKey: "enrolledAt",
      cell: (enrollment) => (
        <span className="text-surface-600 dark:text-surface-400">
          {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : "N/A"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-4">
        <Link
          href={`/dashboard/users/${userId}`}
          className="p-2 border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Course Enrollments
          </h1>
          <p className="text-surface-500 mt-1 line-clamp-1">
            {selectedUser ? `Viewing enrollments for ${selectedUser.name}` : "Loading user details..."}
          </p>
        </div>
      </div>

      <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6 shadow-sm">
        {selectedUserEnrollments.length === 0 && status !== "loading" ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-surface-400 mx-auto mb-4" />
            <p className="text-lg font-bold text-surface-900 dark:text-white">No enrollments</p>
            <p className="text-surface-500">This user is not enrolled in any courses.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <DataTable
              columns={columns}
              data={selectedUserEnrollments}
              keyExtractor={(e) => e._id}
              isLoading={status === "loading"}
            />

            {selectedUserEnrollmentsMeta && selectedUserEnrollmentsMeta.totalPages > 1 && (
              <Pagination
                currentPage={selectedUserEnrollmentsMeta.page}
                totalPages={selectedUserEnrollmentsMeta.totalPages}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
