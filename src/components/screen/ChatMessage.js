import React, { useEffect, useState, useCallback } from "react";
import ChatBubble from "./ChatBubble";
import StreamingBubble from "./StreamingBubble"; // New component for streaming text

export default function ChatMessage({ message }) {
  const [processedMessage, setProcessedMessage] = useState(null);
  const [parseError, setParseError] = useState(null);

  // Process the message when it changes
  useEffect(() => {
    if (message) {
      processMessage(message);
    }
  }, [message]);

  // Wrap in useCallback to prevent infinite re-renders
  const processMessage = useCallback((originalMessage) => {
    // Check if this is a streaming message
    if (originalMessage.isStreaming) {
      // For streaming messages, we'll use a special component
      setProcessedMessage(originalMessage);
      return;
    }

    try {
      let processedMsg = { ...originalMessage };
      console.log("ChatMessage processing:", originalMessage);

      // Extract content properly
      if (
        typeof processedMsg.content === "object" &&
        processedMsg.content !== null
      ) {
        // It's already an object, but we need to make sure it has the right structure
        let content = {
          text: processedMsg.content.text || "",
          format: processedMsg.content.format || "text",
          data: processedMsg.content.data || null,
        };

        // Convert to the expected format
        processedMsg.content = content;
      } else if (typeof processedMsg.content === "string") {
        // Extract format type from text if present
        const formatMatch = processedMsg.content.match(
          /\[format:(text|contact)\]/i
        );

        const format = formatMatch ? formatMatch[1].toLowerCase() : "text";

        // Extract data from text if present
        const dataMatch = processedMsg.content.match(/\[data:([\s\S]*?)\]/);
        let data = null;

        if (dataMatch) {
          try {
            const jsonStr = dataMatch[1].trim();
            data = JSON.parse(cleanJsonString(jsonStr));
          } catch (error) {
            console.error("JSON parsing error in content:", error);
            // Create fallback data
            data = { error: "Could not parse JSON data: " + error.message };
          }
        }

        // Clean text (remove format and data tags)
        let cleanedText = processedMsg.content
          .replace(/\[format:(text|contact)\]/gi, "")
          .replace(/\[\/format\]/gi, "");

        if (dataMatch) {
          cleanedText = cleanedText.replace(dataMatch[0], "");
        }

        // Set the processed content
        processedMsg.content = {
          text: cleanedText.trim(),
          format: format,
          data: data,
        };
      } else {
        // For other cases, default to text format
        processedMsg.content = {
          text: String(processedMsg.content || ""),
          format: "text",
          data: null,
        };
      }

      setProcessedMessage(processedMsg);
    } catch (error) {
      console.error("Error in processMessage:", error);
      setParseError(error.message);
      // Keep original message as fallback
      setProcessedMessage(originalMessage);
    }
  }, []);

  // Clean up JSON string for parsing
  const cleanJsonString = (jsonStr) => {
    if (!jsonStr) return jsonStr;

    // Replace JavaScript-style property names (without quotes) with JSON-style (with quotes)
    let cleaned = jsonStr.replace(/([{,])\s*([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');

    // Replace single quotes with double quotes (handling escaped quotes)
    cleaned = cleaned
      .replace(/\\'/g, "\\TEMP_QUOTE") // Temporarily replace escaped single quotes
      .replace(/'/g, '"') // Replace all single quotes with double quotes
      .replace(/\\TEMP_QUOTE/g, "\\'"); // Restore escaped single quotes

    // Remove trailing commas in objects and arrays
    cleaned = cleaned.replace(/,\s*}/g, "}").replace(/,\s*\]/g, "]");

    return cleaned;
  };

  // If message is still being processed
  if (!processedMessage) {
    return <div className="animate-pulse">Processing message...</div>;
  }

  // If this is a streaming message, use the streaming component
  if (processedMessage.isStreaming) {
    return <StreamingBubble message={processedMessage} />;
  }

  // If there's a parsing error, pass it along with the message
  if (parseError && processedMessage) {
    const msgWithError = {
      ...processedMessage,
      parseError,
    };
    return <ChatBubble message={msgWithError} />;
  }

  return processedMessage ? <ChatBubble message={processedMessage} /> : null;
}
