"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Square,
  Paperclip,
  PenLine,
  Check,
  Users,
  BriefcaseBusiness,
  Pen,
  NotebookTabs,
  Stamp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChatMessage from "./ChatMessage";
import AiResponseHandler from "./AiResponseHandler";
import ChatHeader from "./ChatHeader";
import ChatSuggestion from "./ChatSuggestion";
import LogoAnimationSvg from "../shared/LogoAnimationSvg";
import Modal from "../shared/Modal";
import RemainingRequests from "./RemainingRequests";

export default function ChatInterface() {
  // Message and UI state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [lastUserMessage, setLastUserMessage] = useState(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchError, setIsFetchError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("NORMAL");
  const [remaining, setRemaining] = useState(15);
  const [currentUserMessage, setCurrentUserMessage] = useState(null);

  // Refs
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
  }, [messages, isAiTyping]);

  // Focus on input field when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch remaining requests on component mount
  useEffect(() => {
    fetchRemainingRequests();
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

  // Fetch remaining API requests
  const fetchRemainingRequests = async () => {
    try {
      setIsFetchError(false);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5189";

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${apiUrl}/api/remaining`, {
        signal: controller.signal,
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`Error response: ${response.status}`);
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setRemaining(data.remaining);
    } catch (error) {
      console.error("Error fetching remaining requests:", error);
      // Set a default remaining value on error
      setRemaining(15);
    }
  };

  // Process the response from the server to extract data properly
  const processResponse = (responseData) => {
    // Extract the response text
    const responseText =
      typeof responseData.response === "string"
        ? responseData.response
        : "Sorry, I received an invalid response format.";

    // Check for format tags in the response text first
    let format = "text"; // Default format
    const formatMatch = responseText.match(
      /\[format:(text|table|contact|pdf)\]/i
    );
    if (formatMatch) {
      format = formatMatch[1].toLowerCase();
    } else if (responseData.format) {
      // If not found in text, use the format from the response data
      format = responseData.format;
    }

    // Extract or parse JSON data
    let formatData = null;

    if (responseData.formatData) {
      // Data was already parsed by the backend
      formatData = responseData.formatData;
    } else {
      // Try to extract data from response text
      const dataMatch = responseText.match(/\[data:([\s\S]*?)\]/s);
      if (dataMatch && dataMatch[1]) {
        try {
          formatData = JSON.parse(dataMatch[1].trim());
          console.log("Extracted data from response text", formatData);
        } catch (error) {
          console.error("Failed to parse data from response text:", error);
          formatData = { error: "Could not parse JSON data: " + error.message };
        }
      }
    }

    // Clean the response text by removing format tags and data tags
    let cleanedText = responseText
      .replace(/\[format:(text|table|contact|pdf)\]/gi, "")
      .replace(/\[\/format\]/gi, "");

    if (formatData) {
      cleanedText = cleanedText.replace(/\[data:[\s\S]*?\]/s, "");
    }

    return {
      text: cleanedText.trim(),
      format,
      data: formatData,
    };
  };

  // Handle AI response
  const handleAiResponse = (aiMessage) => {
    setMessages((prev) => [...prev, aiMessage]);
    setIsAiTyping(false);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (text) => {
    if (isAiTyping) return; // Don't allow new suggestions while AI is typing
    setNewMessage(text);

    // Use a small timeout to ensure state update before sending
    setTimeout(() => {
      handleSendMessage();
    }, 10);
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

  // Handle stop AI
  const handleStopAi = () => {
    setIsAiTyping(false);
    setIsLoading(false);
  };

  // Send message to backend
  const handleSendMessage = async (e) => {
    e?.preventDefault(); // Make preventDefault optional for suggestion clicks
    if (!newMessage.trim() || isLoading || isAiTyping || remaining <= 0) return;

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      content: newMessage.trim(),
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentUserMessage(userMessage);
    setLastUserMessage(userMessage);
    setNewMessage("");
    setIsLoading(true);
    setIsAiTyping(true);
    setIsFetchError(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5189";

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      console.log(`Sending message to API with style: ${selectedStyle}`);

      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        body: JSON.stringify({
          message: userMessage.content,
          style: selectedStyle, // Include the selected style with the request
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`Error response: ${response.status}`);
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received response from API:", data);

      // Process the response to properly extract format and data
      const processedContent = processResponse(data);
      console.log("Processed response:", processedContent);

      // Add bot response to chat with structured format
      const botMessage = {
        id: Date.now() + 1,
        content: processResponse(data),
        sender: "ai",
        timestamp: new Date().toISOString(),
      };

      handleAiResponse(botMessage);

      // Update remaining requests
      fetchRemainingRequests();
    } catch (error) {
      console.error("Error sending message:", error);
      setIsAiTyping(false);

      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        content: {
          text:
            error.name === "AbortError"
              ? "The request took too long to complete. Please try again later."
              : "Sorry, there was an error processing your request. Please try again later.",
          format: "text",
        },
        sender: "ai",
        isError: true,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get connection status message
  const getConnectionMessage = () => {
    if (isLoading || isAiTyping) {
      return "Waiting for response...";
    }
    if (remaining <= 0) {
      return "Daily message limit reached";
    }
    return "Type your message...";
  };

  // Show suggestions only when there are no messages or very few messages and AI is not typing
  const shouldShowSuggestions = messages.length < 3 && !isAiTyping;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 relative">
      {/* Header */}
      <ChatHeader />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 mt-16">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <LogoAnimationSvg />
              <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-2 mt-4">
                Welcome to the PortofAI Chat
              </h3>
              <p className="text-center text-slate-600 dark:text-slate-400 max-w-md mb-6">
                Ask me anything about my skills, projects, or experience.
                I&apos;m here to help!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}

          {/* AI Typing Animation */}
          {isAiTyping && (
            <AiResponseHandler
              userMessage={currentUserMessage}
              onAiResponse={handleAiResponse}
              isTyping={isAiTyping}
              setIsTyping={setIsAiTyping}
            />
          )}

          <div ref={messageEndRef} />
        </div>
      </div>

      {/* Suggestions - only show when conversation is empty or just starting */}
      {!messages.length > 0 && (
        <ChatSuggestion
          distance="mb-30"
          onSelectSuggestion={handleSuggestionSelect}
        />
      )}

      {/* File Attachment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="File Attachment"
      >
        <p>
          File attachments are not available in the demo version to stay within
          free tier limits.
        </p>
      </Modal>

      {/* Message Input */}
      <div className="p-4">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto mb-1">
          <div className="relative">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows="1"
                className={`w-full p-3 rounded-2xl   
                  text-slate-800 dark:text-white border bg-slate-200 dark:bg-slate-800 border-slate-200 
                  dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 
                  outline-none transition-all shadow-inner pb-14 pl-4 pt-4
                  ${
                    isAiTyping || isLoading || remaining <= 0
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                placeholder={getConnectionMessage()}
                disabled={isAiTyping || isLoading || remaining <= 0}
              />
              {/* In-text controls */}
              <div className="absolute left-3 bottom-3 flex items-center">
                {/* Attach File Button */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="py-1 px-3 rounded-full text-slate-500 flex items-center space-x-2 border dark:border-slate-700/60 dark:text-slate-400 hover:bg-slate-300/30 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                  title="Attach File"
                  disabled={isAiTyping || isLoading || remaining <= 0}
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
                    disabled={isAiTyping || isLoading || remaining <= 0}
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
              </div>
              <button
                type={isAiTyping ? "button" : "submit"}
                onClick={isAiTyping ? handleStopAi : undefined}
                className={`p-3 absolute top-1/2 -translate-y-1/2 right-2 rounded-full transition-all duration-200
                ${
                  isAiTyping
                    ? "bg-red-500 hover:bg-red-600 text-white cursor-pointer shadow-md hover:shadow-lg"
                    : !newMessage.trim() || remaining <= 0
                    ? "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg cursor-pointer"
                }`}
                disabled={!isAiTyping && (!newMessage.trim() || remaining <= 0)}
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

          {/* Style and Rate Limit Indicators */}
          <div className="flex justify-between items-center mt-2">
            {/* Selected Style Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center ml-2 text-xs text-indigo-600 dark:text-indigo-400"
            >
              <PenLine size={12} className="mr-1" />
              <span>
                Style: {styleOptions.find((s) => s.id === selectedStyle)?.label}
              </span>
            </motion.div>

            {/* Rate Limit Indicator */}
            <div className="flex-grow ml-8">
              <RemainingRequests remaining={remaining} total={15} />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
