"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Settings,
  AlertCircle,
  Moon,
  Sun,
  Bell,
  Globe,
  Shield,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 pt-16 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div className="p-6 md:p-8 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/15 p-2 rounded-full">
                <Settings size={24} />
              </div>
              <h1 className="text-2xl font-bold">Settings</h1>
            </div>
            <p className="opacity-90 max-w-2xl">
              Customize your PortofAI experience and manage your preferences
            </p>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-900">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="grid gap-8">
                {/* Coming Soon Section */}
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6 shadow-md">
                    <AlertCircle
                      size={32}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                    Settings Coming Soon
                  </h2>
                  <p className="text-slate-700 dark:text-slate-300 max-w-lg mb-6">
                    We&apos;re working on additional customization options for
                    your PortofAI experience. Check back soon for updates!
                  </p>

                  {/* Preview of future settings */}
                  <div className="w-full max-w-md border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-5 bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 text-left">
                      Upcoming Settings
                    </h3>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-white/80 dark:bg-slate-700/40 cursor-not-allowed opacity-75">
                        <div className="flex items-center gap-3">
                          <Sun
                            size={18}
                            className="text-amber-500 dark:text-amber-400"
                          />
                          <span className="text-slate-800 dark:text-slate-200">
                            Theme Preferences
                          </span>
                        </div>
                        <div className="w-10 h-5 bg-slate-200 dark:bg-slate-600 rounded-full relative">
                          <div className="absolute w-4 h-4 bg-white rounded-full top-0.5 left-0.5"></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 rounded-lg bg-white/80 dark:bg-slate-700/40 cursor-not-allowed opacity-75">
                        <div className="flex items-center gap-3">
                          <Bell
                            size={18}
                            className="text-indigo-500 dark:text-indigo-400"
                          />
                          <span className="text-slate-800 dark:text-slate-200">
                            Notification Settings
                          </span>
                        </div>
                        <div className="w-10 h-5 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
                      </div>

                      <div className="flex justify-between items-center p-3 rounded-lg bg-white/80 dark:bg-slate-700/40 cursor-not-allowed opacity-75">
                        <div className="flex items-center gap-3">
                          <Globe
                            size={18}
                            className="text-emerald-500 dark:text-emerald-400"
                          />
                          <span className="text-slate-800 dark:text-slate-200">
                            Language Preferences
                          </span>
                        </div>
                        <span className="text-slate-500 dark:text-slate-400 text-sm">
                          English
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 rounded-lg bg-white/80 dark:bg-slate-700/40 cursor-not-allowed opacity-75">
                        <div className="flex items-center gap-3">
                          <Shield
                            size={18}
                            className="text-red-500 dark:text-red-400"
                          />
                          <span className="text-slate-800 dark:text-slate-200">
                            Privacy Options
                          </span>
                        </div>
                        <span className="text-slate-500 dark:text-slate-400 text-sm">
                          Manage
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
