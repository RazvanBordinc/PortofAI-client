// Update src/components/screen/ChatHeader.js to add a history button

"use client";

import React from "react";
import { MessageSquare, History } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatHeader({ onHistoryClick }) {
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

        {/* History button */}
        <button
          onClick={onHistoryClick}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors cursor-pointer"
          title="View Chat History"
        >
          <History size={16} />
        </button>
      </div>
    </motion.div>
  );
}
