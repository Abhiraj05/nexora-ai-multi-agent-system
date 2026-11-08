"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";

const features = [
  {
    icon: "🌐",
    title: "Real-time Web Research",
    description:
      "Explore the latest information from across the web and discover relevant sources for your research.",
    color: "bg-blue-50",
  },
  {
    icon: "🔬",
    title: "Deep Research & Analysis",
    description:
      "Analyze complex topics, connect information, and synthesize insights from multiple perspectives.",
    color: "bg-purple-50",
  },
  {
    icon: "✨",
    title: "AI-Powered Reports",
    description:
      "Generate comprehensive research reports with structured findings, conclusions, and references.",
    color: "bg-amber-50",
  },
  {
    icon: "📚",
    title: "Organized Research History",
    description:
      "Keep all your research reports organized in one place and revisit your previous discoveries.",
    color: "bg-emerald-50",
  },
  {
    icon: "⚡",
    title: "Fast & Intelligent",
    description:
      "Save hours of manual research with intelligent AI agents that gather and organize information.",
    color: "bg-orange-50",
  },
  {
    icon: "📄",
    title: "Structured Insights",
    description:
      "Get information presented in easy-to-understand sections with key findings, benefits, and challenges.",
    color: "bg-pink-50",
  },
];

const steps = [
  {
    number: "01",
    title: "Enter Your Topic",
    description:
      "Simply enter the topic or question you want to research. No complicated setup required.",
  },
  {
    number: "02",
    title: "AI Researches",
    description:
      "Your AI research agent gathers information, analyzes relevant sources, and synthesizes insights.",
  },
  {
    number: "03",
    title: "Get Your Report",
    description:
      "Receive a comprehensive research report with findings, benefits, challenges, and references.",
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

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
          <Navbar handleNavigate={handleNavigate} />

          {/* HERO SECTION */}
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
                Deploy intelligent AI research agents to explore topics,
                synthesize knowledge, and generate comprehensive research
                reports in seconds.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <button
                  onClick={() => handleNavigate("/signup")}
                  className="flex items-center justify-center gap-3 rounded-full bg-primary-600 px-9 py-4 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:-translate-y-1 hover:bg-primary-500"
                >
                  Start Researching →
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

            {/* RESEARCH PREVIEW */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative mx-auto mt-20 max-w-5xl"
            >
              <div className="rounded-2xl border border-[#e4ebea] bg-white p-3 shadow-[0_25px_80px_-30px_rgba(40,90,90,0.22)] sm:p-6">
                <div className="flex items-center justify-between border-b border-[#edf0ef] pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white">
                      ✦
                    </div>

                    <div>
                      <h3 className="text-sm font-bold">Research Workspace</h3>
                      <p className="text-xs text-[#93a5a3]">
                        Your AI research assistant
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-[#eaf5ef] px-3 py-1.5 text-xs font-semibold text-primary-600">
                    ● Ready
                  </span>
                </div>

                <div className="px-2 py-10 text-center sm:px-10 sm:py-14">
                  <span className="rounded-full bg-[#edf5f3] px-4 py-2 text-[10px] font-bold tracking-widest text-[#44858e]">
                    AI-POWERED RESEARCH
                  </span>

                  <h2 className="mt-6 text-2xl font-bold tracking-tight sm:text-4xl">
                    What do you want to discover?
                  </h2>

                  <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#849795]">
                    Enter any topic and let your AI research agent do the
                    exploration for you.
                  </p>

                  <div className="mx-auto mt-9 flex max-w-2xl items-center gap-3 rounded-xl border border-[#e0e9e7] bg-[#fcfdfd] p-3 shadow-sm">
                    <span className="pl-2 text-lg text-[#44858e]">⌕</span>

                    <span className="flex-1 text-left text-sm text-[#a5b3b1]">
                      What do you want to research?
                    </span>

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
                      →
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    {[
                      "Artificial Intelligence",
                      "Climate Change",
                      "Machine Learning",
                    ].map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full border border-[#e5eceb] bg-white px-4 py-2 text-xs text-[#78908e]"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0ef] px-3 pt-5 text-xs text-[#91a3a1] sm:px-5">
                  <span>✦ Intelligent research assistant</span>
                  <span>Powered by AI agents</span>
                </div>
              </div>
            </motion.div>
          </section>

          {/* FEATURES */}
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
                  Powerful research capabilities designed to help you explore
                  ideas, understand complex topics, and discover insights.
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

          {/* HOW IT WORKS */}
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

          {/* CTA */}
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
                  Explore new ideas, uncover valuable insights, and transform
                  the way you research with AI.
                </p>

                <button
                  onClick={() => handleNavigate("/signup")}
                  className="mt-9 inline-flex items-center gap-3 rounded-full bg-white px-9 py-4 text-sm font-bold text-[#326e75] transition hover:-translate-y-1 hover:bg-[#edf5f3]"
                >
                  Get Started For Free →
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
