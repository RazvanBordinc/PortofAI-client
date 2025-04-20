"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Info,
  Code,
  Lightbulb,
  Compass,
  SquareStackIcon,
  HelpCircle,
} from "lucide-react";

export default function InfoPage() {
  const [activeSection, setActiveSection] = useState("how-to-use");

  const sections = [
    {
      id: "how-to-use",
      title: "How to Use",
      icon: <HelpCircle size={20} />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-800 dark:text-slate-200">
            This portfolio website is designed to showcase my skills and
            experience in an interactive chat format. Here's how to navigate and
            use the features:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300">
            <li>
              Use the sidebar to navigate between different chat topics and this
              info page
            </li>
            <li>
              Each chat has predefined content, but you can also ask your own
              questions
            </li>
            <li>
              Toggle between light and dark modes using the icon at the bottom
              of the sidebar
            </li>
            <li>On mobile, tap the menu icon to open the sidebar</li>
            <li>You can collapse the sidebar by clicking the arrow icon</li>
          </ul>
          <p className="text-slate-800 dark:text-slate-200">
            The chat interface is intuitive - just type your message in the
            input box at the bottom and hit send. The AI will respond with
            relevant information about me, my skills, projects, and experience.
          </p>
        </div>
      ),
    },
    {
      id: "creation",
      title: "How It Was Created",
      icon: <Code size={20} />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-800 dark:text-slate-200">
            This portfolio website was developed as a modern, interactive
            showcase of my web development skills. The development process
            included:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300">
            <li>Planning the user experience and interaction flow</li>
            <li>Designing the UI with a focus on clean, modern aesthetics</li>
            <li>Implementing responsive design for all device sizes</li>
            <li>
              Creating the chat interface with realistic typing animations
            </li>
            <li>
              Building predefined chat content for various portfolio sections
            </li>
            <li>Implementing theme toggling for light and dark modes</li>
            <li>
              Optimizing performance for smooth animations and transitions
            </li>
          </ul>
          <p className="text-slate-800 dark:text-slate-200">
            The development embraced modern web development practices, including
            component-based architecture, responsive design, and accessibility
            considerations.
          </p>
        </div>
      ),
    },
    {
      id: "stack",
      title: "Tech Stack",
      icon: <SquareStackIcon size={20} />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-800 dark:text-slate-200">
            This portfolio is built with modern web technologies to ensure
            performance, maintainability, and a great user experience:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md border border-indigo-100 dark:border-indigo-900/50">
              <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                Frontend Framework
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                <li>Next.js 15 (App Router)</li>
                <li>React 19</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md border border-indigo-100 dark:border-indigo-900/50">
              <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                Styling
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                <li>Tailwind CSS 4</li>
                <li>Custom CSS animations</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md border border-indigo-100 dark:border-indigo-900/50">
              <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                Animation & UI
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                <li>Framer Motion</li>
                <li>Lucide React icons</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md border border-indigo-100 dark:border-indigo-900/50">
              <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                Deployment
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                <li>Vercel</li>
                <li>GitHub for version control</li>
              </ul>
            </div>
          </div>
          <p className="text-slate-800 dark:text-slate-200 mt-4">
            This stack was chosen for its modern capabilities, developer
            experience, and performance benefits. The application is fully
            responsive and works seamlessly across devices of all sizes.
          </p>
        </div>
      ),
    },
    {
      id: "scope",
      title: "Scope",
      icon: <Compass size={20} />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-800 dark:text-slate-200">
            The scope of this portfolio project includes:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300">
            <li>
              <span className="font-medium text-slate-900 dark:text-white">
                Interactive Chat Interface:
              </span>{" "}
              A conversational UI that allows visitors to learn about me and my
              work through natural dialogue
            </li>
            <li>
              <span className="font-medium text-slate-900 dark:text-white">
                Predefined Chat Topics:
              </span>{" "}
              Specialized chat sections for portfolio, skills, about me, and
              usage guide
            </li>
            <li>
              <span className="font-medium text-slate-900 dark:text-white">
                Responsive Design:
              </span>{" "}
              Full functionality across desktop, tablet, and mobile devices
            </li>
            <li>
              <span className="font-medium text-slate-900 dark:text-white">
                Theme Options:
              </span>{" "}
              Light and dark mode with smooth transitions
            </li>
            <li>
              <span className="font-medium text-slate-900 dark:text-white">
                Information Page:
              </span>{" "}
              Details about the project's creation and technical implementation
            </li>
          </ul>
          <p className="text-slate-800 dark:text-slate-200">
            This project is focused on the frontend experience, with simulated
            chat responses. A future version could integrate with a real AI
            backend to provide more dynamic responses to user queries.
          </p>
        </div>
      ),
    },
    {
      id: "inspiration",
      title: "Inspiration",
      icon: <Lightbulb size={20} />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-800 dark:text-slate-200">
            The inspiration for this project came from several sources:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300">
            <li>
              The growing trend of conversational UI in modern web applications
            </li>
            <li>
              The desire to create a more engaging and interactive portfolio
              experience compared to traditional static websites
            </li>
            <li>
              The challenge of creating a portfolio that showcases both design
              sensibilities and technical implementation
            </li>
            <li>
              Interest in exploring the intersection of AI chat interfaces and
              personal branding
            </li>
          </ul>
          <p className="text-slate-800 dark:text-slate-200">
            The design aesthetic draws inspiration from modern chat applications
            while incorporating a unique visual identity through color schemes,
            animations, and layout choices.
          </p>
          <p className="text-slate-800 dark:text-slate-200">
            This project represents my approach to problem-solving and
            creativity in web development, showcasing both technical skills and
            design thinking.
          </p>
        </div>
      ),
    },
  ];

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
                <Info size={24} />
              </div>
              <h1 className="text-2xl font-bold">PortofAI Information</h1>
            </div>
            <p className="opacity-90 max-w-2xl">
              Learn about this project, how it was built, and the technologies
              used to create this interactive portfolio experience.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-5 py-4 whitespace-nowrap transition-colors ${
                  activeSection === section.id
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 bg-white dark:bg-slate-900"
                    : "text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-white/80 dark:hover:bg-slate-800/80 cursor-pointer"
                }`}
              >
                <span
                  className={
                    activeSection === section.id
                      ? "text-indigo-500 dark:text-indigo-400"
                      : "text-slate-500 dark:text-slate-500"
                  }
                >
                  {section.icon}
                </span>
                <span className="font-medium">{section.title}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-900">
            {sections.map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: activeSection === section.id ? 1 : 0,
                  display: activeSection === section.id ? "block" : "none",
                }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"
              >
                {section.content}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
