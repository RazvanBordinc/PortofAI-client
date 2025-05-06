"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, ExternalLink } from "lucide-react";

// Component to format text with markdown-style formatting and special URL/email detection
const TextFormatter = ({ text, isAnimated = true }) => {
  // If text is not a string, try to convert it
  if (typeof text !== "string") {
    return <span>{String(text || "")}</span>;
  }

  // Process the text to detect and format all elements
  const formattedElements = processText(text, isAnimated);
  return <>{formattedElements}</>;
};

const processText = (text, isAnimated) => {
  // Split the text into components: regular text, emails, URLs, and markdown
  const components = [];
  let currentText = "";
  let key = 0;

  // Use a state machine approach to parse the text
  let i = 0;

  while (i < text.length) {
    // Look for email pattern
    const emailMatch = text
      .slice(i)
      .match(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/);

    // IMPROVED: More robust URL pattern that handles various URL formats
    const urlMatch = text.slice(i).match(/\bhttps?:\/\/[^\s)\]]+/);

    // IMPROVED: Better markdown link detection that prevents double parsing
    const linkMatch = text.slice(i).match(/\[([^\]]+)\]\(([^)]+)\)/);

    // Look for markdown bold pattern
    const boldMatch = text.slice(i).match(/\*\*(.*?)\*\*/);

    // Look for markdown italic pattern
    const italicMatch = text
      .slice(i)
      .match(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/);

    // Look for markdown code pattern
    const codeMatch = text.slice(i).match(/`([^`]+)`/);

    // Determine the closest match
    const matches = [];
    if (emailMatch)
      matches.push({
        type: "email",
        match: emailMatch,
        index: i + emailMatch.index,
      });
    if (urlMatch)
      matches.push({ type: "url", match: urlMatch, index: i + urlMatch.index });
    if (boldMatch)
      matches.push({
        type: "bold",
        match: boldMatch,
        index: i + boldMatch.index,
      });
    if (italicMatch)
      matches.push({
        type: "italic",
        match: italicMatch,
        index: i + italicMatch.index,
      });
    if (codeMatch)
      matches.push({
        type: "code",
        match: codeMatch,
        index: i + codeMatch.index,
      });
    if (linkMatch)
      matches.push({
        type: "link",
        match: linkMatch,
        index: i + linkMatch.index,
      });

    // Sort matches by index to find the closest one
    matches.sort((a, b) => a.index - b.index);

    if (matches.length > 0) {
      const closestMatch = matches[0];

      // Add text before the match
      if (closestMatch.index > i) {
        currentText += text.slice(i, closestMatch.index);
      }

      // Add any accumulated text as a normal text component
      if (currentText) {
        components.push(
          <NormalText key={key++} text={currentText} isAnimated={isAnimated} />
        );
        currentText = "";
      }

      // Add the matched component
      switch (closestMatch.type) {
        case "email":
          components.push(
            <EmailText
              key={key++}
              email={closestMatch.match[0]}
              isAnimated={isAnimated}
            />
          );
          i = closestMatch.index + closestMatch.match[0].length;
          break;

        case "url":
          components.push(
            <UrlText
              key={key++}
              url={closestMatch.match[0]}
              isAnimated={isAnimated}
            />
          );
          i = closestMatch.index + closestMatch.match[0].length;
          break;

        case "bold":
          components.push(
            <BoldText
              key={key++}
              text={closestMatch.match[1]}
              isAnimated={isAnimated}
            />
          );
          i = closestMatch.index + closestMatch.match[0].length;
          break;

        case "italic":
          components.push(
            <ItalicText
              key={key++}
              text={closestMatch.match[1]}
              isAnimated={isAnimated}
            />
          );
          i = closestMatch.index + closestMatch.match[0].length;
          break;

        case "code":
          components.push(
            <CodeText
              key={key++}
              text={closestMatch.match[1]}
              isAnimated={isAnimated}
            />
          );
          i = closestMatch.index + closestMatch.match[0].length;
          break;

        case "link":
          // IMPROVED: Clean both text and URL parts of the link
          let linkText = closestMatch.match[1].trim();
          let linkUrl = closestMatch.match[2].trim();

          // Fix common URL issues
          linkUrl = linkUrl.replace(/[\)\}\]]+$/, ""); // Remove trailing brackets
          linkUrl = linkUrl.replace(
            /^(github\.com|linkedin\.com)/i,
            "https://$1"
          ); // Add protocol if missing

          // Fix GitHub URL completion
          if (linkUrl.includes("github.com/RazvanBordinc/cyber-portfolio")) {
            linkUrl = "https://github.com/RazvanBordinc/cyber-portfolio";
          }

          // Handle truncated URLs
          if (linkText.includes("...")) {
            if (linkText.includes("github.com/RazvanBordinc/cyber")) {
              linkText = "github.com/RazvanBordinc/cyber-portfolio";
              linkUrl = "https://github.com/RazvanBordinc/cyber-portfolio";
            }
            if (linkText.includes("linkedin.com/in/valentin-r")) {
              linkText = "LinkedIn Profile";
              linkUrl =
                "https://linkedin.com/in/valentin-r%C4%83zvan-bord%C3%AEnc-30686a298/";
            }
          }

          // Fix malformed LinkedIn links specifically
          if (linkText.includes("linkedin.com")) {
            linkText = "LinkedIn Profile";
            linkUrl =
              "https://linkedin.com/in/valentin-r%C4%83zvan-bord%C3%AEnc-30686a298/";
          }

          components.push(
            <LinkText
              key={key++}
              text={linkText}
              url={linkUrl}
              isAnimated={isAnimated}
            />
          );
          i = closestMatch.index + closestMatch.match[0].length;
          break;

        default:
          // Should never reach here
          i++;
          break;
      }
    } else {
      // No matches found, add remaining text
      currentText += text.slice(i);
      break;
    }
  }

  // Add any remaining text
  if (currentText || i < text.length) {
    if (i < text.length) {
      currentText += text.slice(i);
    }
    components.push(
      <NormalText key={key++} text={currentText} isAnimated={isAnimated} />
    );
  }

  return components;
};

// Normal text component
const NormalText = ({ text, isAnimated }) => {
  // Replace newlines with line breaks
  const processedText = text.split("\n").map((line, i) => (
    <React.Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </React.Fragment>
  ));

  if (!isAnimated) {
    return <span>{processedText}</span>;
  }

  return (
    <motion.span
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    >
      {processedText}
    </motion.span>
  );
};

// Bold text component
const BoldText = ({ text, isAnimated }) => {
  const element = (
    <strong className="font-bold text-amber-800 dark:text-amber-300 break-words">
      {text}
    </strong>
  );

  if (!isAnimated) return element;

  return (
    <motion.span
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    >
      {element}
    </motion.span>
  );
};

// Italic text component
const ItalicText = ({ text, isAnimated }) => {
  const element = (
    <em className="italic text-amber-700 dark:text-amber-400 break-words">
      {text}
    </em>
  );

  if (!isAnimated) return element;

  return (
    <motion.span
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    >
      {element}
    </motion.span>
  );
};

// Code text component
const CodeText = ({ text, isAnimated }) => {
  const element = (
    <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm text-pink-600 dark:text-pink-400 break-words">
      {text}
    </code>
  );

  if (!isAnimated) return element;

  return (
    <motion.span
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    >
      {element}
    </motion.span>
  );
};

// Link text component
const LinkText = ({ text, url, isAnimated }) => {
  if (url && !url.startsWith("http") && !url.startsWith("mailto:")) {
    if (url.includes("@")) {
      url = `mailto:${url}`;
    } else {
      url = `https://${url}`;
    }
  }
  if (url && url.includes("linkedin.com/in/") && !url.startsWith("http")) {
    url = `https://${url}`;
  }
  const element = (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-amber-600 dark:text-amber-400 underline hover:text-amber-800 dark:hover:text-amber-300 transition-colors break-words"
    >
      {text}
    </a>
  );

  if (!isAnimated) return element;

  return (
    <motion.span
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    >
      {element}
    </motion.span>
  );
};

