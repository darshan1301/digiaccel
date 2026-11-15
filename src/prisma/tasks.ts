import { db } from "./db.ts";

export { db };

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  dateTime: string | Date; // Start timestamp (Date + Start Time)
  endTime?: string | Date | null; // End timestamp (Date + End Time)
  priority?: string | null; // "Low" | "Medium" | "High"
  status?: string; // "In Progress" | "Completed"
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  dateTime?: string | Date;
  endTime?: string | Date | null;
  priority?: string | null;
  status?: string;
}

export interface TaskResponse {
  id: number;
  title: string;
  description: string | null;
  dateTime: string;
  endTime: string | null;
  dateStr: string;
  startTime: string;
  endTimeStr: string | null;
  priority: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklySummaryItem {
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string; // YYYY-MM-DD (Sunday)
  openCount: number;
  completedCount: number;
  totalCount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function padTwo(n: number): string {
  return String(n).padStart(2, "0");
}

function formatTask(task: {
  id: number;
  title: string;
  description: string | null;
  dateTime: Date;
  endTime?: Date | null;
  priority: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): TaskResponse {
  const startDate = task.dateTime instanceof Date ? task.dateTime : new Date(task.dateTime);
  const endDate = task.endTime ? (task.endTime instanceof Date ? task.endTime : new Date(task.endTime)) : null;

  const dateStr = startDate.toISOString().split("T")[0];
  const startTime = `${padTwo(startDate.getUTCHours())}:${padTwo(startDate.getUTCMinutes())}`;
  const endTimeStr = endDate
    ? `${padTwo(endDate.getUTCHours())}:${padTwo(endDate.getUTCMinutes())}`
    : null;

  return {
    id: task.id,
    title: task.title,
    description: task.description ?? null,
    dateTime: startDate.toISOString(),
    endTime: endDate ? endDate.toISOString() : null,
    dateStr,
    startTime,
    endTimeStr,
    priority: task.priority ?? null,
    status: task.status,
    createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : new Date(task.createdAt).toISOString(),
    updatedAt: task.updatedAt instanceof Date ? task.updatedAt.toISOString() : new Date(task.updatedAt).toISOString(),
  };
}

const ALL_FIELDS = [
  "id",
  "title",
  "description",
  "dateTime",
  "endTime",
  "priority",
  "status",
  "createdAt",
  "updatedAt",
] as const;

/**
 * Returns the Monday (start of week) at 00:00:00.000 UTC for a given Date
 */
export function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getUTCDay(); // 0 is Sunday, 1 is Monday, ...
  const diff = (day === 0 ? -6 : 1) - day;
  date.setUTCDate(date.getUTCDate() + diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

/**
 * Formats a Date to YYYY-MM-DD
 */
export function formatDateOnly(d: Date): string {
  return d.toISOString().split("T")[0];
}

// ─── CRUD Operations ─────────────────────────────────────────────────────────

export async function createTask(input: CreateTaskInput): Promise<TaskResponse> {
  const task = await db.orm.public.Task.create({
    title: input.title,
    description: input.description ?? null,
    dateTime: new Date(input.dateTime),
    endTime: input.endTime ? new Date(input.endTime) : null,
    priority: input.priority ?? null,
    status: input.status ?? "In Progress",
  });
  return formatTask(task);
}

export async function getTaskById(id: number): Promise<TaskResponse | null> {
  const task = await db.orm.public.Task.where({ id }).first();
  return task ? formatTask(task) : null;
}

export async function updateTask(id: number, input: UpdateTaskInput): Promise<TaskResponse | null> {
  const data: Record<string, unknown> = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.dateTime !== undefined) data.dateTime = new Date(input.dateTime);
  if (input.endTime !== undefined) data.endTime = input.endTime ? new Date(input.endTime) : null;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.status !== undefined) data.status = input.status;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await db.orm.public.Task.where({ id }).update(data as any);
  return updated ? formatTask(updated) : null;
}

export async function deleteTask(id: number): Promise<TaskResponse | null> {
  const deleted = await db.orm.public.Task.where({ id }).delete();
  return deleted ? formatTask(deleted) : null;
}

export async function listTasks(queryOrLimit?: string | number): Promise<TaskResponse[]> {
  const query = typeof queryOrLimit === "string" ? queryOrLimit : undefined;
  const limit = typeof queryOrLimit === "number" ? queryOrLimit : 100;

  const tasks = await db.orm.public.Task.select(...ALL_FIELDS)
    .orderBy((t) => t.dateTime.asc())
    .limit(limit)
    .all();

  let formatted = tasks.map(formatTask);

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    formatted = formatted.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }

  return formatted;
}

// ─── Status Update ───────────────────────────────────────────────────────────

export async function updateTaskStatus(id: number, status: string): Promise<TaskResponse | null> {
  const updated = await db.orm.public.Task.where({ id }).update({ status });
  return updated ? formatTask(updated) : null;
}

// ─── Weekly Summaries & Views ────────────────────────────────────────────────

export async function getWeeklySummary(): Promise<WeeklySummaryItem[]> {
  const tasks = await db.orm.public.Task.select(...ALL_FIELDS)
    .orderBy((t) => t.dateTime.asc())
    .all();

  const weekMap = new Map<string, { openCount: number; completedCount: number; mondayDate: Date }>();

  for (const task of tasks) {
    const monday = getMondayOfWeek(new Date(task.dateTime));
    const weekKey = formatDateOnly(monday);

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, { openCount: 0, completedCount: 0, mondayDate: monday });
    }

    const current = weekMap.get(weekKey)!;
    const isCompleted = task.status.toLowerCase() === "completed";
    if (isCompleted) {
      current.completedCount += 1;
    } else {
      current.openCount += 1;
    }
  }

  const summaries: WeeklySummaryItem[] = [];
  for (const [weekKey, data] of weekMap.entries()) {
    const sundayDate = new Date(data.mondayDate);
    sundayDate.setUTCDate(sundayDate.getUTCDate() + 6);

    summaries.push({
      weekStart: weekKey,
      weekEnd: formatDateOnly(sundayDate),
      openCount: data.openCount,
      completedCount: data.completedCount,
      totalCount: data.openCount + data.completedCount,
    });
  }

  // Sort weeks chronologically
  summaries.sort((a, b) => a.weekStart.localeCompare(b.weekStart));

  return summaries;
}

export async function getTasksByWeek(weekStartDate: string): Promise<TaskResponse[]> {
  const start = new Date(weekStartDate);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);

  const tasks = await db.orm.public.Task.select(...ALL_FIELDS)
    .where((t) => t.dateTime.gte(start))
    .where((t) => t.dateTime.lt(end))
    .orderBy((t) => t.dateTime.asc())
    .all();

  return tasks.map(formatTask);
}
