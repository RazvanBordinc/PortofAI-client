"use client";

import React from "react";

export default function ChatMessage({ message }) {
  const isUser = message.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {/* Message bubble */}
      <div
        className={`max-w-[80%] p-4 rounded-lg ${
          isUser
            ? "bg-indigo-600 text-white rounded-br-none"
            : message.isError
            ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-bl-none"
            : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none"
        } shadow-sm`}
      >
        {/* Message content */}
        <div className="whitespace-pre-wrap">{message.content}</div>

        {/* Timestamp */}
        <div
          className={`text-xs mt-1 ${
            isUser
              ? "text-indigo-200"
              : message.isError
              ? "text-red-500 dark:text-red-400"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
