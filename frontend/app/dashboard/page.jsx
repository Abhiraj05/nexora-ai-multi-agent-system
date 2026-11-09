"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

import Sidebar from "@/components/Sidebar";
import ResearchHome from "@/components/ResearchHome";
import ReportView from "@/components/ReportView";
import Loader from "@/components/Loader";

import { FileText, Plus, ArrowRight, Trash2 } from "lucide-react";
import Toast from "@/components/Toast";

// Load reports saved in local storage.
const getReports = () => {
  try {
    return JSON.parse(localStorage.getItem("research_reports") || "[]");
  } catch {
    return [];
  }
};

// Save reports in local storage.
const saveReports = (reports) =>
  localStorage.setItem("research_reports", JSON.stringify(reports));

// Check that a report contains the required fields.
const validateReport = (report) =>
  !!report &&
  typeof report.title === "string" &&
  ["introduction", "background", "conclusion"].every(
    (key) => typeof report[key] === "string",
  ) &&
  ["key_findings", "benefits", "challenges", "references"].every((key) =>
    Array.isArray(report[key]),
  );

// Render the dashboard content.
function DashboardContent() {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const [reports, setReports] = useState([]);
  const [active, setActive] = useState(null);
  const [mode, setMode] = useState("home");
  const [loading, setLoading] = useState(false);
  const [loaderLoading, setLoaderLoading] = useState(false);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(null);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [deletingReport, setDeletingReport] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");
  // Build authorization headers for API requests.
  const authorizationHeaders = () => {
    const token = localStorage.getItem("research_access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 25,
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

  // Navigate to the selected page.
  const handleNavigate = (route) => {
    setLoaderLoading(true);
    setTimeout(() => {
      setLoaderLoading(false);
      router.push(route);
    }, 2000);
  };

  useEffect(() => {
    let stopTimer;
    const startTimer = window.setTimeout(() => {
      if (sessionStorage.getItem("workspace_navigation") === pathname) {
        sessionStorage.removeItem("workspace_navigation");
        setNavigationLoading(true);
        stopTimer = window.setTimeout(() => setNavigationLoading(false), 1000);
      }
    }, 0);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(stopTimer);
    };
  }, [pathname]);

  useEffect(() => {
    let activeRequest = true;

    // Load reports for the signed-in user.
    const fetchReports = async () => {
      const token = localStorage.getItem("research_access_token");
      if (!token) {
        setAuthenticated(false);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/reports`,
          { headers: authorizationHeaders() },
        );

        const list = response.data.reports || response.data;

        if (!activeRequest) return;
        setAuthenticated(true);
        setReports(list);
        saveReports(list);

        const id = params.get("id");

        if (id && list.some((r) => String(r.id) === id)) {
          setActive(id);
          setMode("report");
        } else if (params.get("new") === "1") {
          setMode("home");

          const topic = params.get("topic");

          if (topic) {
            window.sessionStorage.setItem("pending_research_topic", topic);
          }
        } else if (list.length) {
          setMode("list");
        }
      } catch (err) {
        if (!activeRequest) return;
        if (err.response?.status === 401) {
          localStorage.removeItem("research_access_token");
          localStorage.removeItem("research_user");
          setAuthenticated(false);
          return;
        }
        console.error("Error fetching reports:", err);

        const list = getReports();

        setReports(list);

        const id = params.get("id");

        if (id && list.some((r) => String(r.id) === id)) {
          setActive(id);
          setMode("report");
        } else if (params.get("new") === "1") {
          setMode("home");

          const topic = params.get("topic");

          if (topic) {
            window.sessionStorage.setItem("pending_research_topic", topic);
          }
        } else if (list.length) {
          setMode("list");
        }
      }
    };

    fetchReports();
    return () => {
      activeRequest = false;
    };
  }, [params]);

  // Start a new report.
  const goNew = () => {
    setMode("home");
    setActive(null);

    router.replace("/dashboard?new=1");
  };

  // Select a report to view.
  const select = (id) => {
    setActive(String(id));
    setMode("report");

    router.replace("/dashboard?id=" + id);
  };

  // Generate and save a research report.
  async function research(payload) {
    setLoading(true);

    try {
      const report = payload.report || payload;

      if (!validateReport(report)) {
        throw new Error("API returned an invalid report structure.");
      }

      const entry = {
        ...report,
        id: report.id || crypto.randomUUID(),
        createdAt: report.createdAt || new Date().toISOString(),
      };

      const savedResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/reports`,
        report,
        {
          headers: {
            "Content-Type": "application/json",
            ...authorizationHeaders(),
          },
        },
      );
      const savedReport = {
        ...entry,
        ...savedResponse.data,
      };
      const updated = [savedReport, ...reports];

      saveReports(updated);
      setReports(updated);

      select(savedReport.id);
    } finally {
      setLoading(false);
    }
  }

  // Delete the selected report.
  const deleteReport = async () => {
    if (!reportToDelete || deletingReport) return;

    setDeletingReport(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/${reportToDelete.id}`,
        { headers: authorizationHeaders() },
      );
      const updatedReports = reports.filter(
        (report) => String(report.id) !== String(reportToDelete.id),
      );
      setReports(updatedReports);
      saveReports(updatedReports);
      if (String(active) === String(reportToDelete.id)) {
        setActive(null);
        setMode(updatedReports.length ? "list" : "home");
        router.replace("/dashboard");
      }
      setNotice(`"${reportToDelete.title}" was deleted successfully.`);
      setNoticeType("success");
      setReportToDelete(null);
    } catch (error) {
      setNotice(
        error.response?.data?.message ||
          "Unable to delete this report. Please try again.",
      );
      setNoticeType("error");
    } finally {
      setDeletingReport(false);
    }
  };

  return (
    <>
      {loaderLoading && <Loader />}

      {!loaderLoading && (
        <div className="min-h-screen md:flex">
          {authenticated && <Sidebar />}

          <main className="relative min-h-screen flex-1 min-w-0">
            {navigationLoading && (
              <Loader fullscreen={false} text="Loading dashboard..." />
            )}

            {authenticated === null ? (
              <Loader fullscreen={false} text="Checking your session..." />
            ) : authenticated === false ? (
              <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
                <h1 className="text-3xl font-bold">Sign in to continue</h1>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Sign in to access your dashboard and saved research reports.
                </p>
                <button
                  onClick={()=>handleNavigate("/signin")}className="primary mt-6">
                  Go to Sign In
                </button>
                <button
                  onClick={()=>handleNavigate("/signup")}
                  className="mt-4 text-sm font-semibold text-primary-500 hover:underline"
                >
                  Create an account
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {mode === "home" && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ResearchHome onResearch={research} loading={loading} />
                  </motion.div>
                )}

                {mode === "report" && (
                  <motion.div
                    key="report"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ReportView
                      report={reports.find(
                        (r) => String(r.id) === String(active),
                      )}
                      onBack={() => {
                        setMode("list");
                        router.replace("/dashboard");
                      }}
                    />
                  </motion.div>
                )}

                {mode === "list" && (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-237.5 mx-auto px-6 py-14"
                  >
                    <div className="flex flex-wrap justify-between gap-4 items-center mb-9">
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <motion.span
                          variants={itemVariants}
                          className="text-xs tracking-[.15em] font-bold text-teal"
                        >
                          YOUR WORKSPACE
                        </motion.span>

                        <motion.h1
                          variants={itemVariants}
                          className="text-4xl font-bold mt-2"
                        >
                          Research Reports
                        </motion.h1>

                        <motion.p
                          variants={itemVariants}
                          className="text-muted mt-3"
                        >
                          Explore and revisit your research.
                        </motion.p>
                      </motion.div>

                      <motion.button
                        whileHover={{
                          scale: 1.04,
                          y: -2,
                        }}
                        whileTap={{
                          scale: 0.96,
                        }}
                        className="primary flex items-center gap-2"
                        onClick={goNew}
                      >
                        <Plus size={18} />
                        Create New Report
                      </motion.button>
                    </div>

                    {reports.length ? (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid sm:grid-cols-2 gap-4"
                      >
                        {reports.map((r, index) => (
                          <motion.article
                            variants={itemVariants}
                            whileHover={{
                              y: -6,
                            }}
                            key={r.id}
                            className="soft-card group relative p-6 hover:border-[#b5d3d4] hover:shadow-sm transition-all duration-300"
                          >
                            <button
                              type="button"
                              onClick={() => select(r.id)}
                              aria-label={`Open report: ${r.title}`}
                              className="w-full text-left"
                            >
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.08 }}
                              >
                                <FileText
                                  size={22}
                                  className="text-teal mb-4"
                                />
                              </motion.div>
                              <h2 className="font-bold text-lg line-clamp-2">
                                {r.title}
                              </h2>
                              <p className="text-sm text-muted mt-2 line-clamp-3">
                                {r.introduction}
                              </p>
                              <div className="flex justify-between items-center mt-5 text-xs text-muted">
                                <span>
                                  {r.createdAt &&
                                  !Number.isNaN(new Date(r.createdAt).getTime())
                                    ? new Date(r.createdAt).toLocaleDateString()
                                    : "Date unavailable"}
                                </span>
                                <ArrowRight size={18} className="text-teal" />
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setReportToDelete(r)}
                              aria-label={`Delete report: ${r.title}`}
                              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 size={17} aria-hidden="true" />
                            </button>
                          </motion.article>
                        ))}
                      </motion.div>
                    ) : (
                      /* Empty State */
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="soft-card p-12 text-center"
                      >
                        <motion.div
                          initial={{ y: -10 }}
                          animate={{ y: 0 }}
                          transition={{
                            duration: 0.7,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                        >
                          <FileText className="mx-auto text-teal" size={30} />
                        </motion.div>

                        <h2 className="font-bold mt-4">No reports yet</h2>

                        <p className="text-muted mt-2">
                          Start researching your first topic.
                        </p>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="primary mt-5"
                          onClick={goNew}
                        >
                          Create Report
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </main>
          <Toast
            message={notice}
            type={noticeType}
            show={!!notice}
            onClose={() => setNotice("")}
          />
          {reportToDelete && (
            <div className="fixed inset-0 z-100 grid place-items-center bg-slate-950/75 px-4 backdrop-blur-sm">
              <section
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="delete-report-title"
                className="w-full max-w-md rounded-2xl border border-red-400/25 bg-slate-900 p-6 shadow-2xl"
              >
                <h2 id="delete-report-title" className="text-lg font-bold">
                  Delete this report?
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  “{reportToDelete.title}” will be permanently deleted.
                </p>
                <div className="mt-7 flex justify-end gap-3">
                  <button
                    type="button"
                    disabled={deletingReport}
                    onClick={() => setReportToDelete(null)}
                    className="secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={deletingReport}
                    onClick={deleteReport}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    {deletingReport ? "Deleting..." : "Delete report"}
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Render the dashboard page.
export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted">
          Loading workspace...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
