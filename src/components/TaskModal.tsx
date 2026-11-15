"use client";

import React, { useState, useEffect } from "react";
import { TaskItemData, PriorityLevel, TaskStatus } from "@/types/task.ts";
import { CloseIcon, ClockIcon, CalendarIcon } from "./Icons.tsx";

interface TaskModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  taskToEdit?: TaskItemData | null;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string | null;
    date: string;
    startTime: string;
    endTime?: string | null;
    priority?: PriorityLevel | null;
    status?: TaskStatus;
  }) => Promise<void>;
}

export function TaskModal({
  isOpen,
  mode,
  taskToEdit,
  onClose,
  onSubmit,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [priority, setPriority] = useState<PriorityLevel>("Medium");
  const [status, setStatus] = useState<TaskStatus>("In Progress");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (mode === "edit" && taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || "");
        setPriority((taskToEdit.priority as PriorityLevel) || "Medium");
        setStatus(
          taskToEdit.status.toLowerCase() === "completed"
            ? "Completed"
            : "In Progress"
        );

        if (taskToEdit.dateStr) {
          setDate(taskToEdit.dateStr);
        } else {
          const d = new Date(taskToEdit.dateTime);
          setDate(!isNaN(d.getTime()) ? d.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
        }

        setStartTime(taskToEdit.startTime || "09:00");
        setEndTime(taskToEdit.endTimeStr || "");
      } else {
        // Create mode defaults (matching Figma Screen 3)
        setTitle("");
        setDescription("");
        setDate(new Date().toISOString().split("T")[0]);
        setStartTime("09:00");
        setEndTime("11:00");
        setPriority("Medium");
        setStatus("In Progress");
      }
    }
  }, [isOpen, mode, taskToEdit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }
    if (!date) {
      setError("Please set a date");
      return;
    }
    if (!startTime) {
      setError("Please set a start time");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await onSubmit({
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        date,
        startTime,
        endTime: endTime.trim() ? endTime.trim() : null,
        priority,
        status,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Box with Sharp Non-Rounded Corners */}
      <div className="relative w-full max-w-lg bg-white rounded-none shadow-2xl p-6 z-10 max-h-[92vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-8 duration-200">
        {/* Header (Figma Screen 3: "Add New Task" with close X button) */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {mode === "create" ? "Add New Task" : "Edit Task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 text-sm text-red-700 bg-red-50 rounded-none border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* 1. Task Title (Figma Field 1) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Task title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Doing Homework"
              className="w-full px-4 py-3 text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
            />
          </div>

          {/* 2. Set Time - Start & Ends side-by-side (Figma Field 2) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Set Time
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Start Time */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <ClockIcon className="w-4 h-4" />
                </div>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  title="Start Time"
                />
              </div>

              {/* Ends Time */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <ClockIcon className="w-4 h-4" />
                </div>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  placeholder="Ends"
                  title="End Time (optional)"
                />
              </div>
            </div>
            <div className="flex justify-between px-1 mt-1 text-[11px] text-gray-400">
              <span>Start time</span>
              <span>End time (optional)</span>
            </div>
          </div>

          {/* 3. Set Date (Figma Field 3) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Set Date
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* 4. Priority (Figma Field 5: Low, Medium, High) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Low", "Medium", "High"] as PriorityLevel[]).map((p) => {
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 px-3 text-xs font-semibold rounded-none border transition cursor-pointer ${
                      isSelected
                        ? p === "High"
                          ? "bg-red-50 text-red-600 border-red-300 ring-2 ring-red-400"
                          : p === "Medium"
                          ? "bg-amber-50 text-amber-600 border-amber-300 ring-2 ring-amber-400"
                          : "bg-emerald-50 text-emerald-600 border-emerald-300 ring-2 ring-emerald-400"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status (when editing) */}
          {mode === "edit" && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("In Progress")}
                  className={`py-2 text-xs font-semibold rounded-none border transition cursor-pointer ${
                    status === "In Progress"
                      ? "bg-blue-50 text-blue-600 border-blue-300 ring-2 ring-blue-400"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  In Progress
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("Completed")}
                  className={`py-2 text-xs font-semibold rounded-none border transition cursor-pointer ${
                    status === "Completed"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-300 ring-2 ring-emerald-400"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          )}

          {/* 5. Description (Figma Field 4) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add Description"
              className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition resize-none"
            />
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-none shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-60 flex items-center justify-center cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : mode === "create" ? (
                "Create task"
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
