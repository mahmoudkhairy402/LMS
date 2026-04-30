"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Shield, BookOpen, UserCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getUserById,
  getUserEnrollments,
  getUserCourses,
  updateUser,
  deactivateUser,
} from "@/store/thunks/userThunks";
import { clearSelectedUser } from "@/store/slices/userManagementSlice";
import { DataTable, type Column } from "@/components/ui/DataTable";
import type { Course, Enrollment } from "@/types/course";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;

  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    selectedUser,
    selectedUserEnrollments,
    selectedUserCourses,
    status,
  } = useAppSelector((state) => state.userManagement);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "student" as "student" | "instructor" | "admin",
  });

  useEffect(() => {
    dispatch(getUserById(userId));

    return () => {
      import("@/store/slices/userManagementSlice").then(({ clearSelectedUser: clearAction }) => {
        dispatch(clearAction());
      });
    };
  }, [dispatch, userId]);

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        name: selectedUser.name,
        role: selectedUser.role,
      });
    }
  }, [selectedUser]);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateUser({ userId, data: formData })).unwrap();
      toast.success("User updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error || "Failed to update user");
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      try {
        await dispatch(deactivateUser({ userId })).unwrap();
        toast.success("User deactivated");
      } catch (error: any) {
        toast.error(error || "Failed to deactivate user");
      }
    }
  };

  if (status === "loading" && !selectedUser) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse flex space-x-2">
          <div className="w-3 h-3 bg-primary-500"></div>
          <div className="w-3 h-3 bg-primary-500 delay-75"></div>
          <div className="w-3 h-3 bg-primary-500 delay-150"></div>
        </div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="text-center py-20">
        <p className="text-surface-500 mb-4">User not found.</p>
        <Link href="/dashboard/users" className="text-primary-500 hover:underline">
          Return to User Management
        </Link>
      </div>
    );
  }

  // Data tables are moved to separate screens.

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/users"
            className="p-2 border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">User Details</h1>
        </div>
        <div className="flex space-x-3">
          {selectedUser.isActive && (
            <button
              onClick={handleDeactivate}
              className="px-4 py-2 text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-medium text-sm"
            >
              Deactivate User
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="md:col-span-1 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 bg-surface-200 dark:bg-surface-700 rounded-none flex items-center justify-center overflow-hidden">
            {selectedUser.avatar ? (
              <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-surface-400" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">{selectedUser.name}</h2>
            <p className="text-surface-500">{selectedUser.email}</p>
          </div>

          <div className="flex flex-col w-full gap-2 mt-4 text-sm">
            <div className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-700">
              <span className="text-surface-500">Role</span>
              <span className="font-medium capitalize text-surface-900 dark:text-white flex items-center gap-1">
                {selectedUser.role === "admin" && <Shield className="w-3 h-3 text-red-500" />}
                {selectedUser.role === "instructor" && <UserCheck className="w-3 h-3 text-primary-500" />}
                {selectedUser.role === "student" && <BookOpen className="w-3 h-3 text-blue-500" />}
                {selectedUser.role}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-700">
              <span className="text-surface-500">Status</span>
              <span className={`font-medium ${selectedUser.isActive ? "text-green-500" : "text-red-500"}`}>
                {selectedUser.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-700">
              <span className="text-surface-500">Joined</span>
              <span className="font-medium text-surface-900 dark:text-white">
                {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "—"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-surface-500">Email Verified</span>
              <span className="font-medium text-surface-900 dark:text-white">
                {selectedUser.isEmailVerified ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        {/* User Details & Edit Form */}
        <div className="md:col-span-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white">Account Information</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-primary-500 hover:text-primary-600 font-medium text-sm transition-colors"
            >
              {isEditing ? "Cancel" : "Edit Details"}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-950 focus:ring-2 focus:ring-primary-500 rounded-none dark:bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-950 focus:ring-2 focus:ring-primary-500 rounded-none capitalize dark:bg-background"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
                {formData.role !== selectedUser.role && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-500">
                    <AlertTriangle className="w-3 h-3" />
                    Changing roles will affect the user's access permissions immediately.
                  </p>
                )}
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors border border-primary-600 shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <p className="text-surface-500 text-sm">
                No extra account details are currently available for this user. You can edit their name and role.
              </p>

              {/* Conditional Related Data Links based on role */}
              <div className="pt-6 border-t border-surface-200 dark:border-surface-700 mt-6 flex flex-col gap-3">
                <h3 className="text-lg font-bold text-surface-900 dark:text-white">
                  Quick Actions
                </h3>

                {selectedUser.role === "student" && (
                  <Link
                    href={`/dashboard/users/${userId}/enrollments`}
                    className="inline-flex items-center justify-between px-4 py-3 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-primary-500 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-primary-500" />
                      <span className="font-medium text-surface-900 dark:text-white">View Enrollments</span>
                    </div>
                    <span className="text-sm text-surface-500">View all enrolled courses & progress &rarr;</span>
                  </Link>
                )}

                {selectedUser.role === "instructor" && (
                  <Link
                    href={`/dashboard/users/${userId}/courses`}
                    className="inline-flex items-center justify-between px-4 py-3 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-primary-500 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-primary-500" />
                      <span className="font-medium text-surface-900 dark:text-white">View Created Courses</span>
                    </div>
                    <span className="text-sm text-surface-500">View all authored courses & stats &rarr;</span>
                  </Link>
                )}

                {selectedUser.role === "admin" && (
                  <p className="text-surface-500 text-sm italic border border-dashed border-surface-300 dark:border-surface-700 p-4 text-center">
                    Administrative action logs are not currently tracked in this view.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
