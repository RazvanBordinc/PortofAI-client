/**
 * URL Detection and Processing Helper Functions
 *
 * These functions help enhance the chat experience by detecting and properly
 * formatting URLs and email addresses in messages.
 */

/**
 * Detects URLs, email addresses, and other formatted text in a string
 * @param {string} text - The text to analyze
 * @returns {boolean} - True if any rich content is detected
 */
export const hasRichContent = (text) => {
  if (typeof text !== "string") return false;

  // Check for emails (with or without mailto:)
  const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  if (emailPattern.test(text)) return true;

  // Check for markdown links: [text](url)
  if (/\[.*?\]\(.*?\)/.test(text)) return true;

  // Check for plain URLs: http(s)://example.com
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  if (urlPattern.test(text)) return true;

  // Check for markdown formatting: **bold**, *italic*, or `code`
  if (
    /\*\*.*?\*\*/.test(text) ||
    /\*[^*].*?\*/.test(text) ||
    /`.*?`/.test(text)
  )
    return true;

  return false;
};

/**
 * Processes URLs and emails in plain text to convert them to clickable elements
 * @param {string} text - The text to process
 * @returns {string} - Text with markdown-formatted links
 */
export const processUrlsAndEmails = (text) => {
  if (typeof text !== "string") return text;

  // Process plain URLs to markdown links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  text = text.replace(urlRegex, (url) => {
    // Try to create a user-friendly display name for the URL
    let displayUrl = url;
    try {
      const urlObj = new URL(url);
      // Use hostname and pathname (truncated if too long)
      displayUrl =
        urlObj.hostname +
        (urlObj.pathname !== "/"
          ? urlObj.pathname.length > 20
            ? urlObj.pathname.substring(0, 20) + "..."
            : urlObj.pathname
          : "");
    } catch (e) {
      // If URL parsing fails, use the original
      displayUrl = url.length > 30 ? url.substring(0, 30) + "..." : url;
    }

    return `[${displayUrl}](${url})`;
  });

  // Process plain emails to markdown links with mailto:
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  text = text.replace(emailRegex, (email) => {
    // Only convert emails that aren't already in markdown link format
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

    return `[${email}](mailto:${email})`;
  });

  return text;
};

/**
 * Enhances a message object to include rich content formatting
 * @param {object} message - The message object
 * @returns {object} - The enhanced message
 */
export const enhanceMessage = (message) => {
  if (!message) return message;

  // Create a deep copy to avoid mutating the original
  const enhancedMessage = JSON.parse(JSON.stringify(message));

  // Process message content
  if (typeof enhancedMessage.content === "string") {
    enhancedMessage.content = processUrlsAndEmails(enhancedMessage.content);
  } else if (
    enhancedMessage.content &&
    typeof enhancedMessage.content.text === "string"
  ) {
    enhancedMessage.content.text = processUrlsAndEmails(
      enhancedMessage.content.text
    );
  }

  // Add a flag indicating if the message has rich content
  if (typeof enhancedMessage.content === "string") {
    enhancedMessage.hasRichContent = hasRichContent(enhancedMessage.content);
  } else if (
    enhancedMessage.content &&
    typeof enhancedMessage.content.text === "string"
  ) {
    enhancedMessage.hasRichContent = hasRichContent(
      enhancedMessage.content.text
    );
  }

  return enhancedMessage;
};
