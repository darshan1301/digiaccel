import { NextRequest, NextResponse } from "next/server";
import { getTasksByWeek, getMondayOfWeek, formatDateOnly } from "@/prisma/tasks.ts";
import { seed } from "@/prisma/seed.ts";

export const dynamic = "force-dynamic";

/**
 * GET /api/tasks/weekly?start=YYYY-MM-DD
 * Returns all tasks for the specified week (Monday to Sunday).
 * If ?start= or ?weekStart= is omitted, defaults to the current week.
 */
export async function GET(request: NextRequest) {
  try {
    await seed();

    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get("start") ?? searchParams.get("weekStart");

    let weekMondayStr: string;

    if (startParam) {
      const parsed = new Date(startParam);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid start date format. Expected YYYY-MM-DD or ISO date string.",
          },
          { status: 400 }
        );
      }
      // Ensure the start date is aligned to that week's Monday
      const monday = getMondayOfWeek(parsed);
      weekMondayStr = formatDateOnly(monday);
    } else {
      // Default to current week's Monday
      const monday = getMondayOfWeek(new Date());
      weekMondayStr = formatDateOnly(monday);
    }

    const tasks = await getTasksByWeek(weekMondayStr);

    const sundayDate = new Date(weekMondayStr);
    sundayDate.setUTCDate(sundayDate.getUTCDate() + 6);

    return NextResponse.json({
      success: true,
      weekStart: weekMondayStr,
      weekEnd: formatDateOnly(sundayDate),
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("GET /api/tasks/weekly error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
