import React from "react";

export function StatCard({ label, value, helper, accent = "cyan" }) {
  const accentMap = {
    cyan: {
      bar: "from-cyan-400 to-blue-500",
      value: "text-cyan-50",
      glow: "rgba(34,211,238,0.08)",
    },
    emerald: {
      bar: "from-emerald-400 to-teal-500",
      value: "text-emerald-50",
      glow: "rgba(52,211,153,0.08)",
    },
    indigo: {
      bar: "from-indigo-400 to-purple-500",
      value: "text-indigo-50",
      glow: "rgba(99,102,241,0.08)",
    },
    amber: {
      bar: "from-amber-400 to-orange-500",
      value: "text-amber-50",
      glow: "rgba(251,191,36,0.08)",
    },
  };

  const a = accentMap[accent] ?? accentMap.cyan;

  return (
    <div
      className="glass-panel flex flex-col gap-3 p-5"
      style={{ boxShadow: `0 0 40px -10px ${a.glow}, inset 0 1px 0 rgba(255,255,255,0.03)` }}
    >
      <div className={`h-1 w-10 rounded-full bg-gradient-to-r ${a.bar}`} />
      <div className={`text-2xl font-bold tracking-tight ${a.value}`} style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
        {helper && <div className="mt-0.5 text-[11px] text-slate-600">{helper}</div>}
      </div>
    </div>
  );
}
