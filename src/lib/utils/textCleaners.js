/**
 * Cleans a response text to fix malformed links and JSON artifacts
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
export const cleanResponseText = (text) => {
  if (!text) return text;

  // Remove trailing JSON artifacts that appear frequently
  let cleaned = text.replace(/[\}\]:\}\]]+$/, "");

  // Fix malformed markdown links with extra closing parentheses
  cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)\)+/g, "[$1]($2)");

  // Fix links with extra brackets or braces
  cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)[\)\}\]]+/g, "[$1]($2)");

  // Fix any malformed URL encoding in links
  cleaned = cleaned.replace(
    /\[([^\]]+)\]\(([^)]+)%([^)]+)\)/g,
    (match, text, url1, url2) => {
      // Only fix if it's not already a properly encoded URL
      if (
        !url1.includes("%2") &&
        !url1.includes("%3") &&
        !url1.includes("%4")
      ) {
        return `[${text}](${url1}%${url2})`;
      }
      return match; // Leave properly encoded URLs alone
    }
  );

  // Remove any stray JSON characters
  cleaned = cleaned.replace(/[\{\}\[\]]+$/g, "");

  return cleaned;
};

/**
 * Fixes truncated or malformed JSON strings
 * @param {string} jsonStr - JSON string to fix
 * @returns {string} Fixed JSON string
 */
export const fixTruncatedOrMalformedJson = (jsonStr) => {
  if (!jsonStr) return jsonStr;

  // Store original for comparison
  const original = jsonStr;
  let cleaned = jsonStr;

  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();

  // Count opening and closing braces/brackets
  const openBraces = (cleaned.match(/{/g) || []).length;
  const closeBraces = (cleaned.match(/}/g) || []).length;
  const openBrackets = (cleaned.match(/\[/g) || []).length;
  const closeBrackets = (cleaned.match(/\]/g) || []).length;

  // Fix missing quotes around property names
  cleaned = cleaned.replace(/([{,])\s*([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');

  // Fix single quotes to double quotes
  cleaned = cleaned
    .replace(/\\'/g, "\\TEMP_QUOTE")
    .replace(/'/g, '"')
    .replace(/\\TEMP_QUOTE/g, "\\'");

  // Remove trailing commas
  cleaned = cleaned.replace(/,\s*}/g, "}").replace(/,\s*\]/g, "]");

  // Remove any unescaped newlines inside strings
  cleaned = cleaned.replace(/([^\\])"([^"]*)\n([^"]*)"/g, '$1"$2 $3"');

  // Balance brackets if needed
  if (openBraces > closeBraces) {
    for (let i = 0; i < openBraces - closeBraces; i++) {
      cleaned += "}";
    }
  }

  if (openBrackets > closeBrackets) {
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      cleaned += "]";
    }
  }

  // Special handling for contact form data
  if (cleaned.includes("socialLinks") && cleaned.includes("platform")) {
    try {
      JSON.parse(cleaned);
    } catch (error) {
      console.error("Contact form JSON still invalid after cleaning:", error);

      // Aggressive fix for common contact form issues
      if (cleaned.includes("socialLinks") && !cleaned.endsWith("}")) {
        if (cleaned.endsWith("]")) {
          cleaned += "}";
        } else if (!cleaned.endsWith("]}")) {
          cleaned += "]}";
        }
      }
    }
  }

  return cleaned;
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

    // Handle Yahoo email addresses with special styling
    if (email.includes("@yahoo.com")) {
      return `[${email}](mailto:${email})`;
    }

    return `[${email}](mailto:${email})`;
  });

  return text;
};
