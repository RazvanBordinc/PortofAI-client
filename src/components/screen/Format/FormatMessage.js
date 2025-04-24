import React from "react";
import ContactForm from "./ContactForm";
import DataTable from "./DataTable";
import PdfViewer from "./PdfViewer";

export default function FormatMessage({ message }) {
  // First, check if message is valid
  if (message === null || message === undefined) {
    return (
      <div className="whitespace-pre-wrap leading-relaxed text-red-500">
        Error: Received empty message
      </div>
    );
  }

  // Handle message as a string (legacy format)
  if (typeof message === "string") {
    return <div className="whitespace-pre-wrap leading-relaxed">{message}</div>;
  }

  // Get text content - make sure it's a string
  const messageText =
    typeof message.text === "string"
      ? message.text
      : message.text
      ? String(message.text)
      : "No message content";

  // Get the format from the content object
  const format = message.format || "text";

  // Get any additional data that might be included with the message
  const data = message.data || null;

  // Render the appropriate component based on format, passing any data
  const renderFormatComponent = () => {
    try {
      switch (format) {
        case "contact":
          return <ContactForm data={data} />;
        case "table":
          return <DataTable data={data} />;
        case "pdf":
          return <PdfViewer data={data} />;
        default:
          return null;
      }
    } catch (error) {
      console.error("Error rendering format component:", error);
      return (
        <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
          Error rendering {format} component: {error.message}
        </div>
      );
    }
  };

  return (
    <div className="space-y-3">
      {/* Message text */}
      <div className="whitespace-pre-wrap leading-relaxed">{messageText}</div>

      {/* Format-specific component */}
      {renderFormatComponent()}
    </div>
  );
}
