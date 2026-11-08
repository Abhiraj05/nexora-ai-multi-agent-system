"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Microscope,
  LogIn,
  LogOut,
  LayoutDashboard,
  CircleUserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setCurrentUser] = useState(null);

  const startWorkspaceNavigation = (destination) => {
    if (pathname !== destination) {
      sessionStorage.setItem("workspace_navigation", destination);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        setCurrentUser(
          JSON.parse(localStorage.getItem("research_user") || "null"),
        );
      } catch {
        setCurrentUser(null);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  return (
    <aside className="w-full md:w-63.75 md:min-w-63.75 md:h-screen md:sticky md:top-0 border-r border-[#edf0f0] bg-[#fafbfc] flex flex-col">
      <Link
        href="/"
        aria-label="Nexora home"
        className="h-18.5 flex items-center gap-3 px-4 border-b border-[#edf0f0]"
      >
        <span className="w-10 h-10 shrink-0 rounded-2xl bg-primary-600 text-white grid place-items-center">
          <Microscope size={22} strokeWidth={2.25} aria-hidden="true" />
        </span>
        <span className="font-bold text-[17px] tracking-tight text-[#142625]">
          Nexora
        </span>
      </Link>
      <div className="p-4 flex-1 overflow-auto">
        <div className="mt-8 text-[10px] font-bold tracking-[.16em] text-[#9caeac] px-2 mb-3">
          WORKSPACE
        </div>
        <Link
          className={
            "flex items-center gap-3 rounded-xl px-3 py-3 text-sm " +
            (pathname === "/dashboard"
              ? "bg-[#eaf3f3] text-teal font-semibold"
              : "text-muted hover:bg-slate-800/70 hover:text-primary-500")
          }
          href="/dashboard"
          onClick={() => startWorkspaceNavigation("/dashboard")}
        >
          <LayoutDashboard size={17} /> Dashboard
        </Link>
      </div>
      <div className="border-t border-[#edf0f0] p-4">
        {user ? (
          <>
            <Link
              href="/profile"
              onClick={() => startWorkspaceNavigation("/profile")}
              className="mb-3 flex min-w-0 items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5 hover:text-primary-500"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-600/15 text-primary-500">
                <CircleUserRound size={19} aria-hidden="true" />
              </span>
              <span className="truncate">{user.name}</span>
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("research_user");
                localStorage.removeItem("research_access_token");
                localStorage.removeItem("research_reports");
                sessionStorage.setItem(
                  "logout_toast",
                  "You have been signed out successfully.",
                );
                setCurrentUser(null);
                router.push("/");
              }}
              className="primary w-full flex items-center justify-center gap-2 text-sm"
            >
              <LogOut size={17} /> Sign Out
            </button>
          </>
        ) : (
          <Link
            href="/signin"
            className="primary w-full flex items-center justify-center gap-2 text-sm"
          >
            <LogIn size={17} /> Sign In
          </Link>
        )}
      </div>
    </aside>
  );
}
