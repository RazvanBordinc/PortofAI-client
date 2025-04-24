"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Square } from "lucide-react";
import ChatMessage from "./ChatMessage";
import RemainingRequests from "./RemainingRequests";

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [remaining, setRemaining] = useState(15);
  const messageEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch remaining requests on component mount
  useEffect(() => {
    fetchRemainingRequests();
  }, []);

  // Fetch remaining API requests
  const fetchRemainingRequests = async () => {
    try {
      const response = await fetch("http://localhost:5189/api/remaining");
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setRemaining(data.remaining);
    } catch (error) {
      console.error("Error fetching remaining requests:", error);
    }
  };

  // Send message to backend
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || isLoading || remaining <= 0) return;

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      content: newMessage.trim(),
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5189/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      // Add bot response to chat
      const botMessage = {
        id: Date.now() + 1,
        content: data.response,
        sender: "ai",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // Update remaining requests
      fetchRemainingRequests();
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        content:
          "Sorry, there was an error processing your request. Please try again later.",
        sender: "ai",
        isError: true,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopAi = () => {
    // In a real app, you would cancel the request here
    setIsLoading(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 relative pt-16">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-10 h-10 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-2">
                Welcome to the Chat Bot
              </h3>
              <p className="text-center text-slate-600 dark:text-slate-400 max-w-md">
                Ask me anything or start a conversation. I&apos;m here to help!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2.5 h-2.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2.5 h-2.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                AI is thinking...
              </span>
            </div>
          )}

          <div ref={messageEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto mb-4">
          <div className="relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                isLoading
                  ? "Waiting for response..."
                  : remaining <= 0
                  ? "Daily message limit reached"
                  : "Type your message..."
              }
              disabled={isLoading || remaining <= 0}
              className={`w-full p-4 pr-14 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 text-slate-800 dark:text-white 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400
                  ${
                    isLoading || remaining <= 0
                      ? "opacity-70 cursor-not-allowed"
                      : ""
                  }`}
            />
            <button
              type={isLoading ? "button" : "submit"}
              onClick={isLoading ? handleStopAi : undefined}
              disabled={!newMessage.trim() || (remaining <= 0 && !isLoading)}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full
                ${
                  isLoading
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : !newMessage.trim() || remaining <= 0
                    ? "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                } transition-colors`}
            >
              {isLoading ? <Square size={20} /> : <Send size={20} />}
            </button>
          </div>
        </form>

        <RemainingRequests remaining={remaining} total={15} />
      </div>
    </div>
  );
}
