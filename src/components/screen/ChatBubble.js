"use client";

import React, { useEffect } from "react";
import LogoSvg from "../shared/LogoSvg";
import FormatMessage from "./Format/FormatMessage";
import TextFormatter from "./Format/TextFormatter";

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

  // Check if the message has rich styling enhancements
  const hasRichStyling = (content) => {
    // Check if the content contains email or links (markdown style or plaintext)
    if (typeof content !== "string") return false;

    // Check for emails
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    if (emailPattern.test(content)) return true;

    // Check for markdown links
    if (/\[.*\]\(.*\)/.test(content)) return true;

    // Check for plain URLs
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    if (urlPattern.test(content)) return true;

    // Check for markdown formatting
    if (
      /\*\*.*\*\*/.test(content) ||
      /\*[^*].*\*/.test(content) ||
      /`.*`/.test(content)
    )
      return true;

    return false;
  };

  // Apply elevated styling for messages with rich content
  const getMessageStyle = () => {
    // Base styles
    let baseStyles = `
      max-w-[75%] p-3 rounded-2xl 
      ${
        !isAI
          ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-tr-none shadow-md"
          : message.isError || hasParseError
          ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-tl-none shadow-md"
          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-md"
      }
      transition-all duration-200 hover:shadow-lg
    `;

    // Enhanced styles for rich content (emails, links, etc.)
    const content = getMessageContent();
    if (isAI && hasRichStyling(content)) {
      baseStyles += " border border-indigo-100 dark:border-indigo-900/40";
    }

    return baseStyles;
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

      {/* Message Bubble with enhanced styling */}
      <div className={getMessageStyle()}>
        {/* Message Content */}
        {isAI ? (
          typeof message.content === "object" && message.content.format ? (
            <FormatMessage message={message.content} />
          ) : (
            <div className="whitespace-pre-wrap leading-relaxed break-words overflow-hidden">
              {/* Always use TextFormatter for AI messages to handle rich content */}
              <TextFormatter text={getMessageContent()} isAnimated={false} />
            </div>
          )
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed break-words overflow-hidden">
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
