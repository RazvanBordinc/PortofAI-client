"use client";

import React from "react";
import PredefinedChat from "@/components/screen/PredefinedChat";

export default function AboutChat() {
  // Predefined chat messages for About Me
  const initialMessages = [
    {
      id: 1,
      content:
        "Hi there! I'm the developer behind this portfolio. Ask me anything about myself!",
      sender: "ai",
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      content: "Tell me a bit about yourself.",
      sender: "user",
      timestamp: new Date().toISOString(),
    },
    {
      id: 3,
      content:
        "I'm a passionate full-stack developer with a love for creating elegant, user-friendly applications. I specialize in React and Next.js development, but I'm constantly exploring new technologies and approaches.\n\nWhen I'm not coding, I enjoy hiking, reading science fiction, and experimenting with new recipes. I believe in continuous learning and improving my craft through both personal projects and professional work.\n\nI'm particularly interested in creating applications that make a positive impact on users' lives, whether that's through improved workflows, beautiful interfaces, or solving real-world problems.",
      sender: "ai",
      timestamp: new Date().toISOString(),
    },
    {
      id: 4,
      content: "What are you looking for in your next role?",
      sender: "user",
      timestamp: new Date().toISOString(),
    },
    {
      id: 5,
      content:
        "In my next role, I'm looking for:\n\n1. **Collaborative Environment** - I thrive in teams where knowledge sharing and collaboration are valued\n\n2. **Growth Opportunities** - Working with modern technologies and having opportunities to learn and expand my skills\n\n3. **Impactful Projects** - Creating products that solve real problems and deliver value to users\n\n4. **Work-Life Balance** - A culture that respects personal time while allowing me to do my best work\n\n5. **Remote or Hybrid Options** - Flexibility in work arrangements to maximize productivity\n\nI'm passionate about web development and looking for a role where I can continue to grow while contributing meaningfully to projects and team success.",
      sender: "ai",
      timestamp: new Date().toISOString(),
    },
  ];

  return (
    <PredefinedChat initialMessages={initialMessages} chatTitle="ABOUT ME" />
  );
}
