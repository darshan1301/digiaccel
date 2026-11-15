"use client";

import React from "react";
import { PlusIcon } from "./Icons.tsx";

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <div className="fixed bottom-6 inset-x-0 flex justify-center pointer-events-none z-30">
      <button
        type="button"
        onClick={onClick}
        className="pointer-events-auto w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-white"
        aria-label="Add new task"
      >
        <PlusIcon className="w-7 h-7" />
      </button>
    </div>
  );
}

