"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trash2, RotateCcw, MessageSquare, X } from "lucide-react";

export default function ChatHistorySidebar({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onRefreshHistory,
  isLoading,
  error,
}) {
  // Group messages by conversation (each user message starts a new conversation)
  const getConversationGroups = () => {
    if (!history || history.length === 0) return [];

    const groups = [];
    let currentGroup = [];

    for (const message of history) {
      // User message starts a new conversation group
      if (message.sender === "user") {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
        }
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    }

    // Add the last group if not empty
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  };

  const conversationGroups = getConversationGroups();

  // Format timestamp for display
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  };

  // Get preview text (max 40 chars)
  const getPreviewText = (text) => {
    if (!text) return "";
    return text.length > 40 ? text.substring(0, 40) + "..." : text;
  };

  return (
    <>
      {/* Overlay when sidebar is open */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        className="fixed top-0 right-0 h-screen w-72 md:w-80 bg-white dark:bg-slate-900 shadow-xl z-50 flex flex-col"
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/30">
          <h2 className="font-medium text-lg text-slate-800 dark:text-white flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-indigo-500" />
            Chat History
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800/50 text-slate-600 dark:text-slate-300 curosr-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action buttons */}
        <div className="p-2 border-b border-slate-200 dark:border-slate-800 flex space-x-2">
          <button
            onClick={onRefreshHistory}
            disabled={isLoading}
            className="flex-1 py-2 px-3 rounded-md text-sm font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-colors flex items-center justify-cente cursor-pointer"
          >
            <RotateCcw
              size={16}
              className={`mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={onClearHistory}
            disabled={isLoading || !history || history.length === 0}
            className="flex-1 py-2 px-3 rounded-md text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/40 transition-colors flex items-center justify-center cursor-pointer"
          >
            <Trash2 size={16} className="mr-2" />
            Clear
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="p-4 m-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md text-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : history && history.length > 0 ? (
            <div className="p-2">
              {conversationGroups.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className="mb-3 p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700"
                >
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {formatTime(group[0]?.timestamp)}
                  </div>

                  <div className="text-sm text-slate-800 dark:text-slate-200 font-medium mb-1">
                    {getPreviewText(group[0]?.content)}
                  </div>

                  {group.length > 1 && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 italic">
                      {group.length} message{group.length > 1 ? "s" : ""} in
                      this conversation
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-slate-500 dark:text-slate-400 text-sm">
              <MessageSquare size={24} className="mb-2 opacity-50" />
              <p>No chat history found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-xs text-center text-slate-500 dark:text-slate-400">
          Chat history is stored for 24 hours
        </div>
      </motion.div>
    </>
  );
}
