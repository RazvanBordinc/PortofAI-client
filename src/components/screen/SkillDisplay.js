// src/components/screen/SkillsDisplay.js
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Code, Database, Server, Palette, Layers } from "lucide-react";

export default function SkillsDisplay() {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5189";
      const response = await fetch(`${apiUrl}/api/portfolio/skills`);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      setSkills(data);

      // Extract unique categories
      const uniqueCategories = [
        ...new Set(data.map((skill) => skill.category)),
      ];
      setCategories(["All", ...uniqueCategories]);
    } catch (err) {
      console.error("Error fetching skills:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter skills by selected category
  const filteredSkills =
    selectedCategory === "All"
      ? skills
      : skills.filter((skill) => skill.category === selectedCategory);

  // Get icon for skill category
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "programming language":
        return <Code size={16} />;
      case "database":
        return <Database size={16} />;
      case "backend":
        return <Server size={16} />;
      case "frontend":
      case "frontend framework":
        return <Palette size={16} />;
      default:
        return <Layers size={16} />;
    }
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
            <Award className="h-6 w-6 text-indigo-500 mr-2" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              Skills
            </h2>
          </div>

          {/* Category Filter */}
          <div className="mb-6 overflow-x-auto pb-2">
            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-indigo-500 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg text-red-700 dark:text-red-300">
              Error loading skills: {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSkills.map((skill) => (
                <motion.div
                  key={skill.id}
                  className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-md text-indigo-500 dark:text-indigo-400">
                        {getCategoryIcon(skill.category)}
                      </div>
                    </div>

                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-base font-medium text-slate-800 dark:text-white">
                          {skill.name}
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                          {skill.category}
                        </span>
                      </div>

                      {/* Proficiency Rating */}
                      <div className="mt-1.5 flex items-center">
                        <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 mr-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full"
                            style={{
                              width: `${(skill.proficiencyLevel / 5) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {skill.proficiencyLevel}/5
                        </span>
                      </div>

                      {/* Years of Experience */}
                      <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                        {skill.yearsOfExperience}{" "}
                        {skill.yearsOfExperience === 1 ? "year" : "years"} of
                        experience
                      </div>

                      {/* Description (truncated) */}
                      {skill.description && (
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {skill.description}
                        </p>
                      )}
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
