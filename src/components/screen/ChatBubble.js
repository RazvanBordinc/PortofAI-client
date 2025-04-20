"use client";

import React, { useEffect } from "react";
import LogoSvg from "../shared/LogoSvg";

export default function ChatBubble({ message }) {
  useEffect(() => {
    const isAI = message.sender !== "user";
    if (isAI) {
      if (message === "contact") {
        // Handle table response format
      }
    }
  }, [message]);
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {/* Avatar for AI - only shown for AI messages */}
      {!isUser && (
        <div className="self-end mb-2 mr-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20">
            <LogoSvg design="size-16" />
          </div>
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`
          max-w-[75%] p-3 rounded-2xl shadow-md 
          ${
            isUser
              ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-tr-none"
              : "  text-slate-800 dark:text-slate-200 rounded-tl-none"
          }
          transform transition-all duration-200 hover:shadow-lg
        `}
      >
        {/* Message Content */}
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}
