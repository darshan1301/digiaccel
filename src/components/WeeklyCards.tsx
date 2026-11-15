"use client";

import React from "react";
import { WeeklySummaryData } from "@/types/task.ts";
import { CheckIcon } from "./Icons.tsx";

interface WeeklyCardsProps {
  summary: WeeklySummaryData | null;
}

export function WeeklyCards({ summary }: WeeklyCardsProps) {
  const completedCount = summary?.completedCount ?? 0;
  const openCount = summary?.openCount ?? 0;
  const totalCount = summary?.totalCount ?? (completedCount + openCount);
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="w-full space-y-4">
      {/* Side-by-side Summary Cards */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Task Complete Card */}
        <div className="bg-[#EEF4FF] border border-blue-100 rounded-none p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-none bg-blue-600 flex items-center justify-center">
              <CheckIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold text-gray-700">Task Complete</span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {String(completedCount).padStart(2, "0")}
            </span>
            <span className="text-[11px] font-medium text-gray-400">this Week</span>
          </div>
        </div>

        {/* Task Pending Card */}
        <div className="bg-[#FFF0F0] border border-red-100 rounded-none p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-none bg-red-500 flex items-center justify-center text-white">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-700">Task Pending</span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {String(openCount).padStart(2, "0")}
            </span>
            <span className="text-[11px] font-medium text-gray-400">this Week</span>
          </div>
        </div>
      </div>

      {/* Weekly Progress Bar */}
      <div className="bg-white border border-gray-100 rounded-none p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-gray-800">Weekly Progress</span>
          <span className="font-semibold text-blue-600">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-none overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-none transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

