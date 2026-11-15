import { NextRequest, NextResponse } from "next/server";
import { getTaskById, updateTaskStatus } from "@/prisma/tasks.ts";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/tasks/[id]/status
 * Update status of a task: "In Progress" or "Completed"
 * Body: { status: "Completed" | "In Progress" }
 */
export async function PATCH(
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
    if (!body || typeof body !== "object" || !("status" in body)) {
      return NextResponse.json(
        {
          success: false,
          error: "Request body must include a 'status' field",
        },
        { status: 400 }
      );
    }

    const s = String(body.status).toLowerCase().trim();
    let normalizedStatus: string;
    if (s === "completed") {
      normalizedStatus = "Completed";
    } else if (s === "in progress" || s === "open") {
      normalizedStatus = "In Progress";
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Status must be either 'In Progress' or 'Completed'",
        },
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

    const updated = await updateTaskStatus(taskId, normalizedStatus);

    return NextResponse.json({
      success: true,
      message: `Task ${taskId} status updated to '${normalizedStatus}'`,
      data: updated,
    });
  } catch (error) {
    console.error("PATCH /api/tasks/[id]/status error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
