"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LogoSvg from "../shared/LogoSvg";
import TextFormatter from "./Format/TextFormatter";

export default function StreamingBubble({ message }) {
  const [currentContent, setCurrentContent] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);
  const [hasRichContent, setHasRichContent] = useState(false);
  const contentRef = useRef("");

  console.log(
    "StreamingBubble rendering with:",
    message.id,
    message.isStreaming,
    typeof message.content,
    message.content
  );

  // Helper function to clean response text - SIMPLIFIED
  const cleanResponseText = (text) => {
    if (!text) return text;

    let cleaned = text;

    // ONLY clean what's absolutely necessary
    if (!isStreaming) {
      // Remove trailing JSON artifacts and format tags
      cleaned = cleaned.replace(/[\}\]:\}\]]+$/, "");
      cleaned = cleaned.replace(/\[\/format\]?\s*$/g, "");
      cleaned = cleaned.replace(/\}\]\[\/format:?\s*$/g, "");
      cleaned = cleaned.replace(/[\{\}\[\]]+$/g, "");

      // Remove duplicate text (when entire text is repeated)
      const halfLength = Math.floor(cleaned.length / 2);
      const firstHalf = cleaned.substring(0, halfLength);
      const secondHalf = cleaned.substring(halfLength);

      if (firstHalf === secondHalf && firstHalf.length > 10) {
        cleaned = firstHalf;
      }
    }

    return cleaned;
  };

  // Set up the blinking cursor effect - only when streaming
  useEffect(() => {
    let cursorInterval;

    if (isStreaming) {
      cursorInterval = setInterval(() => {
        setCursorVisible((prev) => !prev);
      }, 530);
    }

    return () => {
      if (cursorInterval) clearInterval(cursorInterval);
    };
  }, [isStreaming]);

  // Update the displayed content when the message changes
  useEffect(() => {
    let newContent = "";
    console.log("StreamingBubble content update triggered:", message.content);

    // Extract the content properly based on its type
    if (typeof message.content === "string") {
      newContent = message.content;
      console.log("Content is string:", newContent.substring(0, 30) + "...");
    } else if (message.content && typeof message.content.text === "string") {
      newContent = message.content.text;
      console.log(
        "Content is object with text:",
        newContent.substring(0, 30) + "..."
      );
    } else if (message.content) {
      // Try to get string representation
      newContent = String(message.content);
      console.log(
        "Content converted to string:",
        newContent.substring(0, 30) + "..."
      );
    }

    // Only update if content actually changed
    if (newContent !== contentRef.current) {
      console.log("Content changed, updating state");
      contentRef.current = newContent;
      setCurrentContent(newContent);
      checkForRichContent(newContent);
      setIsAnimating(true);

      const timeout = setTimeout(() => {
        setIsAnimating(false);
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [message.content]);

  // Detect when streaming has stopped
  useEffect(() => {
    console.log("Streaming status check:", message.isStreaming, isStreaming);
    if (message.isStreaming === false && isStreaming === true) {
      console.log("Streaming ended, cleaning content");
      setIsStreaming(false);
      setCursorVisible(false);

      const finalCleaned = cleanResponseText(currentContent);
      if (finalCleaned !== currentContent) {
        console.log("Cleaned content after streaming");
        setCurrentContent(finalCleaned);
      }
    }
  }, [message.isStreaming, isStreaming, currentContent]);

  // Check if the content contains rich elements like emails, links, etc.
  const checkForRichContent = (content) => {
    if (typeof content !== "string") {
      setHasRichContent(false);
      return;
    }

    // Check for emails
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    if (emailPattern.test(content)) {
      setHasRichContent(true);
      return;
    }

    // Check for markdown links
    if (/\[.*\]\(.*\)/.test(content)) {
      setHasRichContent(true);
      return;
    }

    // Check for plain URLs
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    if (urlPattern.test(content)) {
      setHasRichContent(true);
      return;
    }

    // Check for markdown formatting
    if (
      /\*\*.*\*\*/.test(content) ||
      /\*[^*].*\*/.test(content) ||
      /`.*`/.test(content)
    ) {
      setHasRichContent(true);
      return;
    }

    setHasRichContent(false);
  };

  return (
    <div className="flex justify-start">
      {console.log(
        "Rendering content:",
        currentContent.substring(0, 30) + "..."
      )}
      {/* Avatar for AI - no animation */}
      <div className="self-end mb-2 mr-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20">
          <LogoSvg design="size-16" />
        </div>
      </div>

      {/* Message Bubble - with enhanced styling for rich content */}
      <div
        className={`max-w-[75%] p-3 rounded-2xl shadow-md break-words bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none hover:shadow-lg ${
          hasRichContent
            ? "border border-indigo-100 dark:border-indigo-900/40"
            : ""
        }`}
      >
        {/* Message Content with Animation only for the text chunks */}
        <div className="whitespace-pre-wrap leading-relaxed relative break-words">
          {/* Add a highlight effect for new content */}
          <AnimatePresence>
            {isAnimating && (
              <motion.div
                className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg"
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>

          {/* Format the text with proper styling */}
          {currentContent ? (
            <TextFormatter text={currentContent} isAnimated={isStreaming} />
          ) : (
            <span className="text-slate-400">Loading...</span>
          )}

          {/* Blinking cursor - only shown when streaming */}
          {isStreaming && (
            <span
              className={`inline-block w-2 h-4 ml-0.5 bg-indigo-500 dark:bg-indigo-400 ${
                cursorVisible ? "opacity-100" : "opacity-0"
              } transition-opacity duration-100`}
            ></span>
          )}
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
