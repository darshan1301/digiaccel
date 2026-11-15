import { NextRequest, NextResponse } from "next/server";
import { getTaskById, updateTask, deleteTask } from "@/prisma/tasks.ts";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tasks/[id]
 * Fetch a single task by ID
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, error: "Invalid task ID" },
        { status: 400 }
      );
    }

    const task = await getTaskById(taskId);

    if (!task) {
      return NextResponse.json(
        { success: false, error: `Task with id ${taskId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("GET /api/tasks/[id] error:", error);
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
 * PUT /api/tasks/[id]
 * Update task attributes:
 * - title, description
 * - date, startTime, endTime OR dateTime, endTime
 * - priority
 * - status
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, error: "Invalid task ID" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const existing = await getTaskById(taskId);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Task with id ${taskId} not found` },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = {};

    if ("title" in body) {
      if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
        return NextResponse.json(
          { success: false, error: "Title cannot be empty" },
          { status: 400 }
        );
      }
      updates.title = body.title.trim();
    }

    if ("description" in body) {
      updates.description =
        typeof body.description === "string" ? body.description.trim() : null;
    }

    // Handle date, startTime, and endTime
    if ("date" in body || "startTime" in body || "endTime" in body || "dateTime" in body) {
      const baseDateStr = body.date || existing.dateStr;
      const sTime = body.startTime || existing.startTime || "09:00";

      if (body.date || body.startTime) {
        const startCandidate = new Date(`${baseDateStr}T${sTime}:00.000Z`);
        if (!isNaN(startCandidate.getTime())) {
          updates.dateTime = startCandidate.toISOString();
        }
      } else if (body.dateTime) {
        const parsed = new Date(body.dateTime);
        if (!isNaN(parsed.getTime())) {
          updates.dateTime = parsed.toISOString();
        }
      }

      if ("endTime" in body) {
        if (!body.endTime) {
          updates.endTime = null;
        } else if (typeof body.endTime === "string" && body.endTime.includes(":")) {
          const endCandidate = new Date(`${baseDateStr}T${body.endTime.trim()}:00.000Z`);
          if (!isNaN(endCandidate.getTime())) {
            updates.endTime = endCandidate.toISOString();
          }
        } else {
          const parsed = new Date(body.endTime);
          if (!isNaN(parsed.getTime())) {
            updates.endTime = parsed.toISOString();
          }
        }
      }
    }

    if ("priority" in body) {
      if (body.priority !== null && body.priority !== undefined) {
        const allowedPriorities = ["Low", "Medium", "High"];
        const formatted =
          typeof body.priority === "string"
            ? body.priority.charAt(0).toUpperCase() + body.priority.slice(1).toLowerCase()
            : null;
        if (!formatted || !allowedPriorities.includes(formatted)) {
          return NextResponse.json(
            { success: false, error: "Priority must be one of: Low, Medium, High" },
            { status: 400 }
          );
        }
        updates.priority = formatted;
      } else {
        updates.priority = null;
      }
    }

    if ("status" in body) {
      const s = String(body.status).toLowerCase();
      if (s === "completed") {
        updates.status = "Completed";
      } else if (s === "in progress" || s === "open") {
        updates.status = "In Progress";
      } else {
        return NextResponse.json(
          { success: false, error: "Status must be 'In Progress' or 'Completed'" },
          { status: 400 }
        );
      }
    }

    const updated = await updateTask(taskId, updates);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/tasks/[id] error:", error);
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
 * DELETE /api/tasks/[id]
 * Remove a task from the list
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, error: "Invalid task ID" },
        { status: 400 }
      );
    }

    const existing = await getTaskById(taskId);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Task with id ${taskId} not found` },
        { status: 404 }
      );
    }

    const deleted = await deleteTask(taskId);

    return NextResponse.json({
      success: true,
      message: `Task ${taskId} successfully deleted`,
      data: deleted,
    });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
