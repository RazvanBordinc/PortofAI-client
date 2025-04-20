"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Square } from "lucide-react";
import ChatBubble from "./ChatBubble";
import AiResponseHandler from "./AiResponseHandler";
import ChatHeader from "./ChatHeader";
import ChatSuggestion from "./ChatSuggestion";
import LogoAnimationSvg from "../shared/LogoAnimationSvg";
import Modal from "../shared/Modal";
export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [lastUserMessage, setLastUserMessage] = useState(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    if (newMessage.trim() === "" || isAiTyping) return;

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

  // Show suggestions only when there are no messages or very few messages and AI is not typing
  const shouldShowSuggestions = messages.length < 3 && !isAiTyping;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 relative">
      {/* Header */}
      <ChatHeader />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 mt-16 bg-slate-50 dark:bg-slate-950">
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
      {shouldShowSuggestions && (
        <ChatSuggestion onSelectSuggestion={handleSuggestionSelect} />
      )}

      {/* Message Input */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-indigo-900/40 shadow-lg">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="p-2 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Attach File"
            >
              <Paperclip size={20} />
            </button>
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
                className={`w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 
                  text-slate-800 dark:text-white border border-slate-200 
                  dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 
                  outline-none transition-all shadow-inner
                  ${isAiTyping ? "opacity-60 cursor-not-allowed" : ""}`}
                placeholder={
                  isAiTyping
                    ? "Wait for AI response..."
                    : "Type your message..."
                }
                disabled={isAiTyping}
              />
            </div>

            <button
              type={isAiTyping ? "button" : "submit"}
              onClick={isAiTyping ? handleStopAi : undefined}
              className={`p-3 rounded-full transition-all duration-200
                ${
                  isAiTyping
                    ? "bg-red-500 hover:bg-red-600 text-white cursor-pointer shadow-md hover:shadow-lg"
                    : !newMessage.trim()
                    ? "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
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
        </form>
      </div>
    </div>
  );
}
