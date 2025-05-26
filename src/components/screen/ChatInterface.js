"use client";
import {
  fixTruncatedOrMalformedJson,
  cleanResponseText,
  processUrlsAndEmails,
  createDefaultContactData,
} from "@/lib/utils/textCleaners";
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
import ChatHistorySidebar from "../shared/ChatHistorySidebar";
import useConversationHistory from "@/lib/utils/hooks/useConversationHistory";
import BackendLoadingScreen from "../shared/BackendLoadingScreen";

const DEBUG = false;

export default function ChatInterface() {
  // Message and UI state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [showBackendCheck, setShowBackendCheck] = useState(false);
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("NORMAL");
  const [remaining, setRemaining] = useState(15);
  const [currentUserMessage, setCurrentUserMessage] = useState(null);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);

  // Conversation history hook
  const {
    history,
    isLoading: isHistoryLoading,
    error: historyError,
    fetchHistory,
    clearHistory,
    updateCache,
  } = useConversationHistory();

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

  // Load conversation history when component mounts
  useEffect(() => {
    // If history is loaded and not empty, set as messages
    if (history && history.length > 0 && messages.length === 0) {
      setMessages(history);
    }
  }, [history]);

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

  const debugLog = (...args) => {
    if (DEBUG) {
      console.log(...args);
    }
  };
  // Add this function near the top of the file
  function deduplicate(text) {
    if (!text || text.length < 30) return text;

    // Fix duplicate sentences at the end of text
    let cleanedText = text;

    // Check for duplicate sentences (more thorough method)
    const sentences = cleanedText.split(/([.!?]\s+)/);
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      // Skip short sentences and punctuation
      if (sentence.length < 10) continue;

      // Look for duplicate of this sentence later in the text
      for (let j = i + 1; j < sentences.length; j++) {
        if (sentences[i] === sentences[j]) {
          // Found duplicate - remove it by setting to empty
          sentences[j] = "";
          console.log("Removed duplicate sentence:", sentence.substring(0, 30));
        }
      }
    }

    // Rejoin without empty entries
    cleanedText = sentences.filter((s) => s).join("");

    // Check for exact duplication of bullet points (common in your responses)
    const bulletPoints =
      cleanedText.match(/\*\s+\*\*[^*]+\*\*:[^*.]+(\.|\n)/g) || [];
    for (let i = 0; i < bulletPoints.length; i++) {
      const point = bulletPoints[i].trim();
      if (point.length < 10) continue;

      // Count occurrences
      const regex = new RegExp(escapeRegExp(point), "g");
      const matches = cleanedText.match(regex) || [];

      if (matches.length > 1) {
        // Replace second+ occurrences
        cleanedText = cleanedText.replace(regex, (match, offset) => {
          // Keep the first occurrence, remove duplicates
          return offset === cleanedText.indexOf(point) ? match : "";
        });
        console.log("Removed duplicate bullet point");
      }
    }

    return cleanedText;
  }

  // Helper to escape special regex characters
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  // Fetch remaining API requests
  const fetchRemainingRequests = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5189";

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      if (isFirstMessage) {
        setIsFirstMessage(false);
      }
      const response = await fetch(`${apiUrl}/api/remaining`, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
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

  // Handle AI response
  const handleAiResponse = (aiMessage) => {
    setMessages((prev) => [...prev, aiMessage]);
    setIsAiTyping(false);
  };

  // Handle history button click
  const handleHistoryClick = () => {
    setIsHistorySidebarOpen(true);
  };

  // Handle clearing history
  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear your chat history?")) {
      await clearHistory();
      setMessages([]);
    }
  };

  // FIXED: Handle suggestion selection - properly sends the message immediately
  const handleSuggestionSelect = (text) => {
    debugLog("Suggestion selected:", text);

    // Don't proceed if already busy
    if (isAiTyping || isLoading || remaining <= 0) {
      debugLog("Cannot process suggestion - busy or rate limited");
      return;
    }

    // Show backend check on first message
    if (isFirstMessage && !isBackendReady) {
      setNewMessage(text); // Set the message so it can be sent after backend is ready
      setShowBackendCheck(true);
      return;
    }

    // Create a user message object
    const userMessage = {
      id: Date.now(),
      content: text.trim(),
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    debugLog("Created user message:", userMessage);

    // Add user message to chat
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    updateCache(updatedMessages);

    setCurrentUserMessage(userMessage);

    // Clear input field
    setNewMessage("");

    // Set loading states
    setIsLoading(true);
    setIsAiTyping(true);

    // Create a streaming message placeholder
    const streamingMessageId = Date.now() + 1;
    const streamingMessage = {
      id: streamingMessageId,
      content: "",
      sender: "ai",
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };

    // Add the streaming message to the chat
    setMessages((prev) => [...prev, streamingMessage]);

    debugLog("Added streaming message placeholder. Calling API...");

    // Direct call to the API handling function
    sendMessageToApi(userMessage, streamingMessageId);
  };

  // FIXED: Toggle style menu without sending message
  const toggleStyleMenu = () => {
    setIsStyleMenuOpen(!isStyleMenuOpen);
  };

  const handleStyleSelect = (style) => {
    setSelectedStyle(style);
    setIsStyleMenuOpen(false);
  };

  // Handle stop AI
  const handleStopAi = () => {
    setIsAiTyping(false);
    setIsLoading(false);
  };

  // Updated sendMessageToApi function with proper variable initialization
  const sendMessageToApi = async (userMessage, streamingMessageId) => {
    debugLog("Sending message to API:", userMessage.content);

    // Initialize variables at the top - important!
    let accumulatedText = "";
    let done = false;
    let reader = null;
    let response = null;
    let timeoutId = null;
    let isContactForm = false;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5189";

      // Abort controller for the fetch request with timeout
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      if (isFirstMessage) {
        setIsFirstMessage(false);
      }
      // Start the streaming request
      response = await fetch(`${apiUrl}/api/chat/stream`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          message: userMessage.content,
          style: selectedStyle,
        }),
      });

      // Check for errors in the response
      if (!response.ok) {
        clearTimeout(timeoutId);
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }

      // Check if we have a readable stream
      if (!response.body) {
        throw new Error("No response body stream available");
      }

      // Get the reader from the response body
      reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Process the stream chunks
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (done) {
          console.log("Stream completed");
          setIsAiTyping(false);
          setIsLoading(false);
          break;
        }

        // Decode this chunk
        const chunk = decoder.decode(value, { stream: true });
        console.log("Received chunk length:", chunk.length);

        // Process SSE format
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            // Check if it's a heartbeat comment
            if (line.startsWith(":")) {
              console.log("Heartbeat received");
              continue;
            }

            // Check for an event name
            const eventMatch = line.match(/^event: (.+)$/m);
            const eventName = eventMatch ? eventMatch[1] : null;

            // Extract data content
            const dataMatch = line.match(/^data: (.+)$/m);
            if (!dataMatch) continue;

            const dataContent = dataMatch[1];
            console.log(
              "Event:",
              eventName,
              "Data length:",
              dataContent.length
            );

            // Handle different event types
            if (eventName === "done") {
              console.log("Received done event, parsing completion data");
              try {
                const completionData = JSON.parse(dataContent);

                if (completionData.done) {
                  console.log("Done event confirmed, updating message state");
                  // IMPORTANT: Don't update content again, just mark as done
                  setMessages((prev) => {
                    const updated = prev.map((msg) =>
                      msg.id === streamingMessageId
                        ? {
                            ...msg,
                            isStreaming: false,
                            // Don't update content here - it's already been updated by streaming chunks
                          }
                        : msg
                    );

                    // Update the cache with the new AI response
                    updateCache(updated);

                    return updated;
                  });

                  // Clear loading states
                  setIsAiTyping(false);
                  setIsLoading(false);
                }
              } catch (error) {
                console.error("Error parsing completion data:", error);
                setIsAiTyping(false);
                setIsLoading(false);
              }
            } else if (eventName === "message") {
              // Regular message event - unescape special characters
              const textChunk = dataContent
                .replace(/\\n/g, "\n")
                .replace(/\\r/g, "\r");

              console.log(
                "Message chunk received:",
                textChunk.substring(0, 30) + "..."
              );

              // Add to accumulated text
              if (!accumulatedText.endsWith(textChunk)) {
                accumulatedText += textChunk;
              } else {
                console.log("Duplicate chunk detected, skipping");
              }
              accumulatedText = removeDuplicatedSentences(accumulatedText);
              // Check for contact information patterns
              const containsContactInfo =
                textChunk.includes("contact") ||
                textChunk.includes("Email:") ||
                textChunk.includes("GitHub:") ||
                textChunk.includes("LinkedIn:") ||
                textChunk.includes("razvan.bordinc@yahoo.com") ||
                accumulatedText.includes("razvan.bordinc@yahoo.com");

              if (containsContactInfo && !isContactForm) {
                console.log("Contact form detected, updating format");
                isContactForm = true;

                // Force format to contact form
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === streamingMessageId
                      ? {
                          ...msg,
                          content: isContactForm
                            ? {
                                text: deduplicate(accumulatedText),
                                format: "contact",
                                data: createDefaultContactData(),
                              }
                            : deduplicate(accumulatedText),
                          isStreaming: true,
                        }
                      : msg
                  )
                );
              } else {
                // CRITICAL FIX: Always update messages - this was missing!
                console.log(
                  "Updating message with new content, length:",
                  accumulatedText.length
                );

                // Regular text update - must happen for all messages
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === streamingMessageId
                      ? isContactForm
                        ? {
                            ...msg,
                            content: {
                              text: accumulatedText,
                              format: "contact",
                              data: createDefaultContactData(),
                            },
                            isStreaming: true,
                          }
                        : {
                            ...msg,
                            content: accumulatedText,
                            isStreaming: true,
                          }
                      : msg
                  )
                );
              }
            }
          } catch (error) {
            console.error("Error processing SSE line:", error);
          }
        }
      }

      if (timeoutId) clearTimeout(timeoutId);
      setIsAiTyping(false);
      setIsLoading(false);

      // Update remaining requests count
      fetchRemainingRequests();
    } catch (error) {
      console.error("Error sending message:", error);

      // Clear loading states
      setIsAiTyping(false);
      setIsLoading(false);

      if (timeoutId) clearTimeout(timeoutId);

      // Replace the streaming message with an error message
      setMessages((prev) => {
        const updated = prev.map((msg) =>
          msg.id === streamingMessageId
            ? {
                id: streamingMessageId,
                content: {
                  text:
                    error.name === "AbortError"
                      ? "The request took too long to complete. Please try again later."
                      : error.message && error.message.includes("503")
                      ? "The AI service is temporarily unavailable. Please try again in a few moments."
                      : "Sorry, there was an error processing your request. Please try again later.",
                  format: "text",
                },
                sender: "ai",
                isError: true,
                isStreaming: false,
                timestamp: new Date().toISOString(),
              }
            : msg
        );

        updateCache(updated);
        return updated;
      });
    }
  };
  function removeDuplicatedSentences(text) {
    if (!text || text.length < 50) return text;

    // Split text into sentences for analysis
    const sentences = text.split(/([.!?]\s+)/);
    const uniqueSentences = [];
    const seen = new Set();

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      // Skip very short segments as they might be punctuation
      if (sentence.length < 5) {
        uniqueSentences.push(sentence);
        continue;
      }

      // Check if we've seen this sentence before
      if (!seen.has(sentence)) {
        seen.add(sentence);
        uniqueSentences.push(sentence);
      } else {
        console.log(
          "Removed duplicate sentence:",
          sentence.substring(0, 20) + "..."
        );
      }
    }

    return uniqueSentences.join("");
  }
  // Handle send message - uses sendMessageToApi
  const handleSendMessage = async (e) => {
    e?.preventDefault(); // Make preventDefault optional for suggestion clicks
    if (!newMessage.trim() || isLoading || isAiTyping || remaining <= 0) return;

    // Show backend check on first message
    if (isFirstMessage && !isBackendReady) {
      setShowBackendCheck(true);
      return;
    }

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      content: newMessage.trim(),
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    // Update messages and then cache
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    updateCache(updatedMessages);

    setCurrentUserMessage(userMessage);
    setNewMessage("");
    setIsLoading(true);
    setIsAiTyping(true);

    // Create a streaming message placeholder
    const streamingMessageId = Date.now() + 1;
    const streamingMessage = {
      id: streamingMessageId,
      content: "",
      sender: "ai",
      timestamp: new Date().toISOString(),
      isStreaming: true, // Flag to indicate this is a streaming message
    };

    // Add the streaming message to the chat
    setMessages((prev) => [...prev, streamingMessage]);

    // Call the API
    await sendMessageToApi(userMessage, streamingMessageId);
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

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 relative">
      {/* Header */}
      <ChatHeader onHistoryClick={handleHistoryClick} />

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

          {/* AI Typing Animation - now only used if needed as fallback */}
          {isAiTyping && !messages.some((m) => m.isStreaming) && (
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
      {/* Backend Loading Screen */}
      {showBackendCheck && !isBackendReady && (
        <BackendLoadingScreen
          apiUrl={process.env.NEXT_PUBLIC_API_URL || "http://localhost:5189"}
          onBackendReady={() => {
            setIsBackendReady(true);
            setShowBackendCheck(false);
            // Retry sending the message after backend is ready
            handleSendMessage();
          }}
        />
      )}
      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        isOpen={isHistorySidebarOpen}
        onClose={() => setIsHistorySidebarOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        onRefreshHistory={() => fetchHistory(true)}
        isLoading={isHistoryLoading}
        error={historyError}
      />

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
                className={`w-full p-14 rounded-2xl   
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
              <div className="absolute left-3 bottom-3 mt-2 flex items-center">
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
                        onClick={(e) => e.stopPropagation()} // Stop any clicks from reaching the form
                      >
                        <div className="py-1">
                          {styleOptions.map((style) => (
                            <motion.button
                              key={style.id}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault(); // Prevent form submission
                                e.stopPropagation(); // Stop event propagation
                                handleStyleSelect(style.id);
                              }}
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
              className="flex items-center md:ml-2 text-xs text-indigo-600 dark:text-indigo-400"
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
