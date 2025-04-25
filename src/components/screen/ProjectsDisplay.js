// src/components/screen/ProjectsDisplay.js
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Code, Github, ExternalLink, Calendar, Tag } from "lucide-react";

export default function ProjectsDisplay() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5189";
      const response = await fetch(
        `${apiUrl}/api/portfolio/projects?highlighted=true`
      );

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Present";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 flex items-center">
            <Code className="h-6 w-6 text-indigo-500 mr-2" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              Projects
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg text-red-700 dark:text-red-300">
              Error loading projects: {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                      {project.name}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      {project.description}
                    </p>

                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-3 flex items-center">
                      <Calendar size={16} className="mr-1" />
                      <span>
                        {formatDate(project.startDate)} -{" "}
                        {formatDate(project.endDate)}
                      </span>
                    </div>

                    {project.highlights && (
                      <div className="mb-4">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Highlights:
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                          {project.highlights}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-4">
                      <div className="flex space-x-2">
                        {project.isOpenSource && (
                          <a
                            href={project.gitHubRepoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                          >
                            <Github size={14} className="mr-1" />
                            GitHub
                          </a>
                        )}

                        {project.projectUrl && (
                          <a
                            href={project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                          >
                            <ExternalLink size={14} className="mr-1" />
                            Visit
                          </a>
                        )}
                      </div>

                      <div className="text-sm text-indigo-600 dark:text-indigo-400">
                        {project.role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
