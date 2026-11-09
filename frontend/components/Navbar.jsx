"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LogOut, Microscope, UserRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Toast from "@/components/Toast";

export default function Navbar({ handleNavigate }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notice, setNotice] = useState("");

  const handleLogout = () => {
    const message = "You have been signed out successfully.";
    localStorage.removeItem("research_user");
    localStorage.removeItem("research_access_token");
    localStorage.removeItem("research_reports");
    setUser(null);

    if (pathname === "/") {
      setNotice(message);
      return;
    }

    sessionStorage.setItem("logout_toast", message);
    router.push("/");
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const token = localStorage.getItem("research_access_token");
        const storedUser = JSON.parse(
          localStorage.getItem("research_user") || "null",
        );
        setUser(token ? storedUser || {} : null);
      } catch {
        setUser(localStorage.getItem("research_access_token") ? {} : null);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      <Toast
        message={notice}
        type="success"
        show={!!notice}
        onClose={() => setNotice("")}
      />
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 z-50 w-full border-b border-[#e9eeee] bg-white/85 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link
            href="/"
            aria-label="Nexora home"
            className="flex items-center gap-3"
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white"
            >
              <Microscope size={23} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="text-xl font-bold tracking-tight text-[#142625]">
              Nexora
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden items-center gap-9 text-sm font-medium text-[#142625] md:flex">
            <Link href="#features" className="transition hover:text-primary-400">
              Features
            </Link>

            <Link
              href="#how-it-works"
              className="transition hover:text-primary-400"
            >
              How it works
            </Link>

            <Link href="#about" className="transition hover:text-primary-400">
              About
            </Link>

            <button
              onClick={() => handleNavigate("/feedback")}
              className="transition hover:text-primary-400"
            >
              Contact
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => handleNavigate("/profile")}
                  className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500 hover:shadow-md"
                >
                  <UserRound size={17} aria-hidden="true" />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full border border-[#dce6e5] px-4 py-3 text-sm font-semibold text-[#355f63] transition hover:bg-[#edf5f5]"
                >
                  <LogOut size={17} aria-hidden="true" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigate("/signin")}
                  className="hidden rounded-full px-5 py-2.5 text-sm font-semibold text-[#355f63] transition hover:bg-[#edf5f5] sm:block"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavigate("/signup")}
                  className="rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500 hover:shadow-md"
                >
                  Get Started <span className="ml-2">→</span>
                </button>
              </>
            )}
          </div>
        </div>
      </motion.nav>
    </>
  );
}
