"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Grid Background for consistency */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-size-[36px_36px]" />

      <div className="relative flex flex-col items-center justify-center z-10">
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Sharp glowing borders animating */}
          <motion.div
            className="absolute inset-0 border-2 border-primary-500 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-3 border border-secondary-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Pulsing Book Icon */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <BookOpen className="w-8 h-8 text-primary-400" />
          </motion.div>
        </div>

        <motion.div 
          className="mt-10 flex flex-col items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-bold tracking-widest text-foreground uppercase font-sans">
            Loading Knowledge
          </h2>
          <div className="flex gap-2 mt-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-secondary-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" // Sharp edges (no border-radius)
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}