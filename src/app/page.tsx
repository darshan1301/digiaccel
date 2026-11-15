"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  TaskItemData,
  WeeklySummaryData,
  PriorityLevel,
  TaskStatus,
} from "@/types/task.ts";
import { Onboarding } from "@/components/Onboarding.tsx";
import { SearchHeader } from "@/components/SearchHeader.tsx";
import { WeekCalendarStrip } from "@/components/WeekCalendarStrip.tsx";
import { WeeklyCards } from "@/components/WeeklyCards.tsx";
import { TaskList } from "@/components/TaskList.tsx";
import { TaskModal } from "@/components/TaskModal.tsx";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal.tsx";
import { FloatingAddButton } from "@/components/FloatingAddButton.tsx";

/**
 * Returns the Monday for a given Date at 00:00:00
 */
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Home() {
  // Navigation & View States: Start on Onboarding screen (Figma Screen 1)
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isViewAll, setIsViewAll] = useState<boolean>(false);

  // Date Selection States
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => getMonday(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  // Data States
  const [tasks, setTasks] = useState<TaskItemData[]>([]);
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummaryData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItemData | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskItemData | null>(null);

  // ─── API Fetchers ──────────────────────────────────────────────────────────

  const fetchTasks = useCallback(async (query?: string) => {
    try {
      const url = query && query.trim()
        ? `/api/tasks?q=${encodeURIComponent(query.trim())}`
        : "/api/tasks";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setTasks(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  }, []);

  const fetchWeeklySummary = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks/weekly-summary");
      const json = await res.json();
      if (json.success) {
        setWeeklySummaries(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch weekly summary:", err);
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchTasks(searchQuery), fetchWeeklySummary()]);
    setIsLoading(false);
  }, [fetchTasks, fetchWeeklySummary, searchQuery]);

  // Initial load
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Debounced search trigger
  useEffect(() => {
    if (isSearchActive) {
      const timer = setTimeout(() => {
        fetchTasks(searchQuery);
      }, 250);
      return () => clearTimeout(timer);
    } else {
      fetchTasks();
    }
  }, [searchQuery, isSearchActive, fetchTasks]);

  // ─── Week & Date Navigation ────────────────────────────────────────────────

  const handlePrevWeek = () => {
    const nextMonday = new Date(currentWeekMonday);
    nextMonday.setDate(nextMonday.getDate() - 7);
    setCurrentWeekMonday(nextMonday);
    setSelectedDate(nextMonday);
  };

  const handleNextWeek = () => {
    const nextMonday = new Date(currentWeekMonday);
    nextMonday.setDate(nextMonday.getDate() + 7);
    setCurrentWeekMonday(nextMonday);
    setSelectedDate(nextMonday);
  };

  // Find summary for the currently displayed week
  const activeWeekSummary = useMemo(() => {
    const mondayStr = formatDateString(currentWeekMonday);
    const found = weeklySummaries.find((s) => s.weekStart === mondayStr);
    if (found) return found;

    // Calculate fallback summary from loaded tasks
    const weekStart = new Date(currentWeekMonday);
    const weekEnd = new Date(currentWeekMonday);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekTasks = tasks.filter((t) => {
      const d = new Date(t.dateTime);
      return d >= weekStart && d < weekEnd;
    });

    const completed = weekTasks.filter((t) => t.status.toLowerCase() === "completed").length;
    const open = weekTasks.length - completed;

    return {
      weekStart: mondayStr,
      weekEnd: formatDateString(new Date(weekEnd.getTime() - 1)),
      openCount: open,
      completedCount: completed,
      totalCount: weekTasks.length,
    };
  }, [currentWeekMonday, weeklySummaries, tasks]);

  // Filter tasks for view
  const displayedTasks = useMemo(() => {
    if (isSearchActive) {
      return tasks;
    }

    if (isViewAll) {
      // Show all tasks for the current week
      const weekStart = new Date(currentWeekMonday);
      const weekEnd = new Date(currentWeekMonday);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return tasks.filter((t) => {
        const d = new Date(t.dateTime);
        return d >= weekStart && d < weekEnd;
      });
    }

    // Default: Show tasks scheduled for selectedDate
    const targetDateStr = formatDateString(selectedDate);
    return tasks.filter((t) => {
      const taskDate = new Date(t.dateTime);
      return formatDateString(taskDate) === targetDateStr;
    });
  }, [isSearchActive, isViewAll, tasks, currentWeekMonday, selectedDate]);

  // ─── CRUD Handlers ─────────────────────────────────────────────────────────

  const handleCreateTask = async (data: {
    title: string;
    description?: string | null;
    date: string;
    startTime: string;
    endTime?: string | null;
    priority?: PriorityLevel | null;
    status?: TaskStatus;
  }) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to create task");
    }
    await refreshAllData();
  };

  const handleUpdateTask = async (data: {
    title: string;
    description?: string | null;
    date: string;
    startTime: string;
    endTime?: string | null;
    priority?: PriorityLevel | null;
    status?: TaskStatus;
  }) => {
    if (!taskToEdit) return;
    const res = await fetch(`/api/tasks/${taskToEdit.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to update task");
    }
    await refreshAllData();
  };

  const handleToggleStatus = async (task: TaskItemData) => {
    const newStatus =
      task.status.toLowerCase() === "completed" ? "In Progress" : "Completed";

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${task.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update status");
      }
      fetchWeeklySummary();
    } catch (err) {
      console.error("Status update error:", err);
      // Revert on error
      fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to delete task");
    }
    await refreshAllData();
  };

  // ─── Render Onboarding View ────────────────────────────────────────────────
  if (!hasStarted) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
        <div className="w-full max-w-md bg-white min-h-screen sm:min-h-[844px] shadow-2xl rounded-none overflow-hidden flex flex-col">
          <Onboarding onGetStarted={() => setHasStarted(true)} />
        </div>
      </main>
    );
  }

  // ─── Render Main Application ───────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#F8FAFC] min-h-screen sm:min-h-[844px] shadow-2xl rounded-none overflow-hidden flex flex-col relative pb-24">
        {/* Top App Header & Search Bar */}
        <div className="sticky top-0 z-20 bg-[#F8FAFC]/95 backdrop-blur-md px-5 pt-5 pb-3">
          {/* Top Bar with Settings and Notification Icons (Figma Screen 2 & 3) */}
          {!isSearchActive && (
            <div className="flex items-center justify-between mb-3.5 px-0.5">
              <button
                type="button"
                onClick={() => setHasStarted(false)}
                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition cursor-pointer"
                title="View Onboarding / Welcome"
                aria-label="View Onboarding"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsSearchActive(true)}
                  className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition cursor-pointer"
                  title="Search tasks"
                  aria-label="Search"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.65a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
                  </svg>
                </button>
                <div className="relative p-2 text-gray-500 rounded-full">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                </div>
              </div>
            </div>
          )}

          <SearchHeader
            value={searchQuery}
            isSearchActive={isSearchActive}
            onChange={setSearchQuery}
            onActivate={() => setIsSearchActive(true)}
            onClearOrBack={() => {
              setIsSearchActive(false);
              setSearchQuery("");
            }}
          />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 px-5 space-y-6 pt-1">
          {isSearchActive ? (
            /* Search Results View */
            <div className="pt-2">
              <TaskList
                title={
                  searchQuery.trim()
                    ? `Results for "${searchQuery}" (${displayedTasks.length})`
                    : "All Tasks"
                }
                tasks={displayedTasks}
                showViewAll={false}
                onToggleStatus={handleToggleStatus}
                onEdit={(task) => setTaskToEdit(task)}
                onDelete={(task) => setTaskToDelete(task)}
              />
            </div>
          ) : (
            /* Home Screen View (Figma Screen 2) */
            <>
              {/* Calendar Day Strip */}
              <WeekCalendarStrip
                currentWeekMonday={currentWeekMonday}
                selectedDate={selectedDate}
                onSelectDate={(d) => {
                  setSelectedDate(d);
                  setIsViewAll(false);
                }}
                onPrevWeek={handlePrevWeek}
                onNextWeek={handleNextWeek}
              />

              {/* Weekly Summary Cards & Progress */}
              <WeeklyCards summary={activeWeekSummary} />

              {/* Tasks List ("Tasks Today" or "This Week's Tasks") */}
              <TaskList
                title={isViewAll ? "This Week's Tasks" : "Tasks Today"}
                tasks={displayedTasks}
                showViewAll={true}
                isViewAll={isViewAll}
                onToggleViewAll={() => setIsViewAll((prev) => !prev)}
                onToggleStatus={handleToggleStatus}
                onEdit={(task) => setTaskToEdit(task)}
                onDelete={(task) => setTaskToDelete(task)}
              />
            </>
          )}
        </div>

        {/* Floating Action Button (FAB) */}
        {!isSearchActive && (
          <FloatingAddButton onClick={() => setIsCreateModalOpen(true)} />
        )}

        {/* Modal Window: Add New Task */}
        <TaskModal
          isOpen={isCreateModalOpen}
          mode="create"
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateTask}
        />

        {/* Modal Window: Edit Task */}
        <TaskModal
          isOpen={!!taskToEdit}
          mode="edit"
          taskToEdit={taskToEdit}
          onClose={() => setTaskToEdit(null)}
          onSubmit={handleUpdateTask}
        />

        {/* Modal Window: Delete Confirmation */}
        <DeleteConfirmModal
          isOpen={!!taskToDelete}
          task={taskToDelete}
          onClose={() => setTaskToDelete(null)}
          onConfirm={handleDeleteTask}
        />
      </div>
    </main>
  );
}
