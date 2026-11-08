import Link from "next/link";
import { Microscope } from "lucide-react";

export default function Footer({ handleNavigate }) {
  return (
    <footer className="border-t border-[#e7eeed] bg-white px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row">
        {/* Brand */}
        <div className="max-w-sm">
          <Link href="/" aria-label="Nexora home" className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white"
            >
              <Microscope size={21} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="text-lg font-bold text-[#142625]">Nexora</span>
          </Link>

          <p className="mt-5 text-sm leading-7 text-[#829492]">
            An intelligent research assistant that helps you explore, analyze,
            and discover knowledge with AI.
          </p>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap gap-16">
          <div>
            <h4 className="text-sm font-bold text-[#142625]">Platform</h4>

            <div className="mt-5 flex flex-col gap-4 text-sm text-[#829492]">
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

      {/* Copyright */}
      <div className="mx-auto mt-12 max-w-7xl border-t border-[#edf0ef] pt-7 text-center text-xs text-[#9aabaa] sm:text-left">
        © 2026 Nexora. All rights reserved.
      </div>
    </footer>
  );
}
