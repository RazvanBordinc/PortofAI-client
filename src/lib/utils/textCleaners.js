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
    let cleaned = jsonStr.trim();

    // Early return if already valid
    try {
      JSON.parse(cleaned);
      return cleaned;
    } catch {}

    // Step-by-step cleanup
    cleaned = cleaned
      .replace(/([{,])\s*([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":') // Add missing quotes
      .replace(/\\'/g, "\\TEMP_QUOTE") // Preserve escaped single quotes
      .replace(/'/g, '"') // Replace unescaped single quotes
      .replace(/\\TEMP_QUOTE/g, "\\'") // Restore escaped quotes
      .replace(/,\s*([}\]])/g, "$1") // Remove trailing commas
      .replace(/}(\s*{)/g, "},$1"); // Insert missing commas between objects in arrays

    // Balance braces and brackets
    const balanceSymbols = (symbol, opposite) => {
      const open = (cleaned.match(new RegExp(`\\${symbol}`, "g")) || []).length;
      const close = (cleaned.match(new RegExp(`\\${opposite}`, "g")) || [])
        .length;
      return symbol.repeat(open - close);
    };

    cleaned += balanceSymbols("{", "}");
    cleaned += balanceSymbols("[", "]");
    cleaned.replace(/\}\]\[\/format:?\s*/g, "");
    // Final parse attempt
    try {
      JSON.parse(cleaned);
      return cleaned;
    } catch (error) {
      console.error("JSON still invalid after cleaning:", error);
      if (cleaned.includes("socialLinks") || cleaned.includes("Contact Form")) {
        return JSON.stringify(createDefaultContactData(), null, 2);
      }
      return cleaned;
    }
  } catch (error) {
    console.log("here", 222);
    console.error("Fatal error during JSON cleanup:", error);
    return JSON.stringify(createDefaultContactData(), null, 2);
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

    // Handle Yahoo email addresses with special styling
    if (email.includes("@yahoo.com")) {
      return `[${email}](mailto:${email})`;
    }

    return `[${email}](mailto:${email})`;
  });

  return text;
};
