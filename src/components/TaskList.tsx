"use client";

import React from "react";
import { TaskItemData } from "@/types/task.ts";
import { TaskItem } from "./TaskItem.tsx";

interface TaskListProps {
  title: string;
  tasks: TaskItemData[];
  showViewAll?: boolean;
  isViewAll?: boolean;
  onToggleViewAll?: () => void;
  onToggleStatus: (task: TaskItemData) => void;
  onEdit: (task: TaskItemData) => void;
  onDelete: (task: TaskItemData) => void;
}

export function TaskList({
  title,
  tasks,
  showViewAll = true,
  isViewAll = false,
  onToggleViewAll,
  onToggleStatus,
  onEdit,
  onDelete,
}: TaskListProps) {
  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <h2 className="text-base font-bold text-gray-900 tracking-tight">
          {title}
        </h2>
        {showViewAll && onToggleViewAll && (
          <button
            type="button"
            onClick={onToggleViewAll}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer"
          >
            {isViewAll ? "Show Today" : "View All"}
          </button>
        )}
      </div>

      {/* List / Empty State */}
      {tasks.length === 0 ? (
        <div className="p-8 text-center bg-white border border-dashed border-gray-200 rounded-none">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-800">No tasks found</p>
          <p className="text-xs text-gray-400 mt-1">
            Tap the + button below to add your first task for this date.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleStatus={onToggleStatus}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

