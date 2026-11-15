import { NextResponse } from "next/server";
import { getWeeklySummary } from "@/prisma/tasks.ts";
import { seed } from "@/prisma/seed.ts";

export const dynamic = "force-dynamic";

/**
 * GET /api/tasks/weekly-summary
 * Groups tasks by week (starting on Monday and ending on Sunday).
 * Returns summary cards showing:
 * - weekStart (Monday YYYY-MM-DD)
 * - weekEnd (Sunday YYYY-MM-DD)
 * - openCount (Tasks marked "In Progress" or open)
 * - completedCount (Tasks marked "Completed")
 * - totalCount
 */
export async function GET() {
  try {
    await seed();

    const summaries = await getWeeklySummary();

    return NextResponse.json({
      success: true,
      count: summaries.length,
      data: summaries,
    });
  } catch (error) {
    console.error("GET /api/tasks/weekly-summary error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
