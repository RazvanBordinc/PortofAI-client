/**
 * Cleans a response text to fix malformed links and JSON artifacts
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
export const cleanResponseText = (text) => {
  if (!text) return text;

  // Remove trailing JSON artifacts
  let cleaned = text.replace(/[\}\]:\}\]]+$/, "");

  // Remove all format tags with proper regex patterns
  cleaned = cleaned.replace(/\[format:(text|contact)\]/gi, "");
  cleaned = cleaned.replace(/\[\/format\]/gi, "");
  cleaned = cleaned.replace(/\[\/format/gi, ""); // Also catch incomplete tags

  // Clean up any other format-related tags
  cleaned = cleaned.replace(/\[data:[\s\S]*?\]/gs, "");

  // Fix all link issues
  cleaned = fixMalformedLinks(cleaned);
  cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)\)+/g, "[$1]($2)");
  cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)[\)\}\]]+/g, "[$1]($2)");

  return cleaned;
};
export const fixMalformedLinks = (text) => {
  if (!text) return text;

  let cleaned = text;

  // Fix links with missing opening bracket
  cleaned = cleaned.replace(
    /(\s|^)github\.com\/([^)\s]+)\)/g,
    "[$2](https://github.com/$2)"
  );

  // Fix links with missing protocol
  cleaned = cleaned.replace(
    /\[([^\]]+)\]\(github\.com\/([^)]+)\)/g,
    "[$1](https://github.com/$2)"
  );

  // Fix any other malformed links
  cleaned = cleaned.replace(
    /\[([^\]]+)\]\(([^https?][^)]+)\)/g,
    "[$1](https://$2)"
  );

  return cleaned;
};
// Create default contact form data function at the module level
export const createDefaultContactData = () => {
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

/**
 * Fixes truncated or malformed JSON strings
 * @param {string} jsonStr - JSON string to fix
 * @returns {string} Fixed JSON string
 */
export const fixTruncatedOrMalformedJson = (jsonStr) => {
  if (!jsonStr || typeof jsonStr !== "string") return jsonStr;

  try {
    // Check if it looks like a contact form with Email but not formatted as JSON
    if (jsonStr.includes("Email:") && !jsonStr.includes('"Email":')) {
      return JSON.stringify(createDefaultContactData());
    }

    let cleaned = jsonStr.trim();

    // Fix common JSON issues
    cleaned = cleaned
      .replace(/([{,])\s*([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":') // Add missing quotes
      .replace(/\\'/g, "\\TEMP_QUOTE") // Preserve escaped single quotes
      .replace(/'/g, '"') // Replace unescaped single quotes
      .replace(/\\TEMP_QUOTE/g, "\\'") // Restore escaped quotes
      .replace(/,\s*([}\]])/g, "$1") // Remove trailing commas
      .replace(/}(\s*{)/g, "},$1"); // Insert missing commas

    // Fix malformed email formatting in JSON
    cleaned = cleaned.replace(/"Email":\s*\[([^\]]+)\]/g, '"Email": "$1"');
    cleaned = cleaned.replace(/"Email":\s*([^,}]+)(?=[,}])/g, '"Email": "$1"');

    // Balance braces and brackets
    const balanceSymbols = (symbol, opposite) => {
      const open = (cleaned.match(new RegExp(`\\${symbol}`, "g")) || []).length;
      const close = (cleaned.match(new RegExp(`\\${opposite}`, "g")) || [])
        .length;
      return symbol.repeat(open - close);
    };

    cleaned += balanceSymbols("{", "}");
    cleaned += balanceSymbols("[", "]");
    cleaned = cleaned.replace(/\}\]\[\/format:?\s*/g, "");

    // Final parse attempt
    try {
      const parsed = JSON.parse(cleaned);
      return JSON.stringify(parsed); // Re-stringify to ensure valid JSON
    } catch (error) {
      return JSON.stringify(createDefaultContactData());
    }
  } catch (error) {
    return JSON.stringify(createDefaultContactData());
  }
};
/**
 * Processes URLs and emails in text to make them clickable
 * @param {string} text - Text to process
 * @returns {string} Text with processed URLs and emails
 */
export const processUrlsAndEmails = (text) => {
  if (typeof text !== "string") return text;

  // Process plain URLs to markdown links
  const urlRegex = /(https?:\/\/[^\s\)\]]+)/g;
  text = text.replace(urlRegex, (url) => {
    // Skip if it already appears to be in a markdown link
    const prevText = text.substring(
      Math.max(0, text.indexOf(url) - 20),
      text.indexOf(url)
    );
    if (
      prevText.includes("[") &&
      text.substring(text.indexOf(url) + url.length).includes(")")
    ) {
      return url;
    }

    // Create a markdown link
    return `[${url}](${url})`;
  });

  // Process plain emails to markdown style
  const emailRegex = /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g;
  text = text.replace(emailRegex, (email) => {
    // Check if this email is already part of a markdown link
    const prevChar = text.charAt(text.indexOf(email) - 1);
    const nextChar = text.charAt(text.indexOf(email) + email.length);

    // Skip if email appears to be part of a link already
    if (
      prevChar === "(" ||
      nextChar === ")" ||
      prevChar === "[" ||
      nextChar === "]"
    ) {
      return email;
    }

    if (email.includes("@yahoo.com")) {
      return `[${email}](${email})`;
    }

    return `[${email}](${email})`;
  });

  return text;
};
/**
 * Processes a complete AI response to extract format and data
 * @param {string} fullText - The complete AI response text
 * @returns {object} - An object with text, format, and data properties
 */
export const processCompletedResponse = (fullText) => {
  // Apply the text cleaning first to fix any formatting issues
  fullText = cleanResponseText(fullText);

  // Check for format tags in the text
  let format = "text";
  const formatMatch = fullText.match(/\[format:(text|contact)\]/i);
  if (formatMatch) {
    format = formatMatch[1].toLowerCase();
  }

  // Extract data if present
  let formatData = null;
  const dataMatch = fullText.match(/\[data:([\s\S]*?)\]/s);

  if (dataMatch && dataMatch[1]) {
    try {
      let jsonString = dataMatch[1].trim();

      // Fix the JSON before parsing
      jsonString = fixTruncatedOrMalformedJson(jsonString);

      try {
        formatData = JSON.parse(jsonString);
      } catch (error) {
        formatData = createDefaultContactData();
      }
    } catch (error) {
    }
  } else if (format === "contact") {
    formatData = createDefaultContactData();
  }

  // Clean the response text
  let cleanedText = fullText
    .replace(/\[format:(text|contact)\]/gi, "")
    .replace(/\[\/format\]/gi, "");

  if (dataMatch) {
    cleanedText = cleanedText.replace(/\[data:[\s\S]*?\]/s, "");
  }

  // Process URLs and email addresses in the text
  cleanedText = processUrlsAndEmails(cleanedText);

  return {
    text: cleanedText.trim(),
    format,
    data: formatData,
  };
};
