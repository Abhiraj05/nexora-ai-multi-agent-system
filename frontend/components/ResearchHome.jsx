"use client";
import { useState } from "react";
import axios from "axios";
import {
  ArrowUp,
  Globe2,
  Search,
  Telescope,
  Sparkles,
  LoaderCircle,
} from "lucide-react";
import Toast from "@/components/Toast";
const features = [
  {
    icon: Globe2,
    color: "text-blue-500",
    title: "Source References",
    desc: "Get research references alongside your generated report.",
  },
  {
    icon: Telescope,
    color: "text-purple-500",
    title: "Critical Analysis",
    desc: "Research notes are reviewed for assumptions and uncertainty.",
  },
  {
    icon: Sparkles,
    color: "text-amber-500",
    title: "Structured Reports",
    desc: "Explore findings, benefits, challenges, and conclusions in one report.",
  },
];
// Render the research topic form.
export default function ResearchHome({ onResearch, loading }) {
  const [topic, setTopic] = useState(() =>
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("topic") || ""
      : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Update the form field value.
  const handleChange = (event) => {
    setTopic(event.target.value);
    setError("");
  };

  // Validate and submit the form.
  const handleSubmit = async (e) => {
    e.preventDefault();
    const researchTopic = topic.trim();
    if (!researchTopic || loading || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("research_access_token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/research`,
        { topic: researchTopic },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      await onResearch(response.data);
      setTopic("");
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.message;
      setError(
        typeof detail === "string"
          ? detail
          : err.message || "Research generation failed.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  const isLoading = loading || submitting;

  return (
    <div className="max-w-225 mx-auto px-5 pt-28.75 md:pt-48.5 pb-20">
      <Toast
        message={error}
        type="error"
        show={!!error}
        onClose={() => setError("")}
      />
      <div className="text-center">
        <span className="inline-flex items-center gap-2 bg-[#eaf2f2] text-teal text-[11px] font-bold tracking-[.15em] rounded-full px-3 py-1">
          <Sparkles size={13} /> AI-POWERED RESEARCH
        </span>
        <h1 className="mt-6 text-[42px] md:text-[62px] leading-[1.03] tracking-[-.045em] font-bold">
          Study, Research,
          <br />
          <span className="text-teal">Discover Everything.</span>
        </h1>
        <p className="text-muted text-[16px] md:text-[17px] leading-8 max-w-137.5 mx-auto mt-5">
          Deploy advanced AI agents to synthesize knowledge from the entire web
          in seconds.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        aria-busy={isLoading}
        className={`mt-12 bg-white border border-[#e2e9e8] rounded-[18px] p-5 shadow-[0_2px_10px_rgba(0,0,0,.025)] transition-all duration-300 ${
          isLoading ? "ring-2 ring-teal/20 shadow-lg shadow-teal/10" : ""
        }`}
      >
        <textarea
          aria-label="Research topic"
          value={topic}
          onChange={handleChange}
          readOnly={isLoading}
          placeholder="What do you want to know?"
          rows={2}
          className="w-full resize-none text-[15px] placeholder:text-[#b0bdbc] outline-none"
        />
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-3 text-teal items-center">
            <span className="bg-[#f5f9f9] rounded-xl p-2">
              <Search size={17} />
            </span>
            <Telescope size={17} className="text-ink" />
          </div>
          <div className="flex gap-5 items-center text-[#a6b6b4]">
            <Globe2 size={18} />
            <button
              type="submit"
              disabled={!topic.trim() || isLoading}
              aria-label={isLoading ? "Generating report" : "Generate report"}
              className="rounded-full bg-[#e9f1f1] text-teal w-10 h-10 grid place-items-center hover:bg-[#d6e9e9]"
            >
              {isLoading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <ArrowUp size={19} />
              )}
            </button>
          </div>
        </div>
        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 border-t border-[#e2e9e8] pt-4"
          >
            <p className="text-sm font-medium text-teal">
              Generating your research report
            </p>
            <p className="mt-1 text-xs text-muted">
              Searching the web and synthesizing sources...
            </p>
            <div
              aria-hidden="true"
              className="mt-3 h-1 overflow-hidden rounded-full bg-[#e9f1f1]"
            >
              <div className="research-progress h-full rounded-full bg-teal" />
            </div>
          </div>
        )}
      </form>
      <div className="grid md:grid-cols-3 gap-5 mt-16">
        {features.map((f) => (
          <div key={f.title} className="soft-card p-6 min-h-41.5">
            <f.icon className={f.color} size={23} />
            <h3 className="font-bold text-[16px] mt-4 mb-2">{f.title}</h3>
            <p className="text-muted text-[13px] leading-6">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
