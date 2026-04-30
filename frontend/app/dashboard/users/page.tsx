"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Edit, UserCheck, Shield, BookOpen, AlertCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAllUsers } from "@/store/thunks/userThunks";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { BulkActionModals } from "@/components/admin/BulkActionModals";
import type { ManagedUser } from "@/types/user-management";

export default function UsersManagementPage() {
  const dispatch = useAppDispatch();
  const { users, usersMeta, status } = useAppSelector((state) => state.userManagement);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<"" | "student" | "instructor" | "admin">("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<"activate" | "deactivate" | "role" | "delete" | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchUsers = () => {
    dispatch(
      getAllUsers({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      })
    );
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, page, debouncedSearch, roleFilter, statusFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(users.map((u) => u._id || u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const columns: Column<ManagedUser>[] = [
    {
      header: (
        <input
          type="checkbox"
          className="w-4 h-4 text-primary-500 bg-surface-50 dark:bg-surface-900 border-surface-300 dark:border-surface-600 rounded-none focus:ring-primary-500"
          checked={selectedIds.length === users.length && users.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      accessorKey: "id",
      className: "w-12 text-center",
      cell: (user) => {
        const userId = user._id || user.id;
        return (
          <input
            type="checkbox"
            className="w-4 h-4 text-primary-500 bg-surface-50 dark:bg-surface-900 border-surface-300 dark:border-surface-600 rounded-none focus:ring-primary-500"
            checked={selectedIds.includes(userId)}
            onChange={(e) => handleSelectOne(userId, e.target.checked)}
            onClick={(e) => e.stopPropagation()}
          />
        );
      },
    },
    {
      header: "User",
      accessorKey: "name",
      cell: (user) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-surface-200 dark:bg-surface-700 flex-shrink-0 flex items-center justify-center text-surface-500 font-bold overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0)
            )}
          </div>
          <div>
            <p className="font-bold text-surface-900 dark:text-white flex items-center gap-2">
              {user.name}
              {!user.isEmailVerified && (
                <span title="Email not verified">
                  <AlertCircle className="w-3 h-3 text-yellow-500" />
                </span>
              )}
            </p>
            <p className="text-xs text-surface-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessorKey: "role",
      cell: (user) => (
        <span className="flex items-center space-x-1 text-sm font-medium capitalize text-surface-700 dark:text-surface-300">
          {user.role === "admin" && <Shield className="w-4 h-4 text-red-500" />}
          {user.role === "instructor" && <UserCheck className="w-4 h-4 text-primary-500" />}
          {user.role === "student" && <BookOpen className="w-4 h-4 text-blue-500" />}
          <span>{user.role}</span>
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (user) => (
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-medium border ${user.isActive !== false
            ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400"
            : "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400"
            }`}
        >
          {user.isActive !== false ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Joined",
      accessorKey: "createdAt",
      cell: (user) => (
        <span className="text-surface-600 dark:text-surface-400 text-sm">
          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (user) => (
        <Link
          href={`/dashboard/users/${user._id || user.id}`}
          className="inline-flex p-2 text-surface-500 hover:text-primary-500 transition-colors"
          title="Edit User"
          onClick={(e) => e.stopPropagation()}
        >
          <Edit className="w-4 h-4" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">User Management</h1>
        <p className="text-surface-500 mt-1">View and manage all users on the platform.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-4">
        {/* Search */}
        <div className="relative w-full md:max-w-xs dark:bg-background">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-surface-400 bg-background " />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-surface-300 dark:border-surface-700 bg-background dark:bg-background text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 rounded-none placeholder-surface-400"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters & Bulk Actions */}
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4 items-center dark:bg-background">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as any);
              setPage(1);
            }}
            className="block w-full sm:w-36 px-3 py-2 border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-950 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-none capitalize dark:bg-background"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="block w-full sm:w-36 px-3 py-2 border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-950 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-none dark:bg-background"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Bulk Actions Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value=""
              onChange={(e) => setBulkAction(e.target.value as any)}
              disabled={selectedIds.length === 0}
              className="block w-full sm:w-40 px-3 py-2 border border-surface-300 dark:border-surface-700 bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-none disabled:opacity-50 font-medium dark:bg-background"
            >
              <option value="" disabled>Bulk Actions ({selectedIds.length})</option>
              <option value="activate">Activate</option>
              <option value="deactivate">Deactivate</option>
              <option value="role">Change Role</option>
              <option value="delete">Delete</option>
            </select>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        keyExtractor={(user) => user._id || user.id}
        isLoading={status === "loading"}
      />

      <Pagination
        currentPage={usersMeta.page}
        totalPages={usersMeta.totalPages}
        onPageChange={(p) => setPage(p)}
      />

      <BulkActionModals
        selectedIds={selectedIds}
        actionType={bulkAction}
        onClose={() => setBulkAction(null)}
        onSuccess={() => {
          setSelectedIds([]);
          fetchUsers();
        }}
      />
    </div>
  );
}
