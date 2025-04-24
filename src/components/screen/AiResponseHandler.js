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
  }, [userMessage, isTyping]);

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
