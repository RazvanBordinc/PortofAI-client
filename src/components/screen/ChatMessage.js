"use client";

import React, { useEffect, useState, useCallback } from "react";
import ChatBubble from "./ChatBubble";

export default function ChatMessage({ message }) {
  const [processedMessage, setProcessedMessage] = useState(message);
  const [parseError, setParseError] = useState(null);

  // Wrap in useCallback to prevent infinite re-renders
  const processMessage = useCallback((originalMessage) => {
    if (!originalMessage) return;

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

        // Check if the text contains embedded JSON data
        if (content.text) {
          try {
            const { cleanedText, extractedData } = extractJsonData(
              content.text
            );

            if (extractedData && !content.data) {
              content.data = extractedData;
            }

            content.text = cleanedText;
          } catch (error) {
            console.error("Error extracting JSON data:", error);
            setParseError(error.message);
            // Keep the original text if extraction fails
          }
        }

        processedMsg.content = content;
      } else {
        // It's a string or something else, convert to our expected structure
        const contentStr = String(processedMsg.content || "");
        try {
          const { cleanedText, extractedData, formatType } =
            extractJsonData(contentStr);

          processedMsg.content = {
            text: cleanedText,
            format: formatType || "text",
            data: extractedData,
          };
        } catch (error) {
          console.error("Error processing content string:", error);
          setParseError(error.message);
          // Use original content as fallback
          processedMsg.content = {
            text: contentStr,
            format: "text",
            data: null,
          };
        }
      }

      setProcessedMessage(processedMsg);
    } catch (error) {
      console.error("Error in processMessage:", error);
      setParseError(error.message);
      // Keep original message as fallback
      setProcessedMessage(originalMessage);
    }
  }, []);

  // Extract JSON data and clean up the text
  const extractJsonData = (text) => {
    if (typeof text !== "string")
      return { cleanedText: text, extractedData: null, formatType: null };

    let cleanedText = text;
    let extractedData = null;
    let formatType = null;

    // Extract format type
    const formatMatch = text.match(/\[format:(text|table|contact|pdf)\]/i);
    if (formatMatch) {
      formatType = formatMatch[1].toLowerCase();
      cleanedText = cleanedText.replace(formatMatch[0], "");
    }

    // Remove [/format] tag if present
    cleanedText = cleanedText.replace(/\[\/format\]/g, "");

    // Extract JSON data
    const dataRegex = /\[data:([\s\S]*?)\]/;
    const dataMatch = text.match(dataRegex);

    if (dataMatch && dataMatch[1]) {
      try {
        let jsonStr = dataMatch[1].trim();
        console.log(
          "Raw JSON data (first 100 chars):",
          jsonStr.substring(0, 100)
        );

        // Try to clean up common JSON issues
        jsonStr = jsonStr
          .replace(/([{,])\s*([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":') // Add quotes to keys without quotes
          .replace(/:\s*'([^']*)'/g, ':"$1"') // Replace single quotes with double quotes
          .replace(/,\s*}/g, "}") // Remove trailing commas
          .replace(/,\s*]/g, "]"); // Remove trailing commas in arrays

        extractedData = JSON.parse(jsonStr);
        cleanedText = cleanedText.replace(dataMatch[0], "");
        console.log("Successfully parsed JSON data");
      } catch (e) {
        console.error("Failed to parse JSON data:", e);
        console.log("Problematic JSON:", dataMatch[1]);
        throw new Error(`JSON parsing error: ${e.message}`);
      }
    }

    return { cleanedText: cleanedText.trim(), extractedData, formatType };
  };

  useEffect(() => {
    // Process the message once when it's received
    processMessage(message);
  }, [message, processMessage]);

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
