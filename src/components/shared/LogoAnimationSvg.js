"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import LogoSvg from "./LogoSvg";

export default function LogoAnimationSvg() {
  const [mounted, setMounted] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const timeoutRef = useRef(null);

  // Only start animation after component is mounted on client
  useEffect(() => {
    setMounted(true);

    // Clean up any timeouts on unmount
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Progress through animation steps safely
  useEffect(() => {
    if (!mounted) return;

    if (animationStep < 8) {
      timeoutRef.current = setTimeout(() => {
        setAnimationStep((prev) => prev + 1);
      }, 300);
    }
  }, [animationStep, mounted]);

  // Path definitions with fill colors matching the original SVG
  const paths = [
    {
      d: "M35.222 5.56c-1.133-3.08.127-3.625 2.534-3.442 2.446.275 3.653-.395 4.102.25.52.547.81 4.562-1.099 6.825-1.9 2.284-4.525-.572-5.537-3.634",
      fill: "#f7941d",
      stroke: "rgba(249, 115, 22, 0.7)",
    },
    {
      d: "M38.136 3.49c.636-4.104 2.365-3.934 4.918-2.254 2.54 1.806 4.286 1.804 4.387 2.795.24.923-1.902 5.547-5.404 6.88-3.505 1.364-4.66-3.409-3.9-7.42",
      fill: "#f7941d",
      stroke: "rgba(249, 115, 22, 0.7)",
    },
    {
      d: "M42.632 2.99c3.223-4.156 5.033-2.906 6.828.521 1.703 3.557 3.638 4.628 3.142 5.786-.301 1.17-5.51 4.974-10.205 4.301-4.718-.641-3.066-6.633.235-10.609",
      fill: "#f7941d",
      stroke: "rgba(249, 115, 22, 0.7)",
    },
    {
      d: "M47.917 5.193c6.119-2.622 7.355-.127 7.24 4.768-.298 4.983 1.187 7.356-.073 8.333-1.051 1.11-9.153 2.126-13.938-1.5-4.83-3.605.677-9.226 6.771-11.601",
      fill: "#f7941d",
      stroke: "rgba(249, 115, 22, 0.7)",
    },
    {
      d: "M52.416 10.876c8.383.852 8.22 4.372 5.089 9.72-3.388 5.336-3.2 8.875-5.195 9.183-1.845.584-11.438-3.264-14.51-10.215-3.134-6.955 6.411-9.798 14.616-8.688",
      fill: "#f7941d",
      stroke: "rgba(249, 115, 22, 0.7)",
    },
    {
      d: "M53.91 19.929c8.757 6.087 6.417 9.885-.333 13.885-7.024 3.828-8.987 7.86-11.385 6.977-2.402-.485-10.66-10.632-9.796-20.213.798-9.623 13.111-6.913 21.513-.65",
      fill: "#f7941d",
      stroke: "rgba(249, 115, 22, 0.7)",
    },
    {
      d: "M50.007 30.868c5.96 12.114 1.039 14.883-8.888 15.168-10.126-.073-14.775 3.188-16.888.738-2.36-2.012-5.277-18.313 1.56-28.39 6.79-10.164 18.758.392 24.216 12.484",
      fill: "#f7941d",
      stroke: "rgba(249, 115, 22, 0.7)",
    },
    {
      d: "M38.974 40.583c-.836 17.07-7.984 17.115-19.15 11.339C8.66 45.627 1.512 46.384.677 42.376-.704 38.7 6.072 18.862 19.825 11.9 33.579 4.815 40.35 23.847 38.974 40.583",
      fill: "#f7941d",
      stroke: "rgba(249, 115, 22, 0.7)",
    },
  ];

  // Use static values for particle positions to prevent hydration errors
  const particlePositions = [
    { x: 20, y: 15 },
    { x: -15, y: -20 },
    { x: -25, y: 10 },
    { x: 10, y: -15 },
  ];

  if (!mounted) {
    // Return a simple placeholder until client-side rendering takes over
    return (
      <div className="relative w-40 h-40 flex items-center justify-center">
        <div className="w-28 h-28">
          <LogoSvg className="w-full h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      {/* Static background glow */}
      <div className="absolute w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-500/20 dark:from-amber-500/20 dark:to-orange-600/20 rounded-full blur-xl"></div>

      {/* Animated background glow */}
      {mounted && (
        <motion.div
          className="absolute w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-500/20 dark:from-amber-500/20 dark:to-orange-600/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "reverse",
          }}
        />
      )}

      {/* SVG container for paths */}
      <div className="absolute w-full h-full">
        <svg viewBox="0 0 60 56" className="w-full h-full">
          {/* Static base paths (always visible but faded) */}
          {paths.map((path, index) => (
            <path
              key={`static-${index}`}
              d={path.d}
              fill={path.fill}
              fillOpacity={0.2}
              opacity={0.2}
            />
          ))}

          {/* Animated paths */}
          {mounted &&
            paths.map(
              (path, index) =>
                animationStep >= index && (
                  <React.Fragment key={`animated-${index}`}>
                    {/* Fill */}
                    <motion.path
                      d={path.d}
                      fill={path.fill}
                      initial={{ fillOpacity: 0 }}
                      animate={{ fillOpacity: 0.8 }}
                      transition={{
                        duration: 0.8,
                        ease: "easeIn",
                        delay: 0.4, // Delay fill until stroke is partly done
                      }}
                    />

                    {/* Stroke path */}
                    <motion.path
                      d={path.d}
                      stroke={path.stroke}
                      strokeWidth={1.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0.7 }}
                      animate={{
                        pathLength: 1,
                        opacity: 1,
                      }}
                      transition={{
                        duration: 0.8,
                        ease: [0.33, 1, 0.68, 1], // Custom cubic bezier for smoother tracing
                      }}
                    />
                  </React.Fragment>
                )
            )}
        </svg>
      </div>

      {/* Particles - using static positions to avoid hydration issues */}
      {mounted &&
        particlePositions.map((pos, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500"
            initial={{ x: pos.x, y: pos.y, opacity: 0 }}
            animate={{
              x: pos.x + (i % 2 === 0 ? 5 : -5),
              y: pos.y + (i % 2 === 0 ? -5 : 5),
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 0.5,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
    </div>
  );
}
