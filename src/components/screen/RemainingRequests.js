"use client";

import React from "react";
import { MessageSquareDashed } from "lucide-react";

export default function RemainingRequests({ remaining, total = 15 }) {
  // Calculate percentage for progress bar
  const percentage = (remaining / total) * 100;

  // Determine color based on remaining requests
  const getColor = () => {
    if (remaining <= 0) return "bg-red-500 dark:bg-red-600";
    if (remaining <= 5) return "bg-amber-500 dark:bg-amber-600";
    return "bg-indigo-500 dark:bg-indigo-600";
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
          <MessageSquareDashed size={15} className="mr-1" />
          <span>Daily messages remaining</span>
        </div>
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {remaining} / {total}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${getColor()} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {/* Status message */}
      {remaining <= 0 && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          You&apos;ve reached your daily limit. Please try again tomorrow.
        </p>
      )}
      {remaining > 0 && remaining <= 5 && (
        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
          You&apos;re running low on messages for today.
        </p>
      )}
    </div>
  );
}
