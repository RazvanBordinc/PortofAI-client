"use client";

import React, { useState, useEffect } from "react";
import LogoSvg from "../shared/LogoSvg";

export default function StreamingBubble({ message }) {
  const [currentContent, setCurrentContent] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  // Set up the blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530); // blink every 530ms

    return () => clearInterval(cursorInterval);
  }, []);

  // Update the displayed content when the message changes
  useEffect(() => {
    if (typeof message.content === "string") {
      setCurrentContent(message.content);
    } else if (message.content && typeof message.content.text === "string") {
      setCurrentContent(message.content.text);
    }
  }, [message.content]);

  return (
    <div className="flex justify-start">
      {/* Avatar for AI */}
      <div className="self-end mb-2 mr-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20">
          <LogoSvg design="size-16" />
        </div>
      </div>

      {/* Message Bubble */}
      <div className="max-w-[75%] p-3 rounded-2xl shadow-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none transform transition-all duration-200 hover:shadow-lg">
        {/* Message Content */}
        <div className="whitespace-pre-wrap leading-relaxed">
          {currentContent}
          <span
            className={`inline-block w-2 h-4 ml-0.5 bg-indigo-500 dark:bg-indigo-400 ${
              cursorVisible ? "opacity-100" : "opacity-0"
            } transition-opacity duration-100`}
          ></span>
        </div>

        {/* Timestamp */}
        <div className="text-xs mt-1 text-slate-500 dark:text-slate-400">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
