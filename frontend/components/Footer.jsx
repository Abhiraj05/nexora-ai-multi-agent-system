"use client";

import Link from "next/link";
import { Microscope } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Render the site footer.
export default function Footer({ handleNavigate }) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsLoggedIn(!!localStorage.getItem("research_access_token"));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  return (
    <footer className="border-t border-[#e7eeed] bg-white px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row">

        <div className="max-w-sm">
          <Link href="/" aria-label="Nexora AI home" className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white"
            >
              <Microscope size={21} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="text-lg font-bold text-[#142625]">Nexora AI</span>
          </Link>

          <p className="mt-5 text-sm leading-7 text-[#829492]">
            AI researcher, analyst, and writer agents turn your topic into a
            structured report with findings, challenges, and references.
          </p>
        </div>


        <div className="flex flex-wrap gap-16">
          <div>
            <h4 className="text-sm font-bold text-[#142625]">Platform</h4>

            <div className="mt-5 flex flex-col gap-4 text-sm text-[#142625]">
              <button
                onClick={() => handleNavigate("/dashboard")}
                className="hover:text-[#44858e]"
              >
                Dashboard
              </button>

              <Link href="/#features" className="hover:text-[#44858e] ml-2.5">
                Features
              </Link>

              <Link href="/#how-it-works" className="hover:text-[#44858e] ml-2.5">
                How it works
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#142625]">Account</h4>

            <div className="mt-5 flex flex-col gap-4 text-sm text-[#829492]">
              {isLoggedIn ? (
                <button
                    onClick={() => handleNavigate("/profile")} className="hover:text-[#44858e]">
                  Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleNavigate("/signin")}
                    className="hover:text-[#44858e]"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNavigate("/signup")}
                    className="hover:text-[#44858e]"
                  >
                    Sign Up
                  </button>
                </>
              )}

              <button
                onClick={() => handleNavigate("/feedback")}
                className="hover:text-[#44858e]"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>


      <div className="mx-auto mt-12 max-w-7xl border-t border-[#edf0ef] pt-7 text-center text-xs text-[#9aabaa] sm:text-left">
        © 2026 Nexora AI. All rights reserved.
      </div>
    </footer>
  );
}
