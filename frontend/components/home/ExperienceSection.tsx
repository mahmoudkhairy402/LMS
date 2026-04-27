"use client";

import { motion } from "framer-motion";
import SectionTitle from "@/components/home/SectionTitle";

const experienceItems = [
  {
    title: "Student Experience",
    content:
      "Enrollment, structured lessons, quizzes, progress bars, and completion milestones.",
  },
  {
    title: "Instructor Workspace",
    content:
      "Create courses, manage sections, publish content, and monitor learner outcomes.",
  },
  {
    title: "Admin Control",
    content:
      "Role management, analytics, moderation flows, and scalable quality standards.",
  },
];

export default function ExperienceSection() {
  return (
    <motion.section
      id="experience"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55 }}
      className="mt-16 scroll-mt-28 border-2 border-border bg-surface-raised p-8 md:p-10"
    >
      <SectionTitle
        title="A Real LMS Experience"
        subtitle="Everything your platform users expect from a modern learning ecosystem."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {experienceItems.map((item) => (
          <article key={item.title} className="border-2 border-border bg-background p-5">
            <h3 className="text-lg font-bold text-primary-200">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.content}</p>
          </article>
        ))}
      </div>
    </motion.section>
  );
}
