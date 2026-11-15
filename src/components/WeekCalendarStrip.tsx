"use client";

import React from "react";

interface WeekCalendarStripProps {
  currentWeekMonday: Date;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeekCalendarStrip({
  currentWeekMonday,
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
}: WeekCalendarStripProps) {
  // Generate 7 days starting from Monday
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekMonday);
    d.setDate(d.getDate() + i);
    return d;
  });

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const monthYearLabel = currentWeekMonday.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="w-full">
      {/* Week Navigation Header */}
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {monthYearLabel}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevWeek}
            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-none transition cursor-pointer"
            aria-label="Previous week"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onNextWeek}
            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-none transition cursor-pointer"
            aria-label="Next week"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 7 Days Row */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((dayDate, idx) => {
          const selected = isSameDay(dayDate, selectedDate);
          const dayNum = String(dayDate.getDate()).padStart(2, "0");
          const dayName = DAY_NAMES[idx];

          return (
            <button
              key={dayDate.toISOString()}
              type="button"
              onClick={() => onSelectDate(dayDate)}
              className={`flex flex-col items-center py-2.5 px-1 rounded-none transition cursor-pointer ${
                selected
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-100"
              }`}
            >
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  selected ? "text-blue-100" : "text-gray-400"
                }`}
              >
                {dayName}
              </span>
              <span className="text-sm font-bold mt-1">{dayNum}</span>
              {selected && <span className="w-1 h-1 rounded-full bg-white mt-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

