"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const heroStats = [
  { value: "120k+", label: "Active Learners" },
  { value: "450+", label: "Professional Courses" },
  { value: "98%", label: "Completion Satisfaction" },
  { value: "85", label: "Industry Instructors" },
];

export default function HeroSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65 }}
      className="relative overflow-hidden border-2 border-border bg-surface/80 p-8 backdrop-blur-sm md:p-12"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-25"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=80')",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-background/90 via-surface/80 to-surface/90" />

      <div className="relative z-10">
        <div className="mb-6 inline-flex items-center border-2 border-primary-500/50 bg-primary-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-300">
          Professional Learning Platform
        </div>

        <h1 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">
          Build Your Career With
          <span className="mx-2 text-primary-400">Real LMS Journeys</span>
          From Entry Level to Industry Ready.
        </h1>

        <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
          EduPath gives learners a complete ecosystem: structured courses, progress tracking,
          verified mentors, practical projects, and a dashboard built for serious growth.
        </p>

        <p className="font-guides mt-6 text-2xl text-secondary-400 md:text-3xl">
          Learning is not a chapter. It is your professional identity.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="border-2 border-primary-500 bg-primary-500 px-6 py-3 font-bold text-white transition hover:bg-primary-600"
          >
            Start as Student
          </Link>
          <Link
            href="/login"
            className="border-2 border-border bg-surface-raised px-6 py-3 font-bold text-foreground transition hover:border-primary-500/70"
          >
            Instructor Portal
          </Link>
          <Link
            href="/dashboard"
            className="border-2 border-secondary-500/70 bg-secondary-500/10 px-6 py-3 font-bold text-secondary-200 transition hover:bg-secondary-500/20"
          >
            Open Dashboard
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {heroStats.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index + 0.2, duration: 0.5 }}
              className="border-2 border-border bg-surface-raised px-4 py-4"
            >
              <p className="text-3xl font-black text-primary-300">{item.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
