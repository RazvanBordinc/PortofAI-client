"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PanelRightClose,
  PanelRightOpen,
  MessageSquare,
  Settings,
  Sun,
  Moon,
  HelpCircle,
} from "lucide-react";
import { useTheme } from "@/lib/utils/ThemeContext";

export default function Sidebar({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { darkMode, toggleTheme } = useTheme();

  // Check if screen is mobile on mount and when window resizes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    // Initial check
    checkMobile();

    // Add event listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Simplified animation variants
  const sidebarVariants = {
    open: {
      width: isMobile ? "240px" : "240px",
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        duration: 0.3,
      },
    },
    closed: {
      width: isMobile ? "0" : "60px",
      x: isMobile ? "-100%" : 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        duration: 0.3,
      },
    },
  };

  const navigationItems = [
    { name: "Chats", icon: <MessageSquare size={20} /> },
    { name: "Info", icon: <HelpCircle size={20} /> },
    { name: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile menu button - visible only when sidebar is closed on mobile */}
      {!isOpen && isMobile && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={toggleSidebar}
          className="fixed top-2 left-2 z-40 p-3 text-black dark:text-indigo-500"
        >
          <PanelRightOpen size={30} />
        </motion.button>
      )}

      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <motion.div
        className={`fixed top-0 left-0 h-screen ${
          darkMode
            ? "bg-slate-900 border-r border-indigo-900/40"
            : "bg-white border-r border-slate-200"
        } text-slate-700 dark:text-slate-200 z-40 shadow-lg overflow-hidden flex flex-col`}
        variants={sidebarVariants}
        animate={isOpen ? "open" : "closed"}
        initial={isMobile ? "closed" : "open"}
      >
        <div
          className={`flex items-center justify-between p-4 ${
            darkMode
              ? "bg-gradient-to-r from-indigo-900 to-slate-900 border-b border-indigo-800/30"
              : "bg-gradient-to-r from-indigo-50 to-slate-100 border-b border-slate-200"
          }`}
        >
          <div
            className={`${
              isOpen ? "block" : "hidden"
            } font-bold text-xl tracking-wide ${
              darkMode ? "text-white" : "text-indigo-700"
            }`}
          >
            PortofAI
          </div>
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-full ${
              darkMode
                ? "hover:bg-indigo-800/50 text-indigo-300"
                : "hover:bg-indigo-100 text-indigo-600"
            } transition-colors cursor-pointer`}
          >
            {isOpen ? (
              <PanelRightClose size={20} />
            ) : (
              <PanelRightOpen size={20} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div
          className={`flex-1 overflow-y-auto py-4 ${
            darkMode ? "divide-y divide-slate-800" : "divide-y divide-slate-200"
          }`}
        >
          {navigationItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center px-4 py-3 cursor-pointer ${
                darkMode
                  ? "hover:bg-indigo-900/30 text-slate-300"
                  : "hover:bg-indigo-50 text-slate-700"
              } transition-all hover:pl-6`}
            >
              <div
                className={`flex items-center justify-center ${
                  darkMode ? "text-indigo-400" : "text-indigo-600"
                }`}
              >
                {item.icon}
              </div>
              <span className={`ml-3 ${isOpen ? "block" : "hidden"}`}>
                {item.name}
              </span>
            </div>
          ))}
        </div>

        {/* Theme toggle button */}
        <div
          className={`p-4 ${
            darkMode ? "border-t border-slate-800" : "border-t border-slate-200"
          }`}
        >
          <div
            className={`flex items-center px-4 py-2 cursor-pointer ${
              darkMode
                ? "hover:bg-indigo-900/30 text-slate-300"
                : "hover:bg-indigo-50 text-slate-700"
            } rounded-lg transition-all ${!isOpen ? "justify-center" : ""}`}
            onClick={toggleTheme}
          >
            <motion.div
              animate={{ rotate: darkMode ? 0 : 360 }}
              transition={{ duration: 0.3 }}
              className={darkMode ? "text-yellow-400" : "text-indigo-600"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.div>
            <span className={`ml-3 ${isOpen ? "block" : "hidden"}`}>
              {darkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </div>
        </div>
      </motion.div>

      <div
        className={`transition-all duration-300 ${
          isOpen ? (isMobile ? "ml-0" : "ml-60") : "ml-0 md:ml-15  "
        }`}
      >
        {children}
      </div>
    </>
  );
}
