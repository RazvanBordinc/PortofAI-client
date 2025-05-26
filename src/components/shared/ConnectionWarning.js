"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

export default function ConnectionWarning({ isVisible, onDismiss }) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 shadow-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Connection Issue Detected
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                The backend server may be starting up or experiencing SSL certificate issues. 
                This is common with free hosting tiers. The app will work with cached data.
              </p>
              <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                If you're the developer: Check that the backend is deployed and the API URL is correct.
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="ml-3 flex-shrink-0 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}