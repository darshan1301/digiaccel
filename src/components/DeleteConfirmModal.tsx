"use client";

import React, { useState, useEffect } from "react";
import { TaskItemData } from "@/types/task.ts";
import { TrashIcon, CloseIcon, AlertTriangleIcon } from "./Icons.tsx";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  task: TaskItemData | null;
  onClose: () => void;
  onConfirm: (taskId: number) => Promise<void>;
}

export function DeleteConfirmModal({
  isOpen,
  task,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await onConfirm(task.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-sm bg-white rounded-none shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
          aria-label="Close"
        >
          <CloseIcon className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Warning Icon Badge */}
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
            <AlertTriangleIcon className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-gray-900">Delete Task</h3>

          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">&ldquo;{task.title}&rdquo;</span>?
            This action cannot be undone.
          </p>

          {error && (
            <div className="mt-3 w-full p-2.5 text-xs text-red-700 bg-red-50 rounded-none border border-red-200 text-left">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3 w-full">
            <button
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className="py-2.5 px-4 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-none transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="py-2.5 px-4 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-none shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isDeleting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <TrashIcon className="w-4 h-4 text-white" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

