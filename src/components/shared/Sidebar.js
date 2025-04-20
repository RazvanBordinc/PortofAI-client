"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PanelRightClose,
  PanelRightOpen,
  MessageSquare,
  Settings,
  Sun,
  Moon,
  Info,
  Plus,
} from "lucide-react";
import { useTheme } from "@/lib/utils/ThemeContext";
import Modal from "./Modal";

export default function Sidebar({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const pathname = usePathname();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [isErrorModal, setIsErrorModal] = useState(false);

  // Function to show modal with specified content
  const showModal = (content, title = "Information", isError = false) => {
    setModalContent(content);
    setModalTitle(title);
    setIsErrorModal(isError);
    setIsModalOpen(true);
  };

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

  // Handle plus button click
  const handlePlusClick = () => {
    showModal(
      "Feature unavailable to avoid costs since this is a portfolio project :)",
      "New Chat",
      false
    );
  };

  // Handle files button click
  const handleFilesClick = () => {
    showModal("Feature will be available soon", "Files", false);
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

  // Predefined chat navigation items
  const chatItems = [
    {
      name: "Current Chat",
      icon: <MessageSquare size={20} />,
      path: "/",
    },
  ];

  // Other navigation items
  const navigationItems = [
    {
      name: "Info",
      icon: <Info size={20} />,
      path: "/info",
    },
    {
      name: "Settings",
      icon: <Settings size={20} />,
      path: "/settings",
    },
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

      {/* Modal Component */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        isError={isErrorModal}
      >
        <p>{modalContent}</p>
      </Modal>

      {/* Sidebar */}
      <motion.div
        className="fixed top-0 left-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-indigo-900/40 text-slate-700 dark:text-slate-200 z-40 shadow-lg overflow-hidden flex flex-col"
        variants={sidebarVariants}
        animate={isOpen ? "open" : "closed"}
        initial={isMobile ? "closed" : "open"}
      >
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-slate-100 dark:from-indigo-900 dark:to-slate-900 border-b border-slate-200 dark:border-indigo-800/30">
          <div
            className={`${
              isOpen ? "block" : "hidden"
            } font-bold text-xl tracking-wide text-indigo-700 dark:text-white`}
          >
            PortofAI
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800/50 text-indigo-600 dark:text-indigo-300 transition-colors cursor-pointer"
          >
            {isOpen ? (
              <PanelRightClose size={20} />
            ) : (
              <PanelRightOpen size={20} />
            )}
          </button>
        </div>

        {/* Chat Navigation */}
        <div className="flex-1 overflow-y-auto">
          {isOpen && (
            <div className="px-4 py-2 mt-2 flex items-center justify-between">
              <h3 className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Chats
              </h3>

              <Plus
                onClick={handlePlusClick}
                className="hover:scale-[1.2] transition-all cursor-pointer rounded-full p-0.5 hover:bg-indigo-600/50 dark:hover:bg-indigo-800/50"
                size={26}
              />
            </div>
          )}
          <div className="gap-y-1 grid">
            {chatItems.map((item, index) => (
              <Link href={item.path} key={index}>
                <div
                  className={`flex items-center px-4 py-2 cursor-pointer 
                    ${
                      pathname === item.path
                        ? "bg-indigo-300 dark:bg-indigo-950 text-indigo-700 dark:text-white border-l-2 border-indigo-500"
                        : "hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300"
                    } transition-all hover:pl-6`}
                >
                  <div
                    className={`flex items-center justify-center 
                      ${
                        pathname === item.path
                          ? "text-indigo-500"
                          : "text-indigo-600 dark:text-indigo-400"
                      }`}
                  >
                    {item.icon}
                  </div>
                  <span className={`ml-3 ${isOpen ? "block" : "hidden"}`}>
                    {item.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Other Navigation */}
          {isOpen && (
            <div className="px-4 py-2 mt-4">
              <h3 className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Navigation
              </h3>
            </div>
          )}
          <div className="divide-y divide-slate-200/70 dark:divide-slate-800/30">
            {navigationItems.map((item, index) => (
              <Link href={item.path} key={index}>
                <div
                  className={`flex items-center px-4 py-3 cursor-pointer 
                    ${
                      pathname === item.path
                        ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-white border-l-2 border-indigo-500"
                        : "hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300"
                    } transition-all hover:pl-6`}
                >
                  <div
                    className={`flex items-center justify-center 
                      ${
                        pathname === item.path
                          ? "text-indigo-500"
                          : "text-indigo-600 dark:text-indigo-400"
                      }`}
                  >
                    {item.icon}
                  </div>
                  <span className={`ml-3 ${isOpen ? "block" : "hidden"}`}>
                    {item.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Theme toggle button */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div
            className="flex items-center px-4 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300 rounded-lg transition-all"
            onClick={toggleTheme}
            style={{ justifyContent: !isOpen ? "center" : "" }}
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
          isOpen ? (isMobile ? "ml-0" : "ml-60") : "ml-0 md:ml-15"
        }`}
      >
        {children}
      </div>
    </>
  );
}
