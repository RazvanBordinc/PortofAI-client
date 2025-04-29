import React, { useEffect, useState, useCallback } from "react";
import ContactForm from "./ContactForm";

export default function FormatMessage({ message }) {
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
    console.log("FormatMessage processing:", originalMessage);
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
        processed.format = formatType || "text";
        processed.data = extractedData;
        return setProcessedMessage(processed);
      }

      // Handle message as object (new format)
      if (typeof originalMessage === "object" && originalMessage !== null) {
        console.log("Processing object message:", originalMessage);

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
      const formatRegex = /\[format:(text|contact)\]/i;
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

          // Log the string for debugging
          console.log("Raw JSON data:", jsonStr);

          // Try to clean up common JSON issues
          jsonStr = cleanJsonString(jsonStr);
          console.log("Cleaned JSON data:", jsonStr);

          // Try parsing the cleaned JSON
          try {
            extractedData = JSON.parse(jsonStr);
            console.log("Successfully extracted JSON data:", extractedData);
          } catch (parseError) {
            console.error("JSON parsing error after cleaning:", parseError);

            // One more attempt with a more aggressive cleanup
            jsonStr = jsonStr
              .replace(/\}\s*\]/g, "}]")
              .replace(/\]\s*\}/g, "]}");
            try {
              extractedData = JSON.parse(jsonStr);
              console.log("Successfully parsed JSON after aggressive cleaning");
            } catch (finalError) {
              console.error("Final JSON parsing error:", finalError);
              // Fall back to default data
              extractedData = createFallbackData(formatType);
              throw new Error(
                `Could not parse JSON data: ${finalError.message}`
              );
            }
          }

          cleanedText = cleanedText.replace(dataMatch[0], "");
        } catch (error) {
          console.error(
            "Error handling JSON data:",
            error,
            "JSON string:",
            dataMatch[1].substring(0, 100)
          );

          // Create fallback data based on format type
          extractedData = createFallbackData(formatType);

          // Remove the problematic data tag from the text
          cleanedText = cleanedText.replace(dataMatch[0], "");
          cleanedText +=
            "\n\nNote: There was an issue with the data format. Using default template.";
        }
      } else if (formatType && formatType !== "text") {
        // If a non-text format is specified but no data is provided, create fallback data
        console.warn(`No data found for ${formatType} format, using fallback`);
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

  // Clean up a JSON string to fix common formatting errors
  const cleanJsonString = (jsonStr) => {
    if (!jsonStr) return jsonStr;

    // Handle any extra characters at the end that could break JSON
    let cleaned = jsonStr;

    // Look for trailing "]}}" pattern and fix it if needed
    if (cleaned.match(/\]\s*\}\s*\}+\s*$/)) {
      cleaned = cleaned.replace(/\]\s*\}\s*\}+\s*$/, "]}");
    }

    // Replace JavaScript-style property names (without quotes) with JSON-style (with quotes)
    cleaned = cleaned.replace(/([{,])\s*([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');

    // Replace single quotes with double quotes (handling escaped quotes)
    cleaned = cleaned
      .replace(/\\'/g, "\\TEMP_QUOTE") // Temporarily replace escaped single quotes
      .replace(/'/g, '"') // Replace all single quotes with double quotes
      .replace(/\\TEMP_QUOTE/g, "\\'"); // Restore escaped single quotes

    // Remove trailing commas in objects and arrays
    cleaned = cleaned.replace(/,\s*}/g, "}").replace(/,\s*\]/g, "]");

    // Remove any unescaped newlines inside strings
    cleaned = cleaned.replace(/([^\\])"([^"]*)\n([^"]*)"/g, '$1"$2 $3"');

    // Remove any control characters
    cleaned = cleaned.replace(/[\x00-\x1F]/g, " ");

    return cleaned;
  };

  // Create fallback data based on format type
  const createFallbackData = (formatType) => {
    switch (formatType) {
      case "contact":
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
          ],
        };

      default:
        return null;
    }
  };

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
            {processedMessage.text}
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