// URL component with special styling
const UrlText = ({ url, isAnimated }) => {
  const element = (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center rounded-md py-1 px-2 bg-blue-50 dark:bg-blue-900/30 text-amber-600 dark:text-amber-300 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors cursor-pointer no-underline text-sm break-words"
    >
      <ExternalLink size={14} className="mr-1.5 flex-shrink-0" />
      <span className="truncate max-w-[200px]">{url}</span>
    </a>
  );

  if (!isAnimated) return element;

  return (
    <motion.span
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    >
      {element}
    </motion.span>
  );
};

// Email component with special styling
const EmailText = ({ email, isAnimated }) => {
  // Fix duplicate mailto: problem
  let mailtoUrl = email;

  // Remove any existing mailto: prefix before adding it again
  if (mailtoUrl.startsWith("mailto:")) {
    mailtoUrl = mailtoUrl.substring(7);
  }

  // Now add the prefix properly
  mailtoUrl = `mailto:${mailtoUrl}`;

  const element = (
    <a
      href={mailtoUrl}
      className="inline-flex items-center rounded-md py-1 px-2 bg-indigo-50 dark:bg-indigo-900/30 text-amber-600 dark:text-amber-300 hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-colors cursor-pointer no-underline"
    >
      <Mail size={14} className="mr-1.5 flex-shrink-0" />
      <span>{email}</span>
    </a>
  );

  if (!isAnimated) return element;

  return (
    <motion.span
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    >
      {element}
    </motion.span>
  );
};

export default TextFormatter;
