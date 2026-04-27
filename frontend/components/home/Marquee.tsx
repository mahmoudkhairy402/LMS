"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

type MarqueeProps = {
  children: ReactNode;
  reverse?: boolean;
  speed?: number;
};

export default function Marquee({
  children,
  reverse = false,
  speed = 24,
}: MarqueeProps) {
  return (
    <div className="relative overflow-hidden border-y-2 border-border/80 bg-surface">
      <motion.div
        className="flex w-max gap-4 px-4 py-4"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: speed }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
