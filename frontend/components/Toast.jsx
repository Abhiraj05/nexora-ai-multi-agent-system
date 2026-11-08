"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Toast({
  message,
  type = "success",
  show,
  onClose,
  duration = 3000,
}) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(() => {
      onCloseRef.current?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [show, duration]);

  const styles = {
    success: {
      icon: "✓",
      color: "text-primary-500",
      border: "border-primary-500/25",
      bg: "bg-slate-900/90",
      iconBg: "bg-primary-600/15",
      progress: "bg-primary-500",
      title: "Success",
    },
    error: {
      icon: "✕",
      color: "text-red-400",
      border: "border-red-500/25",
      bg: "bg-slate-900/90",
      iconBg: "bg-red-500/10",
      progress: "bg-red-400",
      title: "Something went wrong",
    },
    info: {
      icon: "i",
      color: "text-primary-500",
      border: "border-primary-500/25",
      bg: "bg-slate-900/90",
      iconBg: "bg-primary-600/15",
      progress: "bg-primary-500",
      title: "Information",
    },
  };

  const currentStyle = styles[type] || styles.success;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-9999 w-[calc(100%-2rem)] max-w-sm sm:right-6 sm:top-6">
      <AnimatePresence>
        {show && (
          <motion.div
            key={`${type}-${message}`}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            role={type === "error" ? "alert" : "status"}
            aria-live={type === "error" ? "assertive" : "polite"}
            className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${currentStyle.border} ${currentStyle.bg} p-4 shadow-2xl shadow-black/30 backdrop-blur-xl`}
          >
            <div className="flex items-start gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 12,
                  delay: 0.1,
                }}
                aria-hidden="true"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${currentStyle.iconBg} text-lg font-bold ${currentStyle.color}`}
              >
                {currentStyle.icon}
              </motion.div>

              <div className="min-w-0 flex-1 pt-0.5">
                <h3 className={`text-sm font-semibold ${currentStyle.color}`}>
                  {currentStyle.title}
                </h3>
                <p className="mt-1 wrap-break-word text-sm leading-5 text-slate-300">
                  {message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onClose?.()}
                aria-label="Close notification"
                className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                ✕
              </button>
            </div>

            <motion.div
              className={`absolute bottom-0 left-0 h-0.5 ${currentStyle.progress}`}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{
                duration: duration / 1000,
                ease: "linear",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
