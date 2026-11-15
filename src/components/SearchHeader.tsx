"use client";

import React from "react";
import { SearchIcon, ArrowLeftIcon, CloseIcon } from "./Icons.tsx";

interface SearchHeaderProps {
  value: string;
  isSearchActive: boolean;
  onChange: (val: string) => void;
  onActivate: () => void;
  onClearOrBack: () => void;
}

export function SearchHeader({
  value,
  isSearchActive,
  onChange,
  onActivate,
  onClearOrBack,
}: SearchHeaderProps) {
  return (
    <div className="flex items-center gap-3 w-full">
      {isSearchActive && (
        <button
          type="button"
          onClick={onClearOrBack}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
          aria-label="Back to home"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
      )}

      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onFocus={onActivate}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search for a task"
          className="w-full pl-4 pr-10 py-3 text-sm text-gray-800 placeholder-gray-400 bg-white border border-gray-200 rounded-none shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
        />

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-1.5">
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition cursor-pointer"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          ) : (
            <SearchIcon className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
}

