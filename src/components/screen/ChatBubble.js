"use client";

import React, { useEffect } from "react";
import LogoSvg from "../shared/LogoSvg";
import FormatMessage from "./Format/FormatMessage";

export default function ChatBubble({ message }) {
  const [isAI, setIsAI] = React.useState(false);

  useEffect(() => {
    setIsAI(message.sender !== "user");
  }, [message]);

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
              : " text-slate-800 dark:text-slate-200 rounded-tl-none"
          }
          transform transition-all duration-200 hover:shadow-lg
        `}
      >
        {/* Message Content */}
        {isAI ? (
          <FormatMessage message={message.content} />
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed">
            {typeof message.content === "object"
              ? message.content.text
              : message.content}
          </p>
        )}
      </div>
    </div>
  );
}
