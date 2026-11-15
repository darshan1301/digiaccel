"use client";

import React from "react";

interface OnboardingProps {
  onGetStarted: () => void;
}

export function Onboarding({ onGetStarted }: OnboardingProps) {
  return (
    <div className="w-full h-full min-h-[750px] sm:min-h-[844px] flex flex-col bg-white select-none">
      {/* Top Blue Hero Section with Figma Geometric Zig-Zag Patterns */}
      <div className="relative flex-[1.4] bg-[#3B5AFB] overflow-hidden flex flex-col justify-between p-6">
        {/* Top-Right Decorative Arc */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full border-[20px] border-white/10 pointer-events-none" />

        {/* Upper-Left Zig-Zag Waves (Figma Screen 1) */}
        <div className="mt-8 ml-2">
          <svg
            width="120"
            height="70"
            viewBox="0 0 120 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white/30"
          >
            <path
              d="M2 12 L18 2 L34 12 L50 2 L66 12 L82 2 L98 12 L114 2"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 28 L18 18 L34 28 L50 18 L66 28 L82 18 L98 28 L114 18"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 44 L18 34 L34 44 L50 34 L66 44 L82 34 L98 44 L114 34"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 60 L18 50 L34 60 L50 50 L66 60 L82 50 L98 60 L114 50"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Lower-Right Zig-Zag Waves (Figma Screen 1) */}
        <div className="self-end mb-6 mr-2">
          <svg
            width="130"
            height="75"
            viewBox="0 0 130 75"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white/30"
          >
            <path
              d="M2 14 L20 2 L38 14 L56 2 L74 14 L92 2 L110 14 L128 2"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 32 L20 20 L38 32 L56 20 L74 32 L92 20 L110 32 L128 20"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 50 L20 38 L38 50 L56 38 L74 50 L92 38 L110 50 L128 38"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 68 L20 56 L38 68 L56 56 L74 68 L92 56 L110 68 L128 56"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Bottom White Card Section (Figma Screen 1) */}
      <div className="flex-1 bg-white px-7 py-8 flex flex-col justify-between">
        <div className="pt-2">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-gray-900 tracking-tight leading-tight">
            Manage What To Do
          </h1>
          <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-[280px]">
            The best way to manage what you have to do, don&apos;t forget your plans
          </p>
        </div>

        {/* Full-width "Get Started" Button */}
        <div className="pb-4">
          <button
            type="button"
            onClick={onGetStarted}
            className="w-full py-4 px-6 bg-[#3B5AFB] hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base rounded-none shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer text-center"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
