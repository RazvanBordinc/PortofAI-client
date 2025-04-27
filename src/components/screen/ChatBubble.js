"use client";

import React, { useEffect } from "react";
import LogoSvg from "../shared/LogoSvg";
import FormatMessage from "./Format/FormatMessage";

export default function ChatBubble({ message }) {
  const [isAI, setIsAI] = React.useState(false);

  useEffect(() => {
    setIsAI(message.sender !== "user");
  }, [message]);

  // Check if the message has JSON parsing errors
  const hasParseError = message.parseError || false;

  // Extract the content properly - handle both string and object formats
  const getMessageContent = () => {
    const content = message.content;

    if (typeof content === "string") {
      return content;
    }

    if (typeof content === "object" && content !== null) {
      // If content has a text property, use that
      if (content.text !== undefined) {
        return content.text;
      }

      // If it's some other object, convert to a readable string
      try {
        return JSON.stringify(content);
      } catch (e) {
        return "Error displaying message content";
      }
    }

    // Fallback for unexpected content type
    return String(content || "");
  };

  return (
    <div className={`flex ${!isAI ? "justify-end" : "justify-start"}`}>
      {/* Avatar for AI - only shown for AI messages */}
      {isAI && (
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
            !isAI
              ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-tr-none"
              : message.isError || hasParseError
              ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-tl-none"
              : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
          }
          transform transition-all duration-200 hover:shadow-lg
        `}
      >
        {/* Message Content */}
        {isAI ? (
          <FormatMessage message={message.content} />
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed">
            {getMessageContent()}
          </p>
        )}

        {/* Parse Error Notification (if present) */}
        {hasParseError && (
          <div className="mt-2 text-xs text-amber-700 dark:text-amber-400">
            <details>
              <summary className="cursor-pointer">
                Data parsing error (click to see details)
              </summary>
              <pre className="mt-1 text-xs whitespace-pre-wrap overflow-x-auto max-h-32 p-1 bg-amber-50 dark:bg-amber-900/20 rounded">
                {message.parseError}
              </pre>
            </details>
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`text-xs mt-1 ${
            !isAI
              ? "text-indigo-200"
              : message.isError || hasParseError
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
