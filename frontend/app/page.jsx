"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  CircleUserRound,
  Globe2,
  LayoutDashboard,
  Microscope,
  Search,
  Sparkles,
  Telescope,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import Toast from "@/components/Toast";

const features = [
  {
    icon: "🤖",
    title: "Multi-Agent Research",
    description:
      "A researcher, analyst, and writer work together to turn your topic into a report.",
    color: "bg-blue-50",
  },
  {
    icon: "🔬",
    title: "Critical Review",
    description:
      "Research notes are assessed for unsupported claims, assumptions, and uncertainty.",
    color: "bg-purple-50",
  },
  {
    icon: "✨",
    title: "Structured Reports",
    description:
      "Read an organized report with background, findings, benefits, challenges, and references.",
    color: "bg-amber-50",
  },
  {
    icon: "📚",
    title: "Saved Research History",
    description:
      "Reports are saved to your account so you can return to them from your dashboard.",
    color: "bg-emerald-50",
  },
  {
    icon: "📄",
    title: "Text Export",
    description:
      "Download a generated report as a plain-text file.",
    color: "bg-orange-50",
  },
  {
    icon: "🔎",
    title: "Research References",
    description:
      "Review the source references included in each generated report.",
    color: "bg-pink-50",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose a Topic",
    description:
      "Enter the topic or question you want the research team to explore.",
  },
  {
    number: "02",
    title: "Research, Review, and Write",
    description:
      "AI researcher, analyst, and writer agents gather notes, assess uncertainty, and prepare a structured report.",
  },
  {
    number: "03",
    title: "Review and Save Your Report",
    description:
      "Open your saved report in the dashboard, explore its sections and references, or export it as a text file.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

// Render the home page.
export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsLoggedIn(!!localStorage.getItem("research_access_token"));
      const noticeMessage =
        sessionStorage.getItem("account_deleted_toast") ||
        sessionStorage.getItem("logout_toast");
      if (noticeMessage) {
        sessionStorage.removeItem("account_deleted_toast");
        sessionStorage.removeItem("logout_toast");
        setNotice(noticeMessage);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  // Navigate to the selected page.
  const handleNavigate = (route) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push(route);
    }, 2000);
  };
  return (
    <>
      {loading && <Loader />}

      {!loading && (
        <main className="min-h-screen overflow-hidden text-[#142625]">
          <Toast
            message={notice}
            type="success"
            show={!!notice}
            onClose={() => setNotice("")}
          />
          <Navbar handleNavigate={handleNavigate} />


          <section className="relative px-6 pb-24 pt-40 lg:pt-48">
            <div className="pointer-events-none absolute left-1/2 top-20 z-0 h-112.5 w-162.5 -translate-x-1/2 rounded-full bg-primary-600/10 opacity-60 blur-[110px]" />

            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="relative z-10 mx-auto max-w-5xl text-center"
            >
              <motion.div variants={itemVariants}>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#dceae8] bg-[#edf5f3] px-5 py-2 text-xs font-bold tracking-[0.15em] text-[#44858e]">
                  ✦ AI-POWERED RESEARCH PLATFORM
                </span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="mx-auto mt-9 max-w-4xl text-5xl font-bold leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl"
              >
                Study, Research,
                <br />
                <span className="text-primary-500">
                  Discover Everything.
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[#718483] sm:text-lg"
              >
                Submit a topic and let AI agents gather research notes, assess
                uncertainty, and create a structured report with references.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <button
                  onClick={() =>
                    handleNavigate(isLoggedIn ? "/dashboard" : "/signup")
                  }
                  className="flex items-center justify-center gap-3 rounded-full bg-primary-600 px-9 py-4 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:-translate-y-1 hover:bg-primary-500"
                >
                  {isLoggedIn ? "Open Dashboard →" : "Start Researching →"}
                </button>

                <Link
                  href="#features"
                  className="rounded-full border border-[#dce5e4] bg-white px-9 py-4 text-sm font-semibold text-[#466a6a] transition hover:border-[#44858e]"
                >
                  Explore Features
                </Link>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-[#91a3a1]"
              >
                <span>✓ AI-powered research</span>
                <span>✓ Structured reports</span>
                <span>✓ Organized history</span>
              </motion.div>
            </motion.div>


            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative mx-auto mt-20 max-w-6xl"
            >
              <div className="overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-950 shadow-[0_30px_90px_-35px_rgba(0,0,0,0.75)]">
                <div className="flex min-h-137.5">
                  <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-700/70 bg-slate-900/90 sm:flex">
                    <div className="flex h-18.5 items-center gap-3 border-b border-slate-700/70 px-4">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-600 text-white">
                        <Microscope size={21} aria-hidden="true" />
                      </span>
                      <span className="font-bold tracking-tight text-slate-100">
                        Nexora AI
                      </span>
                    </div>
                    <div className="flex-1 px-4 py-7">
                      <p className="mb-3 px-2 text-[10px] font-bold tracking-[.16em] text-slate-500">
                        WORKSPACE
                      </p>
                      <div className="flex items-center gap-3 rounded-xl bg-primary-600/15 px-3 py-3 text-sm font-semibold text-primary-400">
                        <LayoutDashboard size={17} aria-hidden="true" />
                        Dashboard
                      </div>
                    </div>
                    <div className="border-t border-slate-700/70 p-4">
                      <div className="mb-3 flex items-center gap-3 text-sm text-slate-300">
                        <CircleUserRound
                          size={19}
                          className="text-primary-400"
                          aria-hidden="true"
                        />
                        Your account
                      </div>
                      <div className="rounded-xl bg-primary-600 px-3 py-2 text-center text-xs font-semibold text-white">
                        Sign Out
                      </div>
                    </div>
                  </aside>

                  <div className="min-w-0 flex-1 bg-slate-950 px-5 py-9 sm:px-9 sm:py-11">
                    <div className="mx-auto max-w-2xl">
                      <div className="text-center">
                        <span className="inline-flex items-center gap-2 rounded-full bg-primary-600/15 px-3 py-1 text-[10px] font-bold tracking-[.15em] text-primary-400">
                          <Sparkles size={12} aria-hidden="true" />
                          AI-POWERED RESEARCH
                        </span>
                        <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
                          Study, Research,
                          <br />
                          <span className="text-primary-400">
                            Discover Everything.
                          </span>
                        </h2>
                        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-400">
                          A researcher gathers notes, an analyst flags
                          uncertainty, and a writer prepares your report.
                        </p>
                      </div>

                      <div className="mt-9 rounded-[18px] border border-slate-700/80 bg-slate-900/90 p-4 shadow-xl sm:p-5">
                        <div className="flex min-h-20 items-start gap-3">
                          <Search
                            size={17}
                            className="mt-1 shrink-0 text-primary-400"
                            aria-hidden="true"
                          />
                          <span className="text-left text-sm text-slate-500">
                            What do you want to know?
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-700/70 pt-3">
                          <div className="flex items-center gap-3 text-slate-500">
                            <Globe2 size={17} aria-hidden="true" />
                            <Telescope size={17} aria-hidden="true" />
                          </div>
                          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-600 text-white">
                            <ArrowUp size={19} aria-hidden="true" />
                          </span>
                        </div>
                      </div>

                      <div className="mt-7 grid gap-3 sm:grid-cols-3">
                        {[
                          {
                            icon: Globe2,
                            title: "Source References",
                            description: "Review source references alongside your report.",
                          },
                          {
                            icon: Telescope,
                            title: "Critical Review",
                            description: "An analyst flags unsupported claims and uncertainty.",
                          },
                          {
                            icon: Sparkles,
                            title: "Structured Reports",
                            description: "Reports include findings, benefits, and challenges.",
                          },
                        ].map(({ icon: Icon, title, description }) => (
                          <div
                            key={title}
                            className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4"
                          >
                            <Icon
                              size={19}
                              className="text-primary-400"
                              aria-hidden="true"
                            />
                            <h3 className="mt-3 text-xs font-bold text-slate-200">
                              {title}
                            </h3>
                            <p className="mt-1 text-[11px] leading-5 text-slate-400">
                              {description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>


          <section id="features" className="bg-white px-6 py-24">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto max-w-2xl text-center">
                <span className="text-xs font-bold tracking-[0.2em] text-[#44858e]">
                  WHAT WE OFFER
                </span>

                <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">
                  Everything you need to
                  <br />
                  <span className="text-[#44858e]">research smarter.</span>
                </h2>

                <p className="mt-5 text-sm leading-7 text-[#829492] sm:text-base">
                  Research a topic with AI agents and get a structured report
                  with findings, benefits, challenges, and references.
                </p>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {features.map((feature) => (
                  <motion.div
                    variants={itemVariants}
                    key={feature.title}
                    whileHover={{ y: -7 }}
                    className="group rounded-2xl border border-[#e9eeee] bg-[#fafbfc] p-8 transition duration-300 hover:border-[#b7d5d2] hover:bg-white hover:shadow-xl hover:shadow-[#44858e]/5"
                  >
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${feature.color}`}
                    >
                      {feature.icon}
                    </div>

                    <h3 className="mt-7 text-lg font-bold text-[#203331]">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-[#849795]">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>


          <section id="how-it-works" className="px-6 py-24">
            <div className="mx-auto max-w-7xl">
              <div className="text-center">
                <span className="text-xs font-bold tracking-[0.2em] text-[#44858e]">
                  SIMPLE WORKFLOW
                </span>

                <h2 className="mt-5 text-3xl font-bold sm:text-5xl">
                  Research made effortless.
                </h2>

                <p className="mt-5 text-sm text-[#829492] sm:text-base">
                  Three simple steps to turn your curiosity into knowledge.
                </p>
              </div>

              <div className="mt-16 grid gap-8 md:grid-cols-3">
                {steps.map((step, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    key={step.number}
                    className="relative rounded-2xl border border-[#e7eeed] bg-white p-8"
                  >
                    <span className="text-5xl font-bold text-[#e0eeec]">
                      {step.number}
                    </span>

                    <h3 className="mt-7 text-xl font-bold">{step.title}</h3>

                    <p className="mt-4 text-sm leading-7 text-[#829492]">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>


          <section id="about" className="px-6 pb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary-600 px-8 py-20 text-center sm:px-16"
            >
              <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/10" />

              <div className="relative z-10 mx-auto max-w-2xl">
                <span className="text-xs font-bold tracking-[0.2em] text-[#c4e3df]">
                  START YOUR JOURNEY
                </span>

                <h2 className="mt-6 text-3xl font-bold leading-tight text-white sm:text-5xl">
                  Your next big discovery
                  <br />
                  starts with a question.
                </h2>

                <p className="mt-6 text-sm leading-7 text-white/70 sm:text-base">
                  Turn a research question into a structured report with
                  findings, challenges, and references.
                </p>

                <button
                  onClick={() =>
                    handleNavigate(isLoggedIn ? "/dashboard" : "/signup")
                  }
                  className="mt-9 inline-flex items-center gap-3 rounded-full bg-slate-950 px-9 py-4 text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-slate-800"
                >
                  {isLoggedIn ? "Go to Your Dashboard →" : "Get Started For Free →"}
                </button>
              </div>
            </motion.div>
          </section>

          <Footer handleNavigate={handleNavigate} />
        </main>
      )}
    </>
  );
}
