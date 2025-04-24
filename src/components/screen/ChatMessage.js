"use client";

import React from "react";
import ChatBubble from "./ChatBubble";

export default function ChatMessage({ message }) {
  // Ensure the message has the expected structure
  const validatedMessage = {
    ...message,
    // If content is an object but doesn't have expected properties, fix it
    content:
      typeof message.content === "object" && message.content !== null
        ? {
            text: message.content.text || String(message.content),
            format: message.content.format || "text",
            data: message.content.data || null,
          }
        : {
            text: String(message.content),
            format: "text",
            data: null,
          },
  };

  return <ChatBubble message={validatedMessage} />;
}
