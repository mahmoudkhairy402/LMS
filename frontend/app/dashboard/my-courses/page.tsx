"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Edit, Users, Trash2, Globe, Lock } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getMyCourses, publishCourse, unpublishCourse, deleteCourse } from "@/store/thunks/courseThunks";
import { DataTable, type Column } from "@/components/ui/DataTable";
import type { Course } from "@/types/course";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";

export default function MyCoursesPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { myCourses, status } = useAppSelector((state) => state.courses);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getMyCourses());
  }, [dispatch]);

  const handleTogglePublish = async (course: Course) => {
    try {
      if (course.isPublished) {
        await dispatch(unpublishCourse(course._id)).unwrap();
        toast.success("Course unpublished successfully");
      } else {
        await dispatch(publishCourse(course._id)).unwrap();
        toast.success("Course published successfully");
      }
    } catch (error: any) {
      toast.error(error || "Failed to update course status");
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) return;
    try {
      await dispatch(deleteCourse(isDeleting)).unwrap();
      toast.success("Course deleted successfully");
    } catch (error: any) {
      toast.error(error || "Failed to delete course");
    } finally {
      setIsDeleting(null);
    }
  };

  const columns: Column<Course>[] = [
    {
      header: "Course",
      accessorKey: "title",
      className: "w-1/3",
      cell: (course) => (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-surface-200 dark:bg-surface-700 flex-shrink-0 overflow-hidden">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-surface-400">No Img</div>
            )}
          </div>
          <div>
            <p className="font-bold text-surface-900 dark:text-white line-clamp-1">{course.title}</p>
            <p className="text-xs text-surface-500 capitalize">{course.category}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "isPublished",
      cell: (course) => (
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-medium border ${
            course.isPublished
              ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400"
              : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400"
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
        <span className="font-medium">${course.price.toFixed(2)}</span>
      ),
    },
    {
      header: "Students",
      accessorKey: "enrolledCount",
      cell: (course) => (
        <span className="font-medium">{course.enrolledCount || 0}</span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (course) => (
        <div className="flex justify-end items-center space-x-2">
          <button
            onClick={() => handleTogglePublish(course)}
            title={course.isPublished ? "Unpublish" : "Publish"}
            className="p-2 text-surface-500 hover:text-primary-500 transition-colors"
          >
            {course.isPublished ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
          </button>
          <Link
            href={`/dashboard/my-courses/${course._id}/students`}
            title="Manage Students"
            className="p-2 text-surface-500 hover:text-blue-500 transition-colors"
          >
            <Users className="w-4 h-4" />
          </Link>
          <Link
            href={`/dashboard/my-courses/${course._id}/edit`}
            title="Edit Course"
            className="p-2 text-surface-500 hover:text-green-500 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setIsDeleting(course._id)}
            title="Delete Course"
            className="p-2 text-surface-500 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">My Courses</h1>
          <p className="text-surface-500 mt-1">Manage all the courses you have created.</p>
        </div>
        <Link
          href="/dashboard/my-courses/create"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors border border-primary-600 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Create Course</span>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={myCourses}
        keyExtractor={(course) => course._id}
        isLoading={status === "loading" && myCourses.length === 0}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!isDeleting}
        onClose={() => setIsDeleting(null)}
        title="Delete Course"
      >
        <div className="space-y-4">
          <p className="text-surface-600 dark:text-surface-400">
            Are you sure you want to delete this course? This action cannot be undone. All lessons, sections, and progress related to this course will be permanently lost.
          </p>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsDeleting(null)}
              className="px-4 py-2 border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium transition-colors border border-red-600 shadow-sm"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
