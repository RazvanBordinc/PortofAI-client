import React, { useEffect, useState, useCallback } from "react";
import ChatBubble from "./ChatBubble";
import StreamingBubble from "./StreamingBubble";
import { enhanceMessage } from "../../lib/utils/urlDetector";

// Set to true to enable verbose debugging
const DEBUG = true;
const debugLog = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

// Helper function for cleaning JSON strings
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

export default function ChatMessage({ message }) {
  const [processedMessage, setProcessedMessage] = useState(null);
  const [parseError, setParseError] = useState(null);

  debugLog(
    "ChatMessage rendering with ID:",
    message.id,
    "isStreaming:",
    message.isStreaming,
    "contentType:",
    typeof message.content,
    "sender:",
    message.sender
  );

  // Process the message content
  const processMessage = useCallback((originalMessage) => {
    debugLog("Begin processing message:", originalMessage.id);

    // Create a copy to avoid modifying the original
    let processedMsg = { ...originalMessage };

    try {
      // CRITICAL CHECK: Handle streaming messages immediately
      if (originalMessage.isStreaming) {
        debugLog("Message is streaming, passing through directly");
        setProcessedMessage(processedMsg);
        return;
      }

      // Check for contact information - shortcut processing for contact data
      if (
        typeof originalMessage.content === "string" &&
        (originalMessage.content.includes("Email:") ||
          originalMessage.content.includes("razvan.bordinc@yahoo.com"))
      ) {
        debugLog("Detected contact information pattern");
        // Create contact format message
        processedMsg.content = {
          text: originalMessage.content,
          format: "contact",
          data: {
            title: "Contact Form",
            recipientName: "Razvan Bordinc",
            recipientPosition: "Software Engineer",
            emailSubject: "Contact from Portfolio Website",
            socialLinks: [
              {
                platform: "LinkedIn",
                url: "https://linkedin.com/in/valentin-r%C4%83zvan-bord%C3%AEnc-30686a298/",
                icon: "linkedin",
              },
              {
                platform: "GitHub",
                url: "https://github.com/RazvanBordinc",
                icon: "github",
              },
              {
                platform: "Email",
                url: "razvan.bordinc@yahoo.com",
                icon: "mail",
              },
            ],
          },
        };
        processedMsg.isStreaming = false;
        setProcessedMessage(processedMsg);
        return;
      }

      // Enhance the message to handle URLs and emails
      debugLog("Enhancing message with URL and email detection");
      processedMsg = enhanceMessage(processedMsg);

      // Extract content based on format
      if (
        typeof processedMsg.content === "object" &&
        processedMsg.content !== null
      ) {
        debugLog("Processing object content:", processedMsg.content);

        // It's already an object, ensure it has the right structure
        let content = {
          text: processedMsg.content.text || "",
          format: processedMsg.content.format || "text",
          data: processedMsg.content.data || null,
        };

        // Convert to the expected format
        processedMsg.content = content;
      } else if (typeof processedMsg.content === "string") {
        debugLog(
          "Processing string content, length:",
          processedMsg.content.length
        );

        // Extract format type from text if present
        const formatMatch = processedMsg.content.match(
          /\[format:(text|contact)\]/i
        );

        const format = formatMatch ? formatMatch[1].toLowerCase() : "text";
        debugLog("Detected format:", format);

        // Extract data from text if present
        const dataMatch = processedMsg.content.match(/\[data:([\s\S]*?)\]/);
        let data = null;

        if (dataMatch) {
          try {
            debugLog("Found data section, attempting to parse");
            const jsonStr = dataMatch[1].trim();
            data = JSON.parse(cleanJsonString(jsonStr));
            debugLog("Successfully parsed JSON data");
          } catch (error) {
            console.error("JSON parsing error in content:", error);
            debugLog("JSON parsing failed:", error.message);

            // Special handling for contact data parsing errors
            if (
              format === "contact" ||
              processedMsg.content.includes("Email:") ||
              processedMsg.content.includes("razvan.bordinc@yahoo.com")
            ) {
              debugLog("Creating default contact data after parse failure");
              data = {
                title: "Contact Form",
                recipientName: "Razvan Bordinc",
                recipientPosition: "Software Engineer",
                emailSubject: "Contact from Portfolio Website",
                socialLinks: [
                  {
                    platform: "LinkedIn",
                    url: "https://linkedin.com/in/valentin-r%C4%83zvan-bord%C3%AEnc-30686a298/",
                    icon: "linkedin",
                  },
                  {
                    platform: "GitHub",
                    url: "https://github.com/RazvanBordinc",
                    icon: "github",
                  },
                  {
                    platform: "Email",
                    url: "razvan.bordinc@yahoo.com",
                    icon: "mail",
                  },
                ],
              };
            } else {
              // For other formats
              data = { error: "Could not parse JSON data: " + error.message };
            }
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

        debugLog(
          "Processed text content:",
          "format:",
          format,
          "cleanedTextLength:",
          cleanedText.length,
          "hasData:",
          data !== null
        );
      } else {
        // For other cases, default to text format
        debugLog(
          "Content is neither object nor string, using default text format"
        );
        processedMsg.content = {
          text: String(processedMsg.content || ""),
          format: "text",
          data: null,
        };
      }

      // Important: Make sure isStreaming is explicitly set to false for completed messages
      processedMsg.isStreaming = false;
      debugLog("Message processing complete:", processedMsg.id);
      setProcessedMessage(processedMsg);
    } catch (error) {
      console.error("Error in processMessage:", error);
      setParseError(error.message);
      debugLog("Error during processing:", error.message);

      // Keep original message as fallback but make sure isStreaming is correct
      if (processedMsg) {
        processedMsg.isStreaming = processedMsg.isStreaming || false;
        setProcessedMessage(processedMsg);
      } else {
        // Create a minimal valid message if processedMsg is undefined
        setProcessedMessage({
          id: originalMessage.id || Date.now(),
          content: {
            text: "Error processing message: " + error.message,
            format: "text",
            data: null,
          },
          sender: originalMessage.sender || "ai",
          isStreaming: false,
          timestamp: originalMessage.timestamp || new Date().toISOString(),
          isError: true,
        });
      }
    }
  }, []);

  // Process the message when it changes
  useEffect(() => {
    if (message) {
      processMessage(message);
    }
  }, [message, processMessage]);

  // Render debugging
  debugLog(
    "Rendering decision for message ID:",
    message.id,
    "processedMessage:",
    processedMessage ? "exists" : "null",
    "isStreaming:",
    processedMessage?.isStreaming,
    "parseError:",
    parseError ? "exists" : "null"
  );

  // If message is still being processed
  if (!processedMessage) {
    return <div className="animate-pulse">Processing message...</div>;
  }

  // If this is a streaming message, use the streaming component
  if (processedMessage.isStreaming) {
    debugLog("Routing to StreamingBubble:", message.id);
    return <StreamingBubble message={processedMessage} />;
  }

  // If there's a parsing error, pass it along with the message
  if (parseError && processedMessage) {
    debugLog("Message has parse error:", parseError);
    const msgWithError = {
      ...processedMessage,
      parseError,
    };
    return <ChatBubble message={msgWithError} />;
  }

  debugLog("Routing to regular ChatBubble:", message.id);
  return processedMessage ? <ChatBubble message={processedMessage} /> : null;
}
