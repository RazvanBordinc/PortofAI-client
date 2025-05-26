"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function BackendLoadingScreen({ onBackendReady, apiUrl }) {
  const [isChecking, setIsChecking] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 12; // 60 seconds / 5 second intervals

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${apiUrl}/api/health`, {
          method: "GET",
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          setIsChecking(false);
          onBackendReady();
        } else {
          throw new Error("Backend not ready");
        }
      } catch (error) {
        // Don't retry on SSL/network errors, just proceed
        if (error.name === 'TypeError' || error.message.includes('ERR_CERT') || error.message.includes('Failed to fetch')) {
          console.warn('Backend health check failed, proceeding anyway:', error.message);
          setIsChecking(false);
          onBackendReady();
          return;
        }
        
        setAttempts(prev => prev + 1);
        if (attempts < maxAttempts) {
          setTimeout(checkBackendHealth, 5000); // Retry every 5 seconds
        } else {
          setIsChecking(false);
          onBackendReady(); // Proceed anyway after max attempts
        }
      }
    };

    checkBackendHealth();
  }, [attempts, apiUrl, onBackendReady, maxAttempts]);

  if (!isChecking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="flex flex-col items-center space-y-6 p-8">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
          <div className="absolute inset-0 h-12 w-12 animate-ping opacity-20">
            <div className="h-full w-full rounded-full bg-blue-600 dark:bg-blue-400"></div>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Waking up the backend...
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
            The server is starting up from sleep mode. This usually takes a few seconds.
          </p>
          {attempts > 3 && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Still waking up... ({attempts * 5}s elapsed)
            </p>
          )}
        </div>

        <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-1000 ease-out"
            style={{ width: `${(attempts / maxAttempts) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}