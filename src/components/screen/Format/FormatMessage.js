import React, { useEffect, useState, useCallback } from "react";
import ContactForm from "./ContactForm";
import DataTable from "./DataTable";
import PdfViewer from "./PdfViewer";

export default function FormatMessage({ message }) {
  const [processedMessage, setProcessedMessage] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [rawMessage, setRawMessage] = useState(null);

  // Wrap processMessage in useCallback to prevent infinite re-renders
  const processMessage = useCallback((originalMessage) => {
    console.log("FormatMessage processing:", originalMessage);
    setRawMessage(originalMessage); // Save the raw message for debugging/fallback
    setParseError(null);

    // Initialize default processed message
    let processed = {
      text: "",
      format: "text",
      data: null,
    };

    try {
      // Handle message as string (legacy format)
      if (typeof originalMessage === "string") {
        const { cleanedText, extractedData, formatType } =
          extractFormatAndData(originalMessage);
        processed.text = cleanedText;
        processed.data = extractedData;
        processed.format = formatType || "text";
      }
      // Handle message as object (new format)
      else if (
        typeof originalMessage === "object" &&
        originalMessage !== null
      ) {
        console.log("Processing object message:", originalMessage);

        // Get text content
        if (originalMessage.text || originalMessage.text === "") {
          const { cleanedText, extractedData, formatType } =
            extractFormatAndData(originalMessage.text);
          processed.text = cleanedText;

          // If data was found in text and not provided separately, use it
          if (extractedData && !originalMessage.data) {
            processed.data = extractedData;
          } else {
            processed.data = originalMessage.data || null;
          }

          // Format can come from: 1) the format tag in text, 2) the format property in the object
          processed.format = formatType || originalMessage.format || "text";
        } else {
          // No text property, try to convert whole object to string
          console.warn("Message object has no text property:", originalMessage);
          processed.text = "Message format error";
          processed.format = originalMessage.format || "text";
          processed.data = originalMessage.data || null;
        }
      } else {
        // Fallback for unexpected input
        console.error("Unexpected message format:", originalMessage);
        processed.text = "Error: Unprocessable message format";
      }

      console.log("Processed message:", {
        format: processed.format,
        dataAvailable: processed.data !== null,
        textLength: processed.text?.length || 0,
      });

      setProcessedMessage(processed);
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
        data: {
          error: error.message,
        },
      });
    }
  }, []);

  // Extract format and data from text
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
      const formatRegex = /\[format:(text|table|contact|pdf)\]/i;
      const formatMatch = text.match(formatRegex);
      if (formatMatch) {
        formatType = formatMatch[1].toLowerCase();
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
          // Log the first part of the JSON string for debugging
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

          // Try parsing the cleaned JSON
          extractedData = JSON.parse(jsonStr);
          cleanedText = cleanedText.replace(dataMatch[0], "");
          console.log("Successfully extracted JSON data");
        } catch (error) {
          console.error(
            "Error parsing JSON data:",
            error,
            "JSON string:",
            dataMatch[1]
          );
          extractedData = {
            error: "Could not parse JSON data: " + error.message,
          };
        }
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
        extractedData: { error: error.message },
        formatType: null,
      };
    }
  };

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
      console.log(`Rendering format component: ${processedMessage.format}`);

      switch (processedMessage.format) {
        case "contact":
          return <ContactForm data={processedMessage.data} />;
        case "table":
          return <DataTable data={processedMessage.data} />;
        case "pdf":
          return <PdfViewer data={processedMessage.data} />;
        default:
          return null;
      }
    } catch (error) {
      console.error("Error rendering format component:", error);
      return (
        <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
          <details>
            <summary className="font-medium cursor-pointer">
              Error rendering {processedMessage.format} component
            </summary>
            <p className="mt-2">{error.message}</p>
            {rawMessage && (
              <div className="mt-3 p-2 bg-slate-100 dark:bg-slate-800 rounded border border-red-200 dark:border-red-800 overflow-auto">
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(rawMessage, null, 2)}
                </pre>
              </div>
            )}
          </details>
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
            {processedMessage.text}
          </div>
        )}

        {/* Then show error message */}
        <div className="mt-2 p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-md">
          <details>
            <summary className="font-medium cursor-pointer">
              Data format error (click to see details)
            </summary>
            <p className="mt-2 text-sm">{parseError}</p>
            {rawMessage && (
              <div className="mt-3 p-2 bg-slate-100 dark:bg-slate-800 rounded border border-orange-200 dark:border-orange-800 overflow-auto">
                <p className="text-xs mb-1 opacity-70">Raw message:</p>
                <pre className="text-xs whitespace-pre-wrap">
                  {typeof rawMessage === "string"
                    ? rawMessage
                    : JSON.stringify(rawMessage, null, 2)}
                </pre>
              </div>
            )}
          </details>
        </div>

        {/* Still try to render the component if we have format and fallback data */}
        {processedMessage.format &&
          processedMessage.format !== "text" &&
          renderFormatComponent()}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Only show text content if it's not empty */}
      {processedMessage.text && processedMessage.text.trim() !== "" && (
        <div className="whitespace-pre-wrap leading-relaxed">
          {processedMessage.text}
        </div>
      )}

      {/* Format-specific component */}
      {renderFormatComponent()}
    </div>
  );
}
