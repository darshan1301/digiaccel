export type PriorityLevel = "Low" | "Medium" | "High";
export type TaskStatus = "In Progress" | "Completed";

export interface TaskItemData {
  id: number;
  title: string;
  description: string | null;
  dateTime: string; // Start Date & Time (ISO 8601)
  endTime: string | null; // End Date & Time (ISO 8601)
  startTime?: string; // HH:mm
  endTimeStr?: string | null; // HH:mm
  dateStr?: string; // YYYY-MM-DD
  priority: PriorityLevel | string | null;
  status: TaskStatus | string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklySummaryData {
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  openCount: number;
  completedCount: number;
  totalCount: number;
}

export interface CreateTaskFormData {
  title: string;
  description?: string | null;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string | null; // HH:mm
  priority?: PriorityLevel | null;
  status?: TaskStatus;
}

export interface UpdateTaskFormData {
  title?: string;
  description?: string | null;
  date?: string;
  startTime?: string;
  endTime?: string | null;
  priority?: PriorityLevel | null;
  status?: TaskStatus;
}
