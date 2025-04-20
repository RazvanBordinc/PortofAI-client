"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, MessageSquare } from "lucide-react";
import ChatBubble from "./ChatBubble";
import AiResponseHandler from "./AiResponseHandler";
import ChatHeader from "./ChatHeader";
import ChatSuggestion from "./ChatSuggestion";

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [lastUserMessage, setLastUserMessage] = useState(null);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = (e) => {
    e?.preventDefault(); // Make preventDefault optional for suggestion clicks
    if (newMessage.trim() === "") return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      content: newMessage.trim(),
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLastUserMessage(userMessage); // Set this message as the trigger for AI response
    setNewMessage("");
  };

  const handleAiResponse = (aiMessage) => {
    setMessages((prev) => [...prev, aiMessage]);
    setLastUserMessage(null); // Reset after handling
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (text) => {
    setNewMessage(text);
    // Focus on input with slight delay to ensure UI update
    setTimeout(() => {
      inputRef.current?.focus();
      // Auto-send the suggestion after a brief delay
      setTimeout(() => {
        handleSendMessage();
      }, 100);
    }, 500);
  };

  // Show suggestions only when there are no messages or very few messages
  const shouldShowSuggestions = messages.length < 3;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 relative">
      {/* Header */}
      <ChatHeader />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 mt-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 py-10">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <MessageSquare
                  size={32}
                  className="text-indigo-500 dark:text-indigo-400"
                />
              </div>
              <p className="text-center text-slate-400 dark:text-slate-500 font-medium">
                No messages yet. Start a conversation!
              </p>
              <p className="text-center text-slate-400 dark:text-slate-600 text-sm max-w-md">
                Ask me anything about my projects, me, or questions you might
                have. I'm here to help!
              </p>
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
          />

          <div ref={messageEndRef} />
        </div>
      </div>

      {/* Suggestions - only show when conversation is empty or just starting */}
      {shouldShowSuggestions && (
        <ChatSuggestion onSelectSuggestion={handleSuggestionSelect} />
      )}

      {/* Message Input */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-indigo-900/40 shadow-lg">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Attach File"
            >
              <Paperclip size={20} />
            </button>

            <div className="flex-1 mx-2 relative">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 
                  text-slate-800 dark:text-white border border-slate-200 
                  dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 
                  outline-none transition-all shadow-inner"
                placeholder="Type your message..."
              />
            </div>

            <button
              type="submit"
              className={`p-3 rounded-full transition-all duration-200
                ${
                  !newMessage.trim()
                    ? "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
                }`}
              disabled={!newMessage.trim()}
              title="Send Message"
            >
              <Send
                size={20}
                className={newMessage.trim() ? "transform rotate-45" : ""}
              />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
