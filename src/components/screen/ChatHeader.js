"use client";

import React from "react";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatHeader() {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 flex items-center justify-center px-4 md:px-6 shadow-sm"
    >
      <div className="max-w-3xl w-full flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mr-3">
            <MessageSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-white">
            PortofAI Chat
          </h1>
        </div>

        <div className="flex items-center space-x-1">
          <motion.div
            className="h-2 w-2 rounded-full bg-green-500"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Online
          </span>
        </div>
      </div>
    </motion.div>
  );
}
