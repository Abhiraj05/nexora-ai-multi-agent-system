"use client";
import {
  ArrowLeft,
  Download,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
const labels = {
  introduction: "Introduction",
  background: "Background",
  key_findings: "Key Findings",
  benefits: "Benefits",
  challenges: "Challenges",
  conclusion: "Conclusion",
  references: "References",
};
export default function ReportView({ report, onBack }) {
  if (!report) return null;
  const reportText = [
    report.title,
    "",
    ...Object.entries(labels).flatMap(([key, label]) => {
      const value = report[key];
      const content = Array.isArray(value)
        ? value.map((item) => `- ${item}`).join("\n")
        : value || "";
      return [label, content, ""];
    }),
  ].join("\n");
  const reportDate = report.createdAt ? new Date(report.createdAt) : null;
  const formattedDate =
    reportDate && !Number.isNaN(reportDate.getTime())
      ? reportDate.toLocaleString()
      : "";

  const download = () => {
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "research-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <article className="max-w-212.5 mx-auto px-5 py-12 md:py-16">
      <div className="flex justify-between gap-3 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-teal hover:underline"
        >
          <ArrowLeft size={17} /> All reports
        </button>
        <button
          onClick={download}
          className="secondary text-sm flex items-center gap-2"
        >
          <Download size={16} /> Export text
        </button>
      </div>
      <div className="inline-flex rounded-full bg-[#eaf3f3] text-teal text-[11px] tracking-[.13em] font-bold px-3 py-1 mb-5">
        <BookOpen size={13} className="mr-2" /> RESEARCH REPORT
      </div>
      <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-3">
        {report.title}
      </h1>
      <p className="text-sm text-muted mb-10">
        {formattedDate}
      </p>
      <div className="space-y-5">
        {Object.keys(labels).map((key) => (
          <section key={key} className="soft-card p-6 md:p-8">
            <h2 className="section-heading flex gap-3 items-center">
              {key === "key_findings" ? (
                <Lightbulb size={20} className="text-teal" />
              ) : key === "benefits" ? (
                <CheckCircle2 size={20} className="text-teal" />
              ) : key === "challenges" ? (
                <AlertTriangle size={20} className="text-amber-500" />
              ) : key === "references" ? (
                <ExternalLink size={20} className="text-teal" />
              ) : null}
              {labels[key]}
            </h2>
            {Array.isArray(report[key]) ? (
              <ul className="space-y-3 list-disc pl-5 text-[#536b69] leading-7">
                {report[key].map((item, i) => (
                  <li key={i} className="wrap-break-word">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[#536b69] leading-8 whitespace-pre-wrap">
                {report[key]}
              </p>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
