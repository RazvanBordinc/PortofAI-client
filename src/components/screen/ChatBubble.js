"use client";

import React from "react";
import { Bot, User } from "lucide-react";

export default function ChatBubble({ message }) {
  const isUser = message.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {/* Avatar for AI - only shown for AI messages */}
      {!isUser && (
        <div className="self-end mb-2 mr-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20">
            <Bot size={16} className="text-indigo-600 dark:text-indigo-400" />
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

      {/* Avatar for User - only shown for user messages */}
      {isUser && (
        <div className="self-end mb-2 ml-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 dark:bg-indigo-600/30">
            <User size={16} className="text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
      )}
    </div>
  );
}
