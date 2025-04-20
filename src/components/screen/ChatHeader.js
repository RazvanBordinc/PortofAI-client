"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import LogoSvg from "../shared/LogoSvg";

export default function ChatHeader({ customTitle }) {
  const [typedText, setTypedText] = useState("");
  const fullText = customTitle || "ASK ANYTHING";
  const [currentIndex, setCurrentIndex] = useState(0);

  // Typing effect
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText((prev) => prev + fullText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 150);

      return () => clearTimeout(timeout);
    } else {
      // Reset after a delay to repeat
      const resetTimeout = setTimeout(() => {
        setTypedText("");
        setCurrentIndex(0);
      }, 3000);

      return () => clearTimeout(resetTimeout);
    }
  }, [currentIndex, fullText]);

  return (
    <motion.div
      className={`fixed top-0 w-full pb-3 z-10 backdrop-blur-sm py-2 transition-all duration-300 bg-gradient-to-r from-indigo-50/90 to-slate-100/90 dark:from-indigo-900/90 dark:to-slate-900/90 border-b border-slate-200/80 dark:border-indigo-800/30`}
      initial={customTitle ? "" : { y: -20, opacity: 0 }}
      animate={customTitle ? "" : { y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between ml-12 lg:ml-0 ">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <motion.div
              className="relative flex items-center justify-center h-10 w-10"
              whileHover={{ scale: 1.15, rotate: 5 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 10,
              }}
            >
              <LogoSvg className="size-20 text-white" />
            </motion.div>

            <div>
              <div className="flex items-center mt-0.5">
                <motion.div
                  className="h-0.5 w-8 bg-gradient-to-r from-indigo-500 to-transparent rounded-full"
                  animate={{ width: [0, 32, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                />
                <p className="text-sm font-medium ml-2 text-indigo-700 dark:text-indigo-300 min-w-[120px]">
                  {typedText}
                  <span className="animate-pulse">|</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
