"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getInstructorStudents } from "@/store/thunks/courseThunks";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import type { InstructorStudent } from "@/types/course";

export default function MyStudentsPage() {
  const dispatch = useAppDispatch();
  const { instructorStudents, instructorStudentsMeta, status } = useAppSelector((state) => state.courses);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [enrollmentStatus, setEnrollmentStatus] = useState("");

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch data when filters change
  useEffect(() => {
    dispatch(
      getInstructorStudents({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        enrollmentStatus: enrollmentStatus || undefined,
      })
    );
  }, [dispatch, page, debouncedSearch, enrollmentStatus]);

  const columns: Column<InstructorStudent>[] = [
    {
      header: "Student",
      accessorKey: "name",
      cell: (student) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-surface-200 dark:bg-surface-700 flex-shrink-0 overflow-hidden rounded-none flex items-center justify-center text-surface-500 font-bold">
            {student.avatar ? (
              <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              student.name.charAt(0)
            )}
          </div>
          <div>
            <p className="font-bold text-surface-900 dark:text-white">{student.name}</p>
            <p className="text-xs text-surface-500">{student.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Course",
      accessorKey: "courseName",
      cell: (student) => (
        <span className="font-medium text-surface-700 dark:text-surface-300">
          {student.courseName || "Unknown Course"}
        </span>
      ),
    },
    {
      header: "Progress",
      accessorKey: "progressPercent",
      cell: (student) => (
        <div className="w-full max-w-[150px]">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-surface-700 dark:text-surface-300">{student.progressPercent || 0}%</span>
          </div>
          <div className="w-full bg-surface-200 dark:bg-surface-700 h-2 rounded-none overflow-hidden border border-surface-300 dark:border-surface-600">
            <div
              className="bg-primary-500 h-full transition-all duration-300"
              style={{ width: `${student.progressPercent || 0}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "enrollmentStatus",
      cell: (student) => (
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-medium border ${student.enrollmentStatus === "completed"
            ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400"
            : "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400"
            }`}
        >
          {student.enrollmentStatus === "completed" ? "Completed" : "Active"}
        </span>
      ),
    },
    {
      header: "Last Accessed",
      accessorKey: "lastAccessedAt",
      cell: (student) => (
        <span className="text-surface-600 dark:text-surface-400">
          {student.lastAccessedAt ? new Date(student.lastAccessedAt).toLocaleDateString() : "Never"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">All Students</h1>
        <p className="text-surface-500 mt-1">Overview of all students enrolled across your courses.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-surface-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-surface-300 dark:border-surface-700  dark:bg-background text-surface-900 dark:text-white focus:ring-2  transition-colors rounded-none placeholder-surface-400"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex w-full sm:w-auto gap-4 dark:bg-background">
          <select
            value={enrollmentStatus}
            onChange={(e) => {
              setEnrollmentStatus(e.target.value);
              setPage(1);
            }}
            className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border border-surface-300 dark:border-surface-700 dark:bg-background text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={instructorStudents}
        keyExtractor={(student) => student.id}
        isLoading={status === "loading"}
      />

      <Pagination
        currentPage={instructorStudentsMeta.page}
        totalPages={instructorStudentsMeta.totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
