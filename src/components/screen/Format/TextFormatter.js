"use client";

import React from "react";
import { motion } from "framer-motion";

// Component to format text with markdown-style formatting
const TextFormatter = ({ text, isAnimated = true }) => {
  // If text is not a string, try to convert it
  if (typeof text !== "string") {
    return <span>{String(text || "")}</span>;
  }

  // Split the text by formatting patterns
  const formattedParts = [];
  let remainingText = text;
  let key = 0;

  // Process all formatting patterns
  while (remainingText.length > 0) {
    // Check for bold text pattern: **text** (non-greedy match)
    const boldRegex = /\*\*(.*?)\*\*/;
    const boldMatch = remainingText.match(boldRegex);

    // Check for italic text pattern: *text* (make sure it's not part of **)
    const italicRegex = /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/;
    const italicMatch = remainingText.match(italicRegex);

    // Check for code text pattern: `text`
    const codeRegex = /`(.*?)`/;
    const codeMatch = remainingText.match(codeRegex);

    // Check for links pattern: [text](url)
    const linkRegex = /\[(.*?)\]\((.*?)\)/;
    const linkMatch = remainingText.match(linkRegex);

    // Find the earliest match
    const matches = [
      { type: "bold", match: boldMatch, regex: boldRegex },
      { type: "italic", match: italicMatch, regex: italicRegex },
      { type: "code", match: codeMatch, regex: codeRegex },
      { type: "link", match: linkMatch, regex: linkRegex },
    ].filter((m) => m.match !== null);

    if (matches.length > 0) {
      // Sort matches by their index in the original string
      matches.sort((a, b) => a.match.index - b.match.index);

      // Get the earliest match
      const earliestMatch = matches[0];

      // Add text before the match
      if (earliestMatch.match.index > 0) {
        const textBeforePattern = remainingText.substring(
          0,
          earliestMatch.match.index
        );
        formattedParts.push(
          <NormalText
            key={key++}
            text={textBeforePattern}
            isAnimated={isAnimated}
          />
        );
      }

      // Add the formatted text based on match type
      switch (earliestMatch.type) {
        case "bold":
          formattedParts.push(
            <BoldText
              key={key++}
              text={earliestMatch.match[1]}
              isAnimated={isAnimated}
            />
          );
          break;
        case "italic":
          formattedParts.push(
            <ItalicText
              key={key++}
              text={earliestMatch.match[1]}
              isAnimated={isAnimated}
            />
          );
          break;
        case "code":
          formattedParts.push(
            <CodeText
              key={key++}
              text={earliestMatch.match[1]}
              isAnimated={isAnimated}
            />
          );
          break;
        case "link":
          formattedParts.push(
            <LinkText
              key={key++}
              text={earliestMatch.match[1]}
              url={earliestMatch.match[2]}
              isAnimated={isAnimated}
            />
          );
          break;
      }

      // Update the remaining text
      remainingText = remainingText.substring(
        earliestMatch.match.index + earliestMatch.match[0].length
      );
    } else {
      // No more patterns found, add the remaining text
      formattedParts.push(
        <NormalText key={key++} text={remainingText} isAnimated={isAnimated} />
      );
      remainingText = "";
    }
  }

  return <>{formattedParts}</>;
};

// Styled components for different text formats with minimal animations
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

  // Very subtle animation only for new characters
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

const BoldText = ({ text, isAnimated }) => {
  // Ensure the text is actually bold with proper font weight
  const boldStyle = {
    fontWeight: 700,
    color: "var(--indigo-800, #3730a3)",
  };

  if (!isAnimated) {
    return (
      <strong
        className="font-bold text-indigo-800 dark:text-indigo-300"
        style={boldStyle}
      >
        {text}
      </strong>
    );
  }

  return (
    <motion.strong
      className="font-bold text-indigo-800 dark:text-indigo-300"
      style={boldStyle}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    >
      {text}
    </motion.strong>
  );
};

const ItalicText = ({ text, isAnimated }) => {
  if (!isAnimated) {
    return (
      <em className="italic text-indigo-700 dark:text-indigo-400">{text}</em>
    );
  }

  return (
    <motion.em
      className="italic text-indigo-700 dark:text-indigo-400"
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    >
      {text}
    </motion.em>
  );
};

const CodeText = ({ text, isAnimated }) => {
  if (!isAnimated) {
    return (
      <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm text-pink-600 dark:text-pink-400">
        {text}
      </code>
    );
  }

  return (
    <motion.code
      className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm text-pink-600 dark:text-pink-400"
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    >
      {text}
    </motion.code>
  );
};

const LinkText = ({ text, url, isAnimated }) => {
  if (!isAnimated) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
      >
        {text}
      </a>
    );
  }

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    >
      {text}
    </motion.a>
  );
};

export default TextFormatter;
