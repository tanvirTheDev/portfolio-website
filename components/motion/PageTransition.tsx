"use client";

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Wraps page content with a brutalist enter animation.
 * MotionConfig reducedMotion="user" makes framer-motion respect
 * the OS prefers-reduced-motion setting automatically.
 *
 * Exit animations are intentionally omitted — App Router unmounts
 * the outgoing page before AnimatePresence can play the exit.
 * Enter-only transitions are the reliable pattern here.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.28,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ minHeight: "100%" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
