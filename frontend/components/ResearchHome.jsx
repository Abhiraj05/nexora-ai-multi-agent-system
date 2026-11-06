"use client";
import { useState } from "react";
import {
  ArrowUp,
  Globe2,
  Search,
  Telescope,
  Sparkles,
  LoaderCircle,
} from "lucide-react";
const features = [
  {
    icon: Globe2,
    color: "text-blue-500",
    title: "Real-time Web",
    desc: "Access the latest data and academic papers live.",
  },
  {
    icon: Telescope,
    color: "text-purple-500",
    title: "Deep Synthesis",
    desc: "Analyze multiple perspectives for complex topics.",
  },
  {
    icon: Sparkles,
    color: "text-amber-500",
    title: "Pro Insights",
    desc: "Generate expert-level reports with citations.",
  },
];
export default function ResearchHome({ onResearch, loading, error }) {
  const [topic, setTopic] = useState(() =>
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("topic") || ""
      : "",
  );
  const submit = (e) => {
    e.preventDefault();
    if (topic.trim()) onResearch(topic.trim());
  };
  return (
    <div className="max-w-[900px] mx-auto px-5 pt-[115px] md:pt-[194px] pb-20">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 bg-[#eaf2f2] text-teal text-[11px] font-bold tracking-[.15em] rounded-full px-3 py-1">
          <Sparkles size={13} /> AI-POWERED RESEARCH
        </span>
        <h1 className="mt-6 text-[42px] md:text-[62px] leading-[1.03] tracking-[-.045em] font-bold">
          Study, Research,
          <br />
          <span className="text-teal">Discover Everything.</span>
        </h1>
        <p className="text-muted text-[16px] md:text-[17px] leading-8 max-w-[550px] mx-auto mt-5">
          Deploy advanced AI agents to synthesize knowledge from the entire web
          in seconds.
        </p>
      </div>
      <form
        onSubmit={submit}
        className="mt-12 bg-white border border-[#e2e9e8] rounded-[18px] p-5 shadow-[0_2px_10px_rgba(0,0,0,.025)]"
      >
        <textarea
          aria-label="Research topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
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
              disabled={!topic.trim() || loading}
              className="rounded-full bg-[#e9f1f1] text-teal w-10 h-10 grid place-items-center hover:bg-[#d6e9e9]"
            >
              {loading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <ArrowUp size={19} />
              )}
            </button>
          </div>
        </div>
      </form>
      {error && (
        <p role="alert" className="text-red-600 text-sm mt-3">
          {error}
        </p>
      )}
      <div className="grid md:grid-cols-3 gap-5 mt-16">
        {features.map((f) => (
          <div key={f.title} className="soft-card p-6 min-h-[166px]">
            <f.icon className={f.color} size={23} />
            <h3 className="font-bold text-[16px] mt-4 mb-2">{f.title}</h3>
            <p className="text-muted text-[13px] leading-6">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
