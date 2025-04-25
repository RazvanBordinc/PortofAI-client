// src/components/screen/GitHubStats.js
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Github,
  Star,
  GitFork,
  GitCommit,
  Code,
  BookOpen,
  Activity,
  Hash,
  Calendar,
} from "lucide-react";

export default function GitHubStats() {
  const [stats, setStats] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGitHubData();
  }, []);

  const fetchGitHubData = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5189";

      // Fetch GitHub stats
      const username = "yourusername"; // Replace with actual username or fetch from configuration
      const statsResponse = await fetch(
        `${apiUrl}/api/portfolio/github/stats/${username}`
      );

      if (!statsResponse.ok) {
        throw new Error(`Stats API returned ${statsResponse.status}`);
      }

      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch repositories
      const reposResponse = await fetch(
        `${apiUrl}/api/portfolio/github/repos?username=${username}`
      );

      if (!reposResponse.ok) {
        throw new Error(`Repos API returned ${reposResponse.status}`);
      }

      const reposData = await reposResponse.json();
      setRepos(reposData);
    } catch (err) {
      console.error("Error fetching GitHub data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
            <Github className="h-6 w-6 text-indigo-500 mr-2" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              GitHub Activity
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg text-red-700 dark:text-red-300">
              Error loading GitHub data: {error}
            </div>
          ) : (
            <div className="space-y-8">
              {/* GitHub Stats Summary */}
              {stats && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">
                    GitHub Statistics for {stats.username}
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <div className="flex items-center text-indigo-500 dark:text-indigo-400 mb-2">
                        <BookOpen size={18} className="mr-2" />
                        <span className="text-sm font-medium">
                          Repositories
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-slate-800 dark:text-white">
                        {stats.totalRepositories}
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <div className="flex items-center text-amber-500 dark:text-amber-400 mb-2">
                        <Star size={18} className="mr-2" />
                        <span className="text-sm font-medium">Total Stars</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-800 dark:text-white">
                        {stats.totalStars}
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <div className="flex items-center text-emerald-500 dark:text-emerald-400 mb-2">
                        <GitCommit size={18} className="mr-2" />
                        <span className="text-sm font-medium">Commits</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-800 dark:text-white">
                        {stats.totalCommits}
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <div className="flex items-center text-blue-500 dark:text-blue-400 mb-2">
                        <Code size={18} className="mr-2" />
                        <span className="text-sm font-medium">
                          Top Language
                        </span>
                      </div>
                      <div className="text-lg font-bold text-slate-800 dark:text-white">
                        {stats.topLanguage || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-slate-500 dark:text-slate-400 flex items-center">
                    <Calendar size={14} className="mr-1" />
                    <span>
                      {stats.contributionLastYear} contributions in the last
                      year
                    </span>
                  </div>
                </div>
              )}

              {/* Top Repositories */}
              <div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">
                  Top Repositories
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {repos.slice(0, 4).map((repo) => (
                    <motion.a
                      key={repo.id}
                      href={`https://github.com/${repo.repoOwner}/${repo.repoName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
                      whileHover={{ y: -3 }}
                    >
                      <h4 className="text-base font-medium text-indigo-600 dark:text-indigo-400 mb-2 flex items-center">
                        <Github size={16} className="mr-2" />
                        {repo.repoName}
                      </h4>

                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                        {repo.description || "No description provided."}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center">
                          <Star size={14} className="mr-1" />
                          <span>{repo.stars}</span>
                        </div>

                        <div className="flex items-center">
                          <GitFork size={14} className="mr-1" />
                          <span>{repo.forks}</span>
                        </div>

                        <div className="flex items-center">
                          <GitCommit size={14} className="mr-1" />
                          <span>{repo.commitCount}</span>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                        Last updated: {formatDate(repo.lastUpdatedAt)}
                      </div>
                    </motion.a>
                  ))}
                </div>

                {repos.length > 4 && (
                  <div className="mt-4 text-center">
                    <a
                      href={`https://github.com/${stats?.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Github size={16} className="mr-2" />
                      View all repositories
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
