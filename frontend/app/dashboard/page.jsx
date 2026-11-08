"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

import Sidebar from "@/components/Sidebar";
import ResearchHome from "@/components/ResearchHome";
import ReportView from "@/components/ReportView";

import { FileText, Plus, ArrowRight } from "lucide-react";

const getReports = () => {
  try {
    return JSON.parse(localStorage.getItem("research_reports") || "[]");
  } catch {
    return [];
  }
};

const saveReports = (reports) =>
  localStorage.setItem("research_reports", JSON.stringify(reports));

const validateReport = (report) =>
  !!report &&
  typeof report.title === "string" &&
  ["introduction", "background", "conclusion"].every(
    (key) => typeof report[key] === "string",
  ) &&
  ["key_findings", "benefits", "challenges", "references"].every((key) =>
    Array.isArray(report[key]),
  );

function DashboardContent() {
  const router = useRouter();
  const params = useSearchParams();

  const [reports, setReports] = useState([]);
  const [active, setActive] = useState(null);
  const [mode, setMode] = useState("home");
  const [loading, setLoading] = useState(false);
  const authorizationHeaders = () => {
    const token = localStorage.getItem("research_access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Animation variants
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

  // Get reports from backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/reports`,
          { headers: authorizationHeaders() },
        );

        const list = response.data.reports || response.data;

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
            window.sessionStorage.setItem(
              "pending_research_topic",
              topic
            );
          }
        } else if (list.length) {
          setMode("list");
        }
      } catch (err) {
        console.error("Error fetching reports:", err);

        // Fallback to locally stored reports
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
            window.sessionStorage.setItem(
              "pending_research_topic",
              topic
            );
          }
        } else if (list.length) {
          setMode("list");
        }
      }
    };

    fetchReports();
  }, [params]);

  // Create new report
  const goNew = () => {
    setMode("home");
    setActive(null);

    router.replace("/dashboard?new=1");
  };

  // Select report
  const select = (id) => {
    setActive(String(id));
    setMode("report");

    router.replace("/dashboard?id=" + id);
  };

  // Save generated research report
  async function research(payload) {
    setLoading(true);

    try {
      const report = payload.report || payload;

      if (!validateReport(report)) {
        throw new Error(
          "API returned an invalid report structure."
        );
      }

      const entry = {
        ...report,
        id: report.id || crypto.randomUUID(),
        createdAt:
          report.createdAt || new Date().toISOString(),
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

  return (
    <div className="min-h-screen md:flex">

      {/* Sidebar */}
      <Sidebar
        reports={reports}
        activeId={active}
        onNew={goNew}
        onSelect={select}
      />

      {/* Main Content */}
      <main className="flex-1 min-w-0">

        <AnimatePresence mode="wait">

          {/* Research Home */}
          {mode === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <ResearchHome
                onResearch={research}
                loading={loading}
              />
            </motion.div>
          )}

          {/* Report View */}
          {mode === "report" && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <ReportView
                report={reports.find((r) => String(r.id) === String(active))}
                onBack={() => {
                  setMode("list");
                  router.replace("/dashboard");
                }}
              />
            </motion.div>
          )}

          {/* Reports List */}
          {mode === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="max-w-237.5 mx-auto px-6 py-14"
            >

              {/* Header */}
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

                {/* Create New Report */}
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

              {/* Reports Grid */}
              {reports.length ? (

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid sm:grid-cols-2 gap-4"
                >
                  {reports.map((r, index) => (

                    <motion.button
                      variants={itemVariants}
                      whileHover={{
                        y: -6,
                        scale: 1.01,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      onClick={() => select(r.id)}
                      key={r.id}
                      className="soft-card text-left p-6 hover:border-[#b5d3d4] hover:shadow-sm transition-all duration-300"
                    >

                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: index * 0.08,
                        }}
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
                          {new Date(
                            r.createdAt
                          ).toLocaleDateString()}
                        </span>

                        <motion.span
                          whileHover={{ x: 5 }}
                        >
                          <ArrowRight
                            size={18}
                            className="text-teal"
                          />
                        </motion.span>

                      </div>

                    </motion.button>

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
                    <FileText
                      className="mx-auto text-teal"
                      size={30}
                    />
                  </motion.div>

                  <h2 className="font-bold mt-4">
                    No reports yet
                  </h2>

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

      </main>

    </div>
  );
}

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