"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Square,
  PenLine,
  Check,
  Users,
  BriefcaseBusiness,
  Pen,
  NotebookTabs,
  Stamp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChatBubble from "./ChatBubble";
import AiResponseHandler from "./AiResponseHandler";

import ChatSuggestion from "./ChatSuggestion";
import LogoAnimationSvg from "../shared/LogoAnimationSvg";
import Modal from "../shared/Modal";

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [lastUserMessage, setLastUserMessage] = useState(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("NORMAL");
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const styleMenuRef = useRef(null);

  // Style options
  const styleOptions = [
    { id: "NORMAL", label: "Normal", icon: <Pen size={16} /> },
    { id: "FORMAL", label: "Formal", icon: <BriefcaseBusiness size={16} /> },
    {
      id: "EXPLANATORY",
      label: "Explanatory",
      icon: <NotebookTabs size={16} />,
    },
    { id: "MINIMALIST", label: "Minimalist", icon: <Stamp size={16} /> },
    { id: "HR", label: "HR", icon: <Users size={16} /> },
  ];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close style menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        styleMenuRef.current &&
        !styleMenuRef.current.contains(event.target)
      ) {
        setIsStyleMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSendMessage = (e) => {
    e?.preventDefault(); // Make preventDefault optional for suggestion clicks
    if (newMessage.trim() === "" || isAiTyping) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      content: {
        text: newMessage.trim(),
        mail: "testmail",
        github: "testgithub",
        linkedin: "testlinkedin",
      },
      sender: "user",
      format: "contact",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLastUserMessage(userMessage); // Set this message as the trigger for AI response
    setNewMessage("");
    setIsAiTyping(true); // Set AI typing state to true
  };

  const handleStopAi = () => {
    // Stop the AI from typing
    setIsAiTyping(false);
    setLastUserMessage(null);
  };

  const handleAiResponse = (aiMessage) => {
    setMessages((prev) => [...prev, aiMessage]);
    setLastUserMessage(null); // Reset after handling
    setIsAiTyping(false); // Set AI typing state to false after response
  };

  // Toggle style menu
  const toggleStyleMenu = () => {
    setIsStyleMenuOpen(!isStyleMenuOpen);
  };

  // Handle style selection
  const handleStyleSelect = (style) => {
    setSelectedStyle(style);
    setIsStyleMenuOpen(false);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (text) => {
    if (isAiTyping) return; // Don't allow new suggestions while AI is typing

    setNewMessage(text);
    // Auto-send the suggestion immediately
    setTimeout(() => {
      const userMessage = {
        id: Date.now(),
        content: text.trim(),
        sender: "user",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setLastUserMessage(userMessage);
      setNewMessage("");
      setIsAiTyping(true);
    }, 100);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 relative">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 mt-16">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6 py-8">
              {/* Animated Logo */}
              <LogoAnimationSvg />

              <div className="text-center">
                <p className="text-center text-slate-600 dark:text-slate-300 font-medium text-lg mb-2">
                  No messages yet. Start a conversation!
                </p>
                <p className="text-center text-slate-400 dark:text-slate-500 text-sm max-w-md">
                  Ask me anything about my projects, me, or questions you might
                  have. I'm here to help!
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))
          )}

          {/* AI Response Handler Component */}
          <AiResponseHandler
            userMessage={lastUserMessage}
            onAiResponse={handleAiResponse}
            isTyping={isAiTyping}
            setIsTyping={setIsAiTyping}
          />

          <div ref={messageEndRef} />
        </div>
      </div>

      {/* Suggestions - only show when conversation is empty or just starting */}
      {!messages.length > 0 && (
        <ChatSuggestion
          distance={!messages.length > 0 ? "mb-30" : "mb-4"}
          onSelectSuggestion={handleSuggestionSelect}
        />
      )}

      {/* Message Input */}
      <div className="p-4 ">
        <form
          onSubmit={handleSendMessage}
          className={`max-w-3xl mx-auto transition-all ${
            !messages.length > 0 ? "mb-16" : "mb-4"
          }`}
        >
          <div className="flex items-center">
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title={"Attach File"}
              isError={false}
            >
              This feature is coming soon! In the meantime, feel free to ask me
              anything or share your thoughts.
            </Modal>
            <div className="flex-1 mx-2 relative">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className={`w-full p-3 rounded-2xl   
                  text-slate-800 dark:text-white border bg-slate-200 dark:bg-slate-800 border-slate-200 
                  dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 
                  outline-none transition-all shadow-inner pb-14 pl-4 pt-4
                  ${isAiTyping ? "opacity-60 cursor-not-allowed" : ""}`}
                placeholder={
                  isAiTyping
                    ? "Wait for AI response..."
                    : "Type your message..."
                }
                disabled={isAiTyping}
              />
              {/* In-text controls */}
              <div className="absolute left-3 bottom-3 flex items-center">
                {/* Attach File Button */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="py-1 px-3 rounded-full text-slate-500 flex items-center space-x-2 border dark:border-slate-700/60 dark:text-slate-400 hover:bg-slate-300/30 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                  title="Attach File"
                >
                  <Paperclip size={18} />
                  <span className="text-xs font-semibold">Attach File</span>
                </button>

                {/* Style Selector Button */}
                <div className="relative ml-1" ref={styleMenuRef}>
                  <button
                    type="button"
                    onClick={toggleStyleMenu}
                    className="py-1 px-3 rounded-full text-slate-500 flex items-center space-x-2 border dark:border-slate-700/60 dark:text-slate-400 hover:bg-slate-300/30 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                    title="Select Response Style"
                  >
                    <PenLine size={18} />
                    <span className="text-xs font-semibold">Style</span>
                  </button>

                  {/* Style Selector Menu */}
                  <AnimatePresence>
                    {isStyleMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute bottom-full right-0 mb-2 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-10 overflow-hidden"
                      >
                        <div className="py-1">
                          {styleOptions.map((style) => (
                            <motion.button
                              key={style.id}
                              onClick={() => handleStyleSelect(style.id)}
                              whileHover={{
                                backgroundColor: "rgba(99, 102, 241, 0.1)",
                              }}
                              whileTap={{ scale: 0.98 }}
                              className={`flex items-center justify-between w-full px-4 py-2 text-sm text-left relative cursor-pointer
                                ${
                                  selectedStyle === style.id
                                    ? "text-indigo-600 dark:text-indigo-400 font-medium"
                                    : "text-slate-700 dark:text-slate-300"
                                }`}
                            >
                              <span className="absolute left-2">
                                {style.icon}
                              </span>
                              <span className="ml-4">{style.label}</span>
                              {selectedStyle === style.id && (
                                <Check
                                  size={16}
                                  className="text-indigo-600 dark:text-indigo-400"
                                />
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>{" "}
              <button
                type={isAiTyping ? "button" : "submit"}
                onClick={isAiTyping ? handleStopAi : undefined}
                className={`p-3 absolute top-1/2 -translate-y-1/2 right-2 rounded-full transition-all duration-200
                ${
                  isAiTyping
                    ? "bg-red-500 hover:bg-red-600 text-white cursor-pointer shadow-md hover:shadow-lg"
                    : !newMessage.trim()
                    ? "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg cursor-pointer"
                }`}
                disabled={!isAiTyping && !newMessage.trim()}
                title={isAiTyping ? "Stop AI" : "Send Message"}
              >
                {isAiTyping ? (
                  <Square size={20} />
                ) : (
                  <Send
                    size={20}
                    className={newMessage.trim() ? "transform rotate-45" : ""}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Selected Style Indicator - show for all styles including NORMAL */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center mt-2 ml-2 text-xs text-indigo-600 dark:text-indigo-400"
          >
            <PenLine size={12} className="mr-1" />
            <span>
              Style: {styleOptions.find((s) => s.id === selectedStyle)?.label}
            </span>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
