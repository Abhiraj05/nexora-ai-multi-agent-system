"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

// Render the shared authentication layout.
export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
}) {
  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 25,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 15,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-14">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[440px]"
        >
          <motion.div
            variants={itemVariants}
            className="text-center mb-8"
          >
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="inline-flex gap-2 items-center rounded-full bg-[#eaf2f2] text-teal text-[11px] font-bold tracking-[.12em] px-3 py-1"
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                <Sparkles size={13} />
              </motion.span>

              {eyebrow}
            </motion.span>

            <motion.h1
              variants={itemVariants}
              className="font-bold text-4xl tracking-tight mt-5"
            >
              {title}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-muted text-sm mt-3 leading-6"
            >
              {description}
            </motion.p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{
              y: -2,
              transition: { duration: 0.3 },
            }}
            className="soft-card p-7 md:p-9"
          >
            {children}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}