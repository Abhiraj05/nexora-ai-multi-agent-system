"use client";

import { motion } from "framer-motion";
import { Microscope } from "lucide-react";

// Render the loading indicator.
export default function Loader({ text = "Loading...", fullscreen = true }) {
  return (
    <div
      className={`${fullscreen ? "fixed inset-0 z-9999" : "absolute inset-0 z-40"} flex items-center justify-center bg-slate-950`}
      role="status"
      aria-live="polite"
    >

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute h-64 w-64 rounded-full bg-primary-600/20 blur-[80px]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative flex flex-col items-center"
      >

        <div className="relative flex h-20 w-20 items-center justify-center">

          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-full border-[3px] border-[#44858e]/15 border-t-[#44858e]"
          />


          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-3 rounded-full border-[3px] border-[#326e75]/10 border-b-[#326e75]"
          />


          <motion.div
            animate={{
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-600/25"
          >
            <Microscope size={21} strokeWidth={2} aria-hidden="true" />
          </motion.div>
        </div>


        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mt-7 text-sm font-semibold tracking-wide text-[#326e75]"
        >
          {text}
        </motion.p>


        <div className="mt-3 flex items-center gap-1.5">
          {[0, 1, 2].map((item) => (
            <motion.span
              key={item}
              animate={{
                y: [0, -5, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                delay: item * 0.15,
                ease: "easeInOut",
              }}
              className="h-1.5 w-1.5 rounded-full bg-primary-600"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
