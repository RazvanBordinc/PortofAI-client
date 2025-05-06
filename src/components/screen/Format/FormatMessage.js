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
        url: "bordincrazvan2004@gmail.com",
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
      // Get message content for duplication and contact detection
      let messageContent = "";
      if (typeof originalMessage === "string") {
        messageContent = originalMessage;
      } else if (originalMessage && typeof originalMessage === "object") {
        if (
          originalMessage.content &&
          typeof originalMessage.content === "object"
        ) {
          messageContent = originalMessage.content.text || "";
        } else if (originalMessage.text !== undefined) {
          messageContent = originalMessage.text;
        } else if (typeof originalMessage.content === "string") {
          messageContent = originalMessage.content;
        }
      }

      // 1. DUPLICATION CHECK - Check and fix duplicated text
      if (typeof messageContent === "string" && messageContent.length > 20) {
        const halfLength = Math.floor(messageContent.length / 2);

        // Check for exact duplication (same text repeated twice)
        const firstHalf = messageContent.substring(0, halfLength);
        const secondHalf = messageContent.substring(halfLength);

        if (firstHalf === secondHalf) {
          debugLog("Detected exact duplication, using only first half");
          messageContent = firstHalf;

          // Update the original message with deduplicated content
          if (typeof originalMessage === "string") {
            originalMessage = messageContent;
          } else if (originalMessage && typeof originalMessage === "object") {
            if (
              originalMessage.content &&
              typeof originalMessage.content === "object"
            ) {
              originalMessage.content.text = messageContent;
            } else if (originalMessage.text !== undefined) {
              originalMessage.text = messageContent;
            } else if (typeof originalMessage.content === "string") {
              originalMessage.content = messageContent;
            }
          }
        }

        // Also check for partial duplications (at least 20 characters)
        for (let i = 20; i < messageContent.length / 2; i++) {
          const pattern = messageContent.substring(0, i);
          const nextChunk = messageContent.substring(i, i + pattern.length);

          if (pattern === nextChunk) {
            debugLog("Detected partial duplication, fixing text");
            messageContent =
              pattern + messageContent.substring(i + pattern.length);

            // Update the original message with deduplicated content
            if (typeof originalMessage === "string") {
              originalMessage = messageContent;
            } else if (originalMessage && typeof originalMessage === "object") {
              if (
                originalMessage.content &&
                typeof originalMessage.content === "object"
              ) {
                originalMessage.content.text = messageContent;
              } else if (originalMessage.text !== undefined) {
                originalMessage.text = messageContent;
              } else if (typeof originalMessage.content === "string") {
                originalMessage.content = messageContent;
              }
            }
            break;
          }
        }
      }

      // 2. CONTACT DETECTION - Check for contact information patterns
      if (typeof messageContent === "string") {
        const contactPatterns = [
          /contact me/i,
          /Email:.*?razvan\.bordinc@yahoo\.com/i,
          /mailto:razvan\.bordinc@yahoo\.com/i,
          /GitHub:.*?github\.com\/RazvanBordinc/i,
          /LinkedIn/i,
          /get in touch/i,
          /reach out/i,
          /contact information/i,
        ];

        // Check if any contact patterns are found
        const isContactInfo = contactPatterns.some((pattern) =>
          pattern.test(messageContent)
        );

        // Also check if the message contains both email and GitHub/LinkedIn references
        const hasEmail = messageContent.includes("razvan.bordinc@yahoo.com");
        const hasSocialProfiles =
          (messageContent.includes("GitHub") ||
            messageContent.includes("github.com")) &&
          (messageContent.includes("LinkedIn") ||
            messageContent.includes("linkedin.com"));

        if (isContactInfo || (hasEmail && hasSocialProfiles)) {
          debugLog(
            "Detected contact information pattern, using contact format"
          );
          processed.text = messageContent
            .replace(/\[format:(text|contact)\]/gi, "")
            .replace(/\[\/format\]/gi, "");
          processed.format = "contact";
          processed.data = createDefaultFormData();
          return setProcessedMessage(processed);
        }
      }

      // 3. REGULAR FORMAT DETECTION - Continue with normal processing
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
          // Extract format with improved regex
          const formatRegex =
            /\[format:(text|contact)\]|\* \*\*Email:\*\*|\bcontact\s+form\b/i;
          const formatMatch = text.match(formatRegex);
          if (formatMatch) {
            formatType = formatMatch[1]?.toLowerCase() || "contact";
            cleanedText = cleanedText.replace(formatMatch[0], "");
          }

          // Remove format closing tags
          cleanedText = cleanedText.replace(/\[\/format\]/gi, "");
          cleanedText = cleanedText.replace(/\[\/format/gi, ""); // Also catch incomplete tags

          // Extract data with better error handling
          const dataRegex = /\[data:([\s\S]*?)\]/;
          const dataMatch = text.match(dataRegex);

          if (dataMatch && dataMatch[1]) {
            try {
              let jsonStr = dataMatch[1].trim();
              debugLog("Raw JSON data:", jsonStr);

              // Fix the JSON with our global utility
              jsonStr = fixTruncatedOrMalformedJson(jsonStr);

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
              extractedData = createFallbackData(formatType);
              cleanedText = cleanedText.replace(dataMatch[0], "");
            }
          } else if (
            formatType === "contact" ||
            cleanedText.includes("razvan.bordinc@yahoo.com")
          ) {
            // If contact format is detected but no data, use default contact data
            debugLog("Contact format detected, using default contact data");
            extractedData = createDefaultFormData();
          } else if (formatType && formatType !== "text") {
            // For other non-text formats without data
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

            // Special handling for contact format without data
            if (processed.format === "contact" && !processed.data) {
              processed.data = createDefaultFormData();
            }

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

          // Special handling for contact format without data
          if (processed.format === "contact" && !processed.data) {
            processed.data = createDefaultFormData();
          }

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
      {/* Clean text content more aggressively before rendering */}
      {processedMessage.text && processedMessage.text.trim() !== "" && (
        <div className="whitespace-pre-wrap leading-relaxed">
          <TextFormatter
            text={processedMessage.text
              .replace(/\[\/format\]/gi, "")
              .replace(/\[format:(text|contact)\]/gi, "")}
            isAnimated={false}
          />
        </div>
      )}

      {/* Format-specific component */}
      {renderFormatComponent()}
    </div>
  );
}
