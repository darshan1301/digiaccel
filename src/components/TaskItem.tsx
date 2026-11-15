"use client";

import React from "react";
import { TaskItemData } from "@/types/task.ts";
import { CheckIcon, TrashIcon, EditIcon } from "./Icons.tsx";

interface TaskItemProps {
  task: TaskItemData;
  onToggleStatus: (task: TaskItemData) => void;
  onEdit: (task: TaskItemData) => void;
  onDelete: (task: TaskItemData) => void;
}

export function TaskItem({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const isCompleted = task.status.toLowerCase() === "completed";

  // Format time span: "09:00 - 11:00" or single time
  const timeSpan = (() => {
    if (task.startTime && task.endTimeStr) {
      return `${task.startTime} – ${task.endTimeStr}`;
    }
    if (task.startTime) {
      return task.startTime;
    }
    try {
      const d = new Date(task.dateTime);
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  })();

  const priorityColor = (() => {
    const p = (task.priority || "").toLowerCase();
    if (p === "high") return "bg-red-50 text-red-600 border-red-200";
    if (p === "medium") return "bg-amber-50 text-amber-600 border-amber-200";
    if (p === "low") return "bg-emerald-50 text-emerald-600 border-emerald-200";
    return "";
  })();

  return (
    <div className="group flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-none hover:border-gray-200 hover:shadow-xs transition-all duration-150">
      {/* Left: Checkbox + Title + Time + Priority */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
        <button
          type="button"
          onClick={() => onToggleStatus(task)}
          className={`w-6 h-6 rounded-none flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            isCompleted
              ? "bg-blue-600 text-white"
              : "border-2 border-gray-300 hover:border-blue-500 bg-white"
          }`}
          aria-label={isCompleted ? "Mark in progress" : "Mark completed"}
        >
          {isCompleted && <CheckIcon className="w-4 h-4 text-white" />}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium truncate transition-colors ${
              isCompleted ? "line-through text-gray-400" : "text-gray-900"
            }`}
          >
            {task.title}
          </p>

          <div className="flex items-center gap-2 mt-0.5">
            {timeSpan && (
              <span className="text-[11px] text-gray-400 font-medium">
                {timeSpan}
              </span>
            )}
            {task.priority && (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-none border ${priorityColor}`}
              >
                {task.priority}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions (Delete & Edit) */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-none transition cursor-pointer"
          title="Delete task"
          aria-label="Delete task"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-none transition cursor-pointer"
          title="Edit task"
          aria-label="Edit task"
        >
          <EditIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
