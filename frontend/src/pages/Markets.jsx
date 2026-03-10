import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../config";
import { Loading, ErrorBanner } from "../components/Feedback";
import { Link } from "react-router-dom";

function UtilBar({ value, max }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const color = pct > 80 ? "#f87171" : pct > 60 ? "#fbbf24" : "#34d399";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-[11px] font-mono text-slate-400">{pct.toFixed(1)}%</span>
    </div>
  );
}

export function Markets() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${config.backendUrl}/api/protocol/stats`);
        if (!active) return;
        setStats(res.data);
      } catch (e) {
        if (!active) return;
        setError("Failed to load protocol stats");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  const totalDeposits = stats ? Number(stats.totalDepositsWei) : 0;
  const totalBorrowed = stats ? Number(stats.totalBorrowedWei) : 0;
  const tvl = stats ? Number(stats.tvlEth) : 0;
  const toEth = w => Number(w / 1e18).toFixed(4);

  return (
    <div className="flex flex-col gap-8">

      {/* ── Header ── */}
      <div
        className="glass-panel relative overflow-hidden rounded-3xl p-10"
        style={{ boxShadow: "0 0 80px -20px rgba(99,102,241,0.15)" }}
      >
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 8px #34d399" }} />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">All Markets Live</span>
            </div>
            <h1
              className="text-4xl font-extrabold"
              style={{
                background: "linear-gradient(135deg,#fff 0%,#94a3b8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Markets
            </h1>
            <p className="mt-2 max-w-lg text-sm text-slate-400">
              Supply assets to earn yield, use them as collateral to unlock borrowing power.
            </p>
          </div>
          {stats && (
            <div className="flex gap-4">
              {[
                { label: "TVL", value: `${tvl.toFixed(4)} ETH`, color: "text-cyan-400" },
                { label: "Users", value: stats.userCount, color: "text-indigo-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl border border-slate-800/60 bg-slate-900/50 px-5 py-3 text-center">
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1">{label}</div>
                  <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ErrorBanner message={error} />
      {loading && <Loading label="Loading markets data..." />}

      {!loading && stats && (
        <div className="glass-panel overflow-hidden rounded-2xl">
          <table className="w-full text-left text-sm data-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Total Supplied</th>
                <th>Utilization</th>
                <th className="text-emerald-400">Supply APY</th>
                <th>Total Borrowed</th>
                <th className="text-indigo-400">Borrow APY</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* ETH Market */}
              <tr>
                <td>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700"
                      style={{ background: "linear-gradient(135deg,#1e293b,#0f172a)" }}
                    >
                      <span className="text-xs font-black text-slate-200">ETH</span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100">Ethereum</div>
                      <div className="text-[11px] text-slate-500">Native Asset · ERC-20</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="font-mono font-semibold text-slate-200">{toEth(totalDeposits)} ETH</div>
                </td>
                <td>
                  <UtilBar value={totalBorrowed} max={totalDeposits} />
                </td>
                <td>
                  <span className="font-bold text-emerald-400">8.00%</span>
                </td>
                <td>
                  <div className="font-mono font-semibold text-slate-200">{toEth(totalBorrowed)} ETH</div>
                </td>
                <td>
                  <span className="font-bold text-indigo-400">10.50%</span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <Link to="/deposit" className="btn-primary px-3 py-1.5 text-xs">Supply</Link>
                    <Link to="/borrow" className="btn-secondary px-3 py-1.5 text-xs">Borrow</Link>
                  </div>
                </td>
              </tr>

              {/* DVT — Reward only */}
              <tr className="opacity-60">
                <td>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700"
                      style={{ background: "linear-gradient(135deg,#1e293b,#0f172a)" }}
                    >
                      <span className="text-xs font-black text-amber-400">DVT</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100">DeFiVault Token</span>
                        <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-400">Reward</span>
                      </div>
                      <div className="text-[11px] text-slate-500">Staking Asset · DVT</div>
                    </div>
                  </div>
                </td>
                <td><span className="text-slate-600 font-mono">—</span></td>
                <td><span className="text-slate-600 font-mono">—</span></td>
                <td><span className="text-slate-600">—</span></td>
                <td><span className="text-slate-600 font-mono">—</span></td>
                <td><span className="text-slate-600">—</span></td>
                <td>
                  <Link to="/stake" className="btn-secondary px-3 py-1.5 text-xs">Stake</Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
