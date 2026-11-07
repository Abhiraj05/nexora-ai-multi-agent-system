"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Plus,
  LogIn,
  LogOut,
  LayoutDashboard,
  MessageSquare,
  FileText,
  ChevronRight,
} from "lucide-react";
import { getUser, clearUser } from "@/lib/store";
import { useEffect, useState } from "react";
export default function Sidebar({ reports = [], activeId, onNew, onSelect }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setCurrentUser] = useState(null);
  useEffect(() => setCurrentUser(getUser()), [pathname]);
  return (
    <aside className="w-full md:w-[255px] md:min-w-[255px] md:h-screen md:sticky md:top-0 border-r border-[#edf0f0] bg-[#fafbfc] flex flex-col">
      <Link
        href="/"
        className="h-[74px] flex items-center gap-3 px-4 border-b border-[#edf0f0]"
      >
        <span className="w-10 h-10 rounded-2xl bg-teal text-white grid place-items-center">
          <Search size={20} />
        </span>
        <span className="font-bold text-[17px] tracking-tight">
          Research Agent
        </span>
      </Link>
      <div className="p-4 flex-1 overflow-auto">
        <button
          onClick={() => {
            if (onNew) onNew();
            else router.push("/dashboard?new=1");
          }}
          className="secondary w-full flex items-center justify-center gap-2 text-sm"
        >
          <Plus size={18} /> New Thread
        </button>
        <div className="mt-8 text-[10px] font-bold tracking-[.16em] text-[#9caeac] px-2 mb-3">
          WORKSPACE
        </div>
        <Link
          className={
            "flex items-center gap-3 rounded-xl px-3 py-3 text-sm " +
            (pathname === "/dashboard"
              ? "bg-[#eaf3f3] text-teal font-semibold"
              : "text-muted hover:bg-white")
          }
          href="/dashboard"
        >
          <LayoutDashboard size={17} /> Dashboard
        </Link>
        <div className="mt-7 mb-3 px-2 flex justify-between items-center">
          <span className="text-[10px] font-bold tracking-[.16em] text-[#9caeac]">
            YOUR REPORTS
          </span>
          <span className="text-xs text-muted">{reports.length}</span>
        </div>
        <div className="space-y-1">
          {reports.map((r) => (
            <button
              key={r.id}
              onClick={() =>
                onSelect ? onSelect(r.id) : router.push("/dashboard?id=" + r.id)
              }
              className={
                "w-full flex items-center gap-2 rounded-xl p-3 text-left text-xs " +
                (String(activeId) === String(r.id)
                  ? "bg-[#eaf3f3] text-teal"
                  : "text-muted hover:bg-white")
              }
            >
              <FileText size={15} className="shrink-0" />
              <span className="truncate flex-1">{r.title}</span>
              <ChevronRight size={13} />
            </button>
          ))}
          {!reports.length && (
            <p className="px-2 text-xs text-[#a1b0ae]">No reports yet</p>
          )}
        </div>
      </div>
      <div className="border-t border-[#edf0f0] p-4">
        {user ? (
          <button
            onClick={() => {
              clearUser();
              setCurrentUser(null);
              router.push("/");
            }}
            className="primary w-full flex items-center justify-center gap-2 text-sm"
          >
            <LogOut size={17} /> Sign Out
          </button>
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
