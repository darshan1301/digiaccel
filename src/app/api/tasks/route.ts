import { NextRequest, NextResponse } from "next/server";
import { createTask, listTasks } from "@/prisma/tasks.ts";
import { seed } from "@/prisma/seed.ts";

export const dynamic = "force-dynamic";

/**
 * GET /api/tasks
 * Lists all tasks, with optional search keyword filtering:
 * e.g. /api/tasks?q=setup or /api/tasks?search=architecture
 */
export async function GET(request: NextRequest) {
  try {
    await seed();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") ?? searchParams.get("search") ?? undefined;

    const tasks = await listTasks(query);

    return NextResponse.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Creates a new task with fields:
 * - title: string (mandatory)
 * - date: string (YYYY-MM-DD) OR dateTime: string (mandatory)
 * - startTime?: string (HH:mm, e.g. "10:00")
 * - endTime?: string (HH:mm, e.g. "12:00") OR endDateTime: string
 * - description?: string (optional)
 * - priority?: "Low" | "Medium" | "High" (optional)
 * - status?: "In Progress" | "Completed" (optional, default "In Progress")
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { title, description, date, startTime, endTime, dateTime, priority, status } = body;

    // Validate Title (mandatory)
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Title is mandatory and cannot be empty" },
        { status: 400 }
      );
    }

    // Determine Start DateTime & End DateTime
    let finalStartIso: string;
    let finalEndIso: string | null = null;

    if (date && typeof date === "string") {
      const sTime = typeof startTime === "string" && startTime.trim() ? startTime.trim() : "09:00";
      const startCandidate = new Date(`${date}T${sTime}:00.000Z`);
      if (isNaN(startCandidate.getTime())) {
        return NextResponse.json(
          { success: false, error: "Invalid date or start time format" },
          { status: 400 }
        );
      }
      finalStartIso = startCandidate.toISOString();

      if (endTime && typeof endTime === "string" && endTime.trim()) {
        const endCandidate = new Date(`${date}T${endTime.trim()}:00.000Z`);
        if (!isNaN(endCandidate.getTime())) {
          finalEndIso = endCandidate.toISOString();
        }
      }
    } else if (dateTime) {
      const parsedStart = new Date(dateTime);
      if (isNaN(parsedStart.getTime())) {
        return NextResponse.json(
          { success: false, error: "Invalid dateTime format" },
          { status: 400 }
        );
      }
      finalStartIso = parsedStart.toISOString();

      if (endTime) {
        const parsedEnd = new Date(endTime);
        if (!isNaN(parsedEnd.getTime())) {
          finalEndIso = parsedEnd.toISOString();
        }
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Date & Time is mandatory (provide 'date' or 'dateTime')" },
        { status: 400 }
      );
    }

    // Validate Priority (optional: Low, Medium, High)
    let formattedPriority: string | null = null;
    if (priority !== undefined && priority !== null) {
      const allowedPriorities = ["Low", "Medium", "High"];
      formattedPriority =
        typeof priority === "string"
          ? priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()
          : null;

      if (!formattedPriority || !allowedPriorities.includes(formattedPriority)) {
        return NextResponse.json(
          {
            success: false,
            error: "Priority must be one of: Low, Medium, High",
          },
          { status: 400 }
        );
      }
    }

    // Validate Status (optional: In Progress, Completed, open)
    let taskStatus = "In Progress";
    if (status !== undefined && status !== null) {
      const s = String(status).toLowerCase();
      if (s === "completed") {
        taskStatus = "Completed";
      } else if (s === "in progress" || s === "open") {
        taskStatus = "In Progress";
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Status must be 'In Progress' or 'Completed'",
          },
          { status: 400 }
        );
      }
    }

    const task = await createTask({
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : null,
      dateTime: finalStartIso,
      endTime: finalEndIso,
      priority: formattedPriority,
      status: taskStatus,
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
