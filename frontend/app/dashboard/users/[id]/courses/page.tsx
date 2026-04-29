"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Users, Star } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getUserCourses, getUserById } from "@/store/thunks/userThunks";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import type { Course } from "@/types/course";

export default function UserCoursesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  
  const dispatch = useAppDispatch();
  const { selectedUser, selectedUserCourses, coursesMeta, status } = useAppSelector(
    (state) => state.userManagement
  );

  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!selectedUser || selectedUser._id !== userId && selectedUser.id !== userId) {
      dispatch(getUserById(userId));
    }
  }, [dispatch, userId, selectedUser]);

  useEffect(() => {
    dispatch(getUserCourses({ userId, page, limit: 10 }));
  }, [dispatch, userId, page]);

  const columns: Column<Course>[] = [
    {
      header: "Course Name",
      accessorKey: "title",
      cell: (course) => (
        <span className="font-bold text-surface-900 dark:text-white flex items-center space-x-3">
          <div className="w-10 h-10 bg-surface-200 dark:bg-surface-700 flex-shrink-0 flex items-center justify-center text-surface-500 font-bold overflow-hidden border border-surface-300 dark:border-surface-600">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="w-4 h-4" />
            )}
          </div>
          <span className="line-clamp-1">{course.title}</span>
        </span>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
    },
    {
      header: "Stats",
      accessorKey: "enrolledCount",
      cell: (course) => (
        <div className="flex items-center space-x-3 text-sm text-surface-600 dark:text-surface-400">
          <span className="flex items-center">
            <Users className="w-3 h-3 mr-1" />
            {course.enrolledCount || 0}
          </span>
          <span className="flex items-center text-yellow-500">
            <Star className="w-3 h-3 mr-1" />
            {course.averageRating ? course.averageRating.toFixed(1) : "New"}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "isPublished",
      cell: (course) => (
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-medium border uppercase tracking-wider ${
            course.isPublished
              ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400"
              : "bg-surface-500/10 text-surface-600 border-surface-500/20 dark:text-surface-400"
          }`}
        >
          {course.isPublished ? "Published" : "Draft"}
        </span>
      ),
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: (course) => (
        <span className="font-medium text-surface-900 dark:text-white">
          {course.price ? `$${course.price.toFixed(2)}` : "Free"}
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
            Created Courses
          </h1>
          <p className="text-surface-500 mt-1 line-clamp-1">
            {selectedUser ? `Viewing courses taught by ${selectedUser.name}` : "Loading user details..."}
          </p>
        </div>
      </div>

      <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6 shadow-sm">
        {selectedUserCourses.length === 0 && status !== "loading" ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-surface-400 mx-auto mb-4" />
            <p className="text-lg font-bold text-surface-900 dark:text-white">No courses found</p>
            <p className="text-surface-500">This instructor has not created any courses yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <DataTable
              columns={columns}
              data={selectedUserCourses}
              keyExtractor={(c) => c._id}
              isLoading={status === "loading"}
              onRowClick={(course) => window.open(`/courses/${course._id}`, "_blank")}
            />
            
            {coursesMeta && coursesMeta.totalPages > 1 && (
              <Pagination
                currentPage={coursesMeta.page}
                totalPages={coursesMeta.totalPages}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
