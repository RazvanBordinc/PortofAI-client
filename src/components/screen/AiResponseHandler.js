"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function AiResponseHandler({
  userMessage,
  onAiResponse,
  isTyping,
  setIsTyping,
}) {
  const targetRef = useRef(null);

  const scrollDown = () => {
    targetRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!userMessage || !isTyping) return;

    // Show typing indicator
    // Simulate AI thinking time - in a real app, this would be an API call
    const thinkingTime = Math.floor(Math.random() * 1000) + 800; // Random time between 800-1800ms

    const timer = setTimeout(() => {
      // Don't proceed if typing was cancelled
      if (!isTyping) return;

      // In a real app, you would get the response and format from your backend
      // For demo purposes, we'll use a placeholder response
      const placeholderResponses = [
        "I understand what you're saying. Would you like to know more about my skills and experience?",
        "That's an interesting point. Let me share some thoughts on that.",
        "I've analyzed your question and here's what I can tell you about my background.",
        "Based on your interest, here's some relevant information about my work.",
        "I'm here to help with that. Here's what you should know about my expertise.",
      ];

      const responseIndex = Math.floor(
        Math.random() * placeholderResponses.length
      );

      // The format is now inside the content object - matching the structure of user messages
      const aiMessage = {
        id: Date.now(),
        content: {
          text: placeholderResponses[responseIndex],
          format: "table", // This would come from your backend
        },
        sender: "ai",
        timestamp: new Date().toISOString(),
      };

      onAiResponse(aiMessage);
    }, thinkingTime);

    return () => clearTimeout(timer);
  }, [userMessage, onAiResponse, isTyping]);

  useEffect(() => {
    scrollDown();
  }, [isTyping]);

  return (
    <>
      {isTyping && (
        <div className="flex justify-start">
          <div className="p-4 rounded-lg max-w-[80%] text-slate-800 dark:text-slate-200 shadow-sm">
            <div className="flex items-center">
              <motion.div
                className="relative h-8 w-32 overflow-hidden rounded-md"
                ref={targetRef}
              >
                {/* Animated gradient background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 via-indigo-500/40 to-indigo-400/20 dark:from-indigo-500/30 dark:via-indigo-600/50 dark:to-indigo-500/30"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "linear",
                  }}
                />

                {/* Brain waves animation */}
                <svg
                  viewBox="0 0 100 30"
                  className="absolute inset-0 w-full h-full opacity-70"
                >
                  <motion.path
                    d="M 0,15 Q 12.5,5 25,15 T 50,15 T 75,15 T 100,15"
                    stroke="rgb(99, 102, 241)"
                    strokeWidth="2"
                    fill="transparent"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: [0, 1, 0],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.path
                    d="M 0,15 Q 12.5,25 25,15 T 50,15 T 75,15 T 100,15"
                    stroke="rgba(129, 140, 248, 0.6)"
                    strokeWidth="2"
                    fill="transparent"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: [0, 1, 0],
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{
                      duration: 2,
                      delay: 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
