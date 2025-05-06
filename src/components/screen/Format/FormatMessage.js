"use client";

import React, { useEffect, useState, useCallback } from "react";
import ContactForm from "./ContactForm";
import TextFormatter from "./TextFormatter";
import { fixTruncatedOrMalformedJson } from "@/lib/utils/textCleaners";

// Helper function for logging - reduce console spam
const DEBUG = false;
const debugLog = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

// Define all helper functions at the module level, not inside components

const createDefaultFormData = () => {
  return {
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
};

// Create fallback data for various formats
const createFallbackData = (formatType) => {
  switch (formatType) {
    case "contact":
      return createDefaultFormData();
    default:
      return null;
  }
};

export default function FormatMessage({ message }) {
  const [processedMessage, setProcessedMessage] = useState(null);
  const [parseError, setParseError] = useState(null);

  // Wrap in useCallback to prevent infinite re-renders
  const processMessage = useCallback((originalMessage) => {
    debugLog("FormatMessage processing:", originalMessage);
    setParseError(null);

    // Initialize default processed message
    let processed = {
      text: "",
      format: "text",
      data: null,
    };

    try {
      // Define extractFormatAndData function inside useCallback
      const extractFormatAndData = (text) => {
        if (typeof text !== "string")
          return {
            cleanedText: String(text || ""),
            extractedData: null,
            formatType: null,
          };

        let cleanedText = text;
        let formatType = null;
        let extractedData = null;

        try {
          // Extract format
          const formatRegex = /\[format:(text|contact)\]|\* \*\*Email:\*\*/i;
          const formatMatch = text.match(formatRegex);
          if (formatMatch) {
            formatType = formatMatch[1]?.toLowerCase() || "contact";
            cleanedText = cleanedText.replace(formatMatch[0], "");
          }

          // Remove [/format] tags
          cleanedText = cleanedText.replace(/\[\/format\]/gi, "");

          // Extract data with better error handling
          const dataRegex = /\[data:([\s\S]*?)\]/;
          const dataMatch = text.match(dataRegex);

          if (dataMatch && dataMatch[1]) {
            try {
              let jsonStr = dataMatch[1].trim();

              // Log the string for debugging
              debugLog("Raw JSON data:", jsonStr);

              // Fix the JSON with our global utility
              jsonStr = fixTruncatedOrMalformedJson(jsonStr);

              // Try parsing the cleaned JSON
              try {
                extractedData = JSON.parse(jsonStr);
                debugLog("Successfully extracted JSON data");
              } catch (parseError) {
                console.error("JSON parsing error after cleaning:", parseError);

                // Use default form data as fallback
                if (formatType === "contact") {
                  extractedData = createDefaultFormData();
                  debugLog(
                    "Created default contact form data after parse failure"
                  );
                }
              }

              cleanedText = cleanedText.replace(dataMatch[0], "");
            } catch (error) {
              console.error("Error handling JSON data:", error);

              // Create fallback data based on format type
              extractedData = createFallbackData(formatType);

              // Remove the problematic data tag from the text
              cleanedText = cleanedText.replace(dataMatch[0], "");
              cleanedText +=
                "\n\nNote: There was an issue with the data format. Using default template.";
            }
          } else if (formatType && formatType !== "text") {
            // If a non-text format is specified but no data is provided, create fallback data
            debugLog(`No data found for ${formatType} format, using fallback`);
            extractedData = createFallbackData(formatType);
          }

          return {
            cleanedText: cleanedText.trim(),
            extractedData,
            formatType,
          };
        } catch (error) {
          console.error("Error in extractFormatAndData:", error);
          return {
            cleanedText: text,
            extractedData: createFallbackData("text"),
            formatType: "text",
          };
        }
      };

      // Handle message as string (legacy format)
      if (typeof originalMessage === "string") {
        const { cleanedText, extractedData, formatType } =
          extractFormatAndData(originalMessage);
        processed.text = cleanedText;
        processed.format = formatType || "text";
        processed.data = extractedData;
        return setProcessedMessage(processed);
      }

      // Handle message as object (new format)
      if (typeof originalMessage === "object" && originalMessage !== null) {
        debugLog("Processing object message:", originalMessage);

        // Handle case where content is the object containing text, format, etc.
        if (
          originalMessage.content &&
          typeof originalMessage.content === "object"
        ) {
          if (
            originalMessage.content.text ||
            originalMessage.content.text === ""
          ) {
            processed.text = originalMessage.content.text;
            processed.format = originalMessage.content.format || "text";
            processed.data = originalMessage.content.data || null;
            return setProcessedMessage(processed);
          }
        }

        // Get text content
        if (originalMessage.text !== undefined) {
          const { cleanedText, extractedData, formatType } =
            extractFormatAndData(originalMessage.text);
          processed.text = cleanedText;

          // Format can come from: 1) the format tag in text, 2) the format property in the object
          processed.format = formatType || originalMessage.format || "text";

          // Use data from extracted or provided
          processed.data = extractedData || originalMessage.data || null;
          return setProcessedMessage(processed);
        }

        // If no text property, try to convert whole object to string
        console.warn("Message object has no text property:", originalMessage);
        processed.text = "Message format error";
        processed.format = originalMessage.format || "text";
        processed.data = originalMessage.data || null;
        return setProcessedMessage(processed);
      }

      // Fallback for unexpected input
      console.error("Unexpected message format:", originalMessage);
      processed.text = "Error: Unprocessable message format";
      return setProcessedMessage(processed);
    } catch (error) {
      console.error("Error processing message:", error);
      setParseError(error.message);

      // Still set a basic processed message with the error
      setProcessedMessage({
        text:
          typeof originalMessage === "string"
            ? originalMessage
            : typeof originalMessage === "object" && originalMessage.text
            ? originalMessage.text
            : "Error processing message",
        format:
          typeof originalMessage === "object" && originalMessage.format
            ? originalMessage.format
            : "text",
        data: null, // Don't pass potentially corrupted data
      });
    }
  }, []);
  // Process the message when it changes
  useEffect(() => {
    if (message) {
      processMessage(message);
    }
  }, [message, processMessage]);
  // If message is still being processed
  if (!processedMessage) {
    return <div className="animate-pulse">Processing message...</div>;
  }

  // Render the appropriate component based on format
  const renderFormatComponent = () => {
    try {
      // For debugging, also check the format
      debugLog(`Rendering format component: ${processedMessage.format}`);

      switch (processedMessage.format) {
        case "contact":
          return <ContactForm data={processedMessage.data} />;
        default:
          return null;
      }
    } catch (error) {
      console.error("Error rendering format component:", error);
      return (
        <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
          <p className="font-medium">
            Error rendering {processedMessage.format} component
          </p>
          <p className="mt-2">{error.message}</p>
        </div>
      );
    }
  };

  // Handle parse errors with fallback display
  if (parseError) {
    return (
      <div className="space-y-3">
        {/* First show the text content */}
        {processedMessage.text && processedMessage.text.trim() !== "" && (
          <div className="whitespace-pre-wrap leading-relaxed">
            <TextFormatter text={processedMessage.text} isAnimated={false} />
          </div>
        )}

        {/* Then show error message */}
        <div className="mt-2 p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-md">
          <p className="font-medium">Data format error</p>
          <p className="mt-1 text-sm">{parseError}</p>
        </div>

        {/* Still try to render the component with fallback data */}
        {processedMessage.format &&
          processedMessage.format !== "text" &&
          renderFormatComponent()}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Only show text content if it's not empty - use TextFormatter here for consistent markdown formatting */}
      {processedMessage.text && processedMessage.text.trim() !== "" && (
        <div className="whitespace-pre-wrap leading-relaxed">
          <TextFormatter text={processedMessage.text} isAnimated={false} />
        </div>
      )}

      {/* Format-specific component */}
      {renderFormatComponent()}
    </div>
  );
}
