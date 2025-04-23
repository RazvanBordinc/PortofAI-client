import React from "react";
export default function FormatMessage({ message, format }) {
  if (format === "contact") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">d</div>
      </div>
    );
    return (
      <div className="">
        <div>{message}</div>
      </div>
    );
  } else if (format === "text") {
    return (
      <div>
        <div>{message}</div>
      </div>
    );
  } else if (format === "table") {
    return (
      <div>
        <div>{message}</div>
      </div>
    );
  } else if (format === "pdf") {
    return (
      <div>
        <div>{message}</div>
      </div>
    );
  }
  return message;
}
