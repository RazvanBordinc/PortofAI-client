"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Info } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  isError = false,
}) {
  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-md w-11/12 
              rounded-xl shadow-2xl z-50 overflow-hidden
              ${
                isError
                  ? "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              }`}
          >
            {/* Header */}
            <div
              className={`p-4 flex items-center justify-between
              ${
                isError
                  ? "border-b border-red-200 dark:border-red-900"
                  : "border-b border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {isError ? (
                  <AlertTriangle
                    className="text-red-500 dark:text-red-400"
                    size={20}
                  />
                ) : (
                  <Info
                    className="text-indigo-500 dark:text-indigo-400"
                    size={20}
                  />
                )}
                <h3
                  className={`font-medium ${
                    isError
                      ? "text-red-700 dark:text-red-400"
                      : "text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {title || (isError ? "Error" : "Information")}
                </h3>
              </div>
              <button
                onClick={onClose}
                className={`p-1 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 
                  transition-colors
                  ${
                    isError
                      ? "text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div
              className={`p-5 ${
                isError
                  ? "text-red-700 dark:text-red-300"
                  : "text-slate-700 dark:text-slate-300"
              }`}
            >
              {children}
            </div>

            {/* Footer */}
            <div
              className={`p-4 flex justify-end
              ${
                isError
                  ? "border-t border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/50"
                  : "border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
              }`}
            >
              <button
                type="button"
                onClick={onClose}
                className={`py-2 px-4 cursor-pointer rounded-md font-medium text-sm
                  ${
                    isError
                      ? "bg-red-500 hover:bg-red-600 text-white dark:bg-red-700 dark:hover:bg-red-600"
                      : "bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500"
                  } transition-colors`}
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
