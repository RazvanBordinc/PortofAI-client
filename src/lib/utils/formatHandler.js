/**
 * Format Handler Utility
 * Provides consistent handling of formatted messages across components
 */

/**
 * Extract format type and data from a message
 * @param {string} text - The message text to process
 * @returns {Object} - Object containing cleanedText, formatType and extractedData
 */
export function extractFormatAndData(text) {
  if (typeof text !== "string") {
    return {
      cleanedText: String(text || ""),
      formatType: null,
      extractedData: null,
    };
  }

  let cleanedText = text;
  let formatType = null;
  let extractedData = null;

  try {
    // Extract format tag
    const formatRegex = /\[format:(text|table|contact|pdf)\]/i;
    const formatMatch = text.match(formatRegex);
    if (formatMatch) {
      formatType = formatMatch[1].toLowerCase();
      cleanedText = cleanedText.replace(formatMatch[0], "");
    }

    // Remove closing format tag
    cleanedText = cleanedText.replace(/\[\/format\]/gi, "");

    // Extract data tag
    const dataRegex = /\[data:([\s\S]*?)\]/;
    const dataMatch = text.match(dataRegex);

    if (dataMatch && dataMatch[1]) {
      try {
        let jsonStr = dataMatch[1].trim();
        console.log("Raw JSON data found");

        // Clean up common JSON errors
        jsonStr = cleanJsonString(jsonStr);

        // Parse JSON
        extractedData = JSON.parse(jsonStr);
        cleanedText = cleanedText.replace(dataMatch[0], "");
        console.log("Successfully extracted and parsed JSON data");
      } catch (error) {
        console.error("JSON parsing error:", error);
        extractedData = {
          error: "Could not parse JSON data: " + error.message,
        };
      }
    }

    return {
      cleanedText: cleanedText.trim(),
      formatType,
      extractedData,
    };
  } catch (error) {
    console.error("Error extracting format and data:", error);
    return {
      cleanedText: text,
      formatType: null,
      extractedData: { error: error.message },
    };
  }
}

/**
 * Process a complete message object to extract format and data
 * @param {Object|string} message - The message to process
 * @returns {Object} - Processed message with text, format, and data properties
 */
export function processMessage(message) {
  // Initialize default structure
  let processed = {
    text: "",
    format: "text",
    data: null,
  };

  try {
    // Handle string messages
    if (typeof message === "string") {
      const { cleanedText, formatType, extractedData } =
        extractFormatAndData(message);
      processed.text = cleanedText;
      processed.format = formatType || "text";
      processed.data = extractedData;
      return processed;
    }

    // Handle object messages
    if (message && typeof message === "object") {
      // Handle case where the message is already in our expected format
      if (message.format && message.text !== undefined) {
        processed.format = message.format;
        processed.text = message.text;
        processed.data = message.data || null;

        // Still check for embedded data in text
        if (!processed.data && processed.text) {
          const { extractedData } = extractFormatAndData(processed.text);
          if (extractedData) {
            processed.data = extractedData;
            // Remove the data tag from the text if we extracted data
            const { cleanedText } = extractFormatAndData(processed.text);
            processed.text = cleanedText;
          }
        }

        return processed;
      }

      // If format is not defined but we have a text property
      if (message.text !== undefined) {
        const { cleanedText, formatType, extractedData } = extractFormatAndData(
          message.text
        );
        processed.text = cleanedText;
        processed.format = formatType || "text";
        processed.data = extractedData || message.data || null;
        return processed;
      }

      // If it's an object but doesn't match our expected structure
      processed.text = "Message format error: " + JSON.stringify(message);
      console.warn("Unexpected message format:", message);
    }

    return processed;
  } catch (error) {
    console.error("Error processing message:", error);
    return {
      text: typeof message === "string" ? message : "Error processing message",
      format: "text",
      data: { error: error.message },
    };
  }
}

/**
 * Clean up a JSON string to fix common formatting errors
 * @param {string} jsonStr - The JSON string to clean
 * @returns {string} - The cleaned JSON string
 */
export function cleanJsonString(jsonStr) {
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
}

/**
 * Process the response from the server for display
 * @param {Object} responseData - Response data from the server
 * @returns {Object} - Processed message with text, format, and data
 */
export function processServerResponse(responseData) {
  // Extract response text
  const responseText =
    typeof responseData.response === "string"
      ? responseData.response
      : "Invalid response format from server";

  // Determine format
  let format = responseData.format || "text";

  // Check for format tag in text which overrides server format
  const formatMatch = responseText.match(
    /\[format:(text|table|contact|pdf)\]/i
  );
  if (formatMatch) {
    format = formatMatch[1].toLowerCase();
  }

  // Extract data
  let formatData = responseData.formatData || null;

  // If no data provided by server, try to extract from text
  if (!formatData) {
    const { extractedData } = extractFormatAndData(responseText);
    formatData = extractedData;
  }

  // Clean the text
  const { cleanedText } = extractFormatAndData(responseText);

  return {
    text: cleanedText,
    format,
    data: formatData,
  };
}
