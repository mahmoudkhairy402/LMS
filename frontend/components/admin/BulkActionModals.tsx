"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useAppDispatch } from "@/store/hooks";
import {
  bulkActivateUsers,
  bulkDeactivateUsers,
  bulkDeleteUsers,
  bulkUpdateRole,
} from "@/store/thunks/userThunks";
import { toast } from "sonner";

interface BulkActionModalsProps {
  selectedIds: string[];
  actionType: "activate" | "deactivate" | "role" | "delete" | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkActionModals({ selectedIds, actionType, onClose, onSuccess }: BulkActionModalsProps) {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRole, setNewRole] = useState<"student" | "instructor" | "admin">("student");

  const handleAction = async () => {
    if (!actionType || selectedIds.length === 0) return;

    setIsSubmitting(true);
    try {
      if (actionType === "activate") {
        await dispatch(bulkActivateUsers({ userIds: selectedIds })).unwrap();
        toast.success(`${selectedIds.length} users activated`);
      } else if (actionType === "deactivate") {
        await dispatch(bulkDeactivateUsers({ userIds: selectedIds })).unwrap();
        toast.success(`${selectedIds.length} users deactivated`);
      } else if (actionType === "delete") {
        await dispatch(bulkDeleteUsers({ userIds: selectedIds, permanent: false })).unwrap();
        toast.success(`${selectedIds.length} users deleted`);
      } else if (actionType === "role") {
        await dispatch(bulkUpdateRole({ userIds: selectedIds, newRole })).unwrap();
        toast.success(`${selectedIds.length} users updated to ${newRole}`);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error || "Bulk action failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!actionType) return null;

  return (
    <Modal
      isOpen={!!actionType}
      onClose={onClose}
      title={
        actionType === "activate" ? "Activate Users" :
        actionType === "deactivate" ? "Deactivate Users" :
        actionType === "delete" ? "Delete Users" : "Change User Roles"
      }
    >
      <div className="space-y-4">
        <p className="text-surface-600 dark:text-surface-400">
          You are about to {actionType} {selectedIds.length} selected user(s).
          {actionType === "delete" && " This action is irreversible."}
        </p>

        {actionType === "role" && (
          <div className="py-2">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Select New Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="w-full px-4 py-2 border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-950 focus:ring-2 focus:ring-primary-500 rounded-none"
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleAction}
            disabled={isSubmitting}
            className={`px-4 py-2 font-medium text-white transition-colors border shadow-sm disabled:opacity-50 ${
              actionType === "delete" || actionType === "deactivate"
                ? "bg-red-500 hover:bg-red-600 border-red-600"
                : "bg-primary-500 hover:bg-primary-600 border-primary-600"
            }`}
          >
            {isSubmitting ? "Processing..." : "Confirm Action"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
