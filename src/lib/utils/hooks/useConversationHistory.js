"use client";

import { useState, useEffect, useCallback } from "react";
import { processCompletedResponse } from "../textCleaners"; // Import from your textCleaners utility

/**
 * Custom hook for managing conversation history with local caching
 */
export function useConversationHistory() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch conversation history from API
  const fetchHistory = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check local cache first (if not forcing refresh)
      if (!forceRefresh) {
        const cachedData = loadFromCache();
        if (cachedData && cachedData.length > 0) {
          setHistory(cachedData);
          setIsLoading(false);
          return cachedData;
        }
      }

      // Fetch from API if no cache or forcing refresh
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5189";

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(`${apiUrl}/api/conversation/history`, {
        signal: controller.signal,
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      clearTimeout(timeoutId);

      // Handle 404 (no history) as valid but empty
      if (response.status === 404) {
        setHistory([]);
        saveToCache([]);
        setIsLoading(false);
        return [];
      }

      if (!response.ok) {
        throw new Error(`Error fetching history: ${response.status}`);
      }

      const data = await response.json();

      // Format messages to match our frontend structure with correct content formatting
      const formattedMessages = data.messages.map((msg) => {
        // Create the base message object
        const formattedMessage = {
          id: msg.id || Date.now() + Math.random(),
          sender: msg.sender,
          timestamp: new Date(msg.timestamp).toISOString(),
        };

        // Format content based on sender type
        if (msg.sender === "user") {
          // User messages have simple string content
          formattedMessage.content = msg.content;
        } else {
          // AI messages might need structured content
          try {
            // Check if the content appears to be JSON already
            if (typeof msg.content === "object") {
              formattedMessage.content = msg.content;
            } else {
              // Try to process content as if it's an AI response with special formatting
              // Use your existing processCompletedResponse utility function
              formattedMessage.content = processCompletedResponse(msg.content);
            }
          } catch (error) {
            console.error("Error processing AI message content:", error);
            // Fallback to plain text if processing fails
            formattedMessage.content = {
              text: msg.content,
              format: "text",
              data: null,
            };
          }
        }

        return formattedMessage;
      });

      setHistory(formattedMessages);
      saveToCache(formattedMessages);
      return formattedMessages;
    } catch (error) {
      console.error("Error fetching conversation history:", error);
      setError("Failed to load conversation history. Please try again later.");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear conversation history (both API and local)
  const clearHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5189";

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(`${apiUrl}/api/conversation/clear`, {
        method: "POST",
        signal: controller.signal,
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error clearing history: ${response.status}`);
      }

      // Clear local state and cache
      setHistory([]);
      clearCache();
      return true;
    } catch (error) {
      console.error("Error clearing conversation history:", error);
      setError("Failed to clear conversation history. Please try again later.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save messages to cache
  const saveToCache = (messages) => {
    try {
      localStorage.setItem("chat-history", JSON.stringify(messages));
      localStorage.setItem("chat-history-timestamp", Date.now().toString());
    } catch (error) {
      console.error("Error saving history to cache:", error);
    }
  };

  // Load messages from cache (if recent)
  const loadFromCache = () => {
    try {
      const timestamp = localStorage.getItem("chat-history-timestamp");
      if (!timestamp) return null;

      // Check if cache is older than 24 hours
      const cacheTime = parseInt(timestamp, 10);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      if (now - cacheTime > maxAge) {
        // Cache is too old
        clearCache();
        return null;
      }

      // Cache is valid, load it
      const cached = localStorage.getItem("chat-history");
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Error loading history from cache:", error);
      return null;
    }
  };

  // Clear cache
  const clearCache = () => {
    try {
      localStorage.removeItem("chat-history");
      localStorage.removeItem("chat-history-timestamp");
    } catch (error) {
      console.error("Error clearing history cache:", error);
    }
  };

  // Update cache with new messages
  const updateCache = useCallback((messages) => {
    saveToCache(messages);
    setHistory(messages);
  }, []);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    isLoading,
    error,
    fetchHistory,
    clearHistory,
    updateCache,
  };
}

export default useConversationHistory;
