import React from "react";

export function Loading({ label }) {
  return (
    <div className="flex items-center gap-3 py-4 text-sm text-slate-400">
      <div className="relative h-5 w-5">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        <div className="absolute inset-1 animate-spin rounded-full border-2 border-indigo-400 border-b-transparent" style={{ animationDuration: "0.6s" }} />
      </div>
      <span className="text-slate-400">{label || "Loading..."}</span>
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm">
      <span className="mt-0.5 text-red-400 text-base">⚠</span>
      <span className="text-red-300">{message}</span>
    </div>
  );
}

export function SuccessBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-sm">
      <span className="mt-0.5 text-emerald-400 text-base">✓</span>
      <span className="text-emerald-300">{message}</span>
    </div>
  );
}
