import React from "react";
import ContactForm from "./ContactForm";
import DataTable from "./DataTable";
import PdfViewer from "./PdfViewer";

export default function FormatMessage({ message }) {
  // First, check if message is a valid object
  if (!message || typeof message !== "object") {
    return (
      <div className="whitespace-pre-wrap leading-relaxed">
        {String(message)}
      </div>
    );
  }

  // Get text content - handle both string and object formats
  const messageText =
    typeof message === "string" ? message : message.text || "";

  // Get the format from the content object
  const format = message.format || "text";

  // Get any additional data that might be included with the message
  const data = message.data || null;

  // Render the appropriate component based on format, passing any data
  const renderFormatComponent = () => {
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
