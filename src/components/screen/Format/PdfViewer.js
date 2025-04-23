import React, { useState } from "react";
import {
  FileText,
  Download,
  Maximize,
  Minimize,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

export default function PdfViewer({ data }) {
  // Default data if none is provided
  const defaultData = {
    title: "Project Documentation.pdf",
    totalPages: 5,
    lastUpdated: "April 20, 2025",
    content: [
      {
        pageNumber: 1,
        heading: "Project Overview",
        summary: "Introduction to the project scope and objectives",
      },
      {
        pageNumber: 2,
        heading: "Technical Architecture",
        summary: "System design and component relationships",
      },
      {
        pageNumber: 3,
        heading: "Implementation Details",
        summary: "Code structure and key algorithms",
      },
      {
        pageNumber: 4,
        heading: "User Guide",
        summary: "Instructions for using the application",
      },
      {
        pageNumber: 5,
        heading: "Future Enhancements",
        summary: "Planned features and improvements",
      },
    ],
  };

  // Use provided data or fallback to defaults
  const pdfData = data || defaultData;

  // State for PDF viewer
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("thumbnails"); // "thumbnails" or "outline"
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Handle page navigation
  const goToNextPage = () => {
    if (currentPage < pdfData.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Simulate download
  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      // In a real app, you would trigger an actual download here
    }, 1500);
  };

  // Get current page content
  const currentPageContent =
    pdfData.content.find((page) => page.pageNumber === currentPage) ||
    pdfData.content[0];

  return (
    <div
      className={`mt-3 bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700 transition-all ${
        isFullscreen ? "fixed inset-4 z-50" : "relative"
      }`}
    >
      {/* Header */}
      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h3 className="font-medium text-indigo-600 dark:text-indigo-400 flex items-center">
          <FileText className="mr-2 h-4 w-4" />
          {pdfData.title}
        </h3>

        <div className="flex space-x-2">
          <button
            onClick={handleDownload}
            className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
            title="Download PDF"
            disabled={isDownloading}
          >
            {isDownloading ? (
              <div className="h-4 w-4 border-2 border-slate-600 dark:border-slate-400 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
            ) : (
              <Download className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={toggleFullscreen}
            className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </button>
          {isFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar - Thumbnails or Outline */}
        {isFullscreen && (
          <div className="w-full md:w-64 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <div className="border-b border-slate-200 dark:border-slate-700 flex">
              <button
                onClick={() => setViewMode("thumbnails")}
                className={`flex-1 py-2 text-sm font-medium ${
                  viewMode === "thumbnails"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500"
                    : "text-slate-600 dark:text-slate-400"
                } cursor-pointer`}
              >
                Thumbnails
              </button>
              <button
                onClick={() => setViewMode("outline")}
                className={`flex-1 py-2 text-sm font-medium ${
                  viewMode === "outline"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500"
                    : "text-slate-600 dark:text-slate-400"
                } cursor-pointer`}
              >
                Outline
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-240px)]">
              {viewMode === "thumbnails" ? (
                <div className="p-3 space-y-3">
                  {pdfData.content.map((page) => (
                    <div
                      key={page.pageNumber}
                      onClick={() => setCurrentPage(page.pageNumber)}
                      className={`p-2 rounded-lg cursor-pointer ${
                        currentPage === page.pageNumber
                          ? "bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="aspect-[8.5/11] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md flex items-center justify-center mb-1">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Page {page.pageNumber}
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 dark:text-slate-300 truncate">
                        {page.heading}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3">
                  <ul className="space-y-1">
                    {pdfData.content.map((page) => (
                      <li key={page.pageNumber}>
                        <button
                          onClick={() => setCurrentPage(page.pageNumber)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                            currentPage === page.pageNumber
                              ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                          } cursor-pointer`}
                        >
                          <span className="mr-2 text-xs">
                            {page.pageNumber}.
                          </span>
                          {page.heading}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PDF Preview Area */}
        <div
          className={`${isFullscreen ? "flex-1 " : ""}aspect-[8.5/11] max-h-${
            isFullscreen ? "none" : "96"
          } relative overflow-hidden bg-slate-100 dark:bg-slate-900`}
        >
          {/* PDF Content - In a real app this would render the actual PDF page */}
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              </div>

              <h3 className="text-xl text-slate-800 dark:text-white font-medium mb-2 text-center">
                {currentPageContent.heading}
              </h3>

              <p className="text-slate-600 dark:text-slate-300 text-center max-w-md mb-4">
                {currentPageContent.summary}
              </p>

              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Page {currentPage} of {pdfData.totalPages}
              </p>

              {!isFullscreen && (
                <button
                  onClick={toggleFullscreen}
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white transition-colors duration-200 rounded-md flex items-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Full Document</span>
                </button>
              )}
            </div>
          </div>

          {/* Page navigation overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between bg-gradient-to-t from-slate-900/50 to-transparent">
            <button
              onClick={goToPrevPage}
              className={`p-1 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="px-3 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-sm">
              Page {currentPage} of {pdfData.totalPages}
            </div>

            <button
              onClick={goToNextPage}
              className={`p-1 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                currentPage === pdfData.totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              disabled={currentPage === pdfData.totalPages}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
        <span className="text-slate-500 dark:text-slate-400">
          Last updated: {pdfData.lastUpdated}
        </span>

        {!isFullscreen && (
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setViewMode("thumbnails");
                setIsFullscreen(true);
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Thumbnails
            </button>
            <button
              onClick={() => {
                setViewMode("outline");
                setIsFullscreen(true);
              }}
              className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Outline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
