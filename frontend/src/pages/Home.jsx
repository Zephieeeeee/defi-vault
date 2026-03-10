import React, { useEffect, useState } from "react";
import axios from "axios";
import { StatCard } from "../components/StatCard";
import { Loading, ErrorBanner } from "../components/Feedback";
import { config } from "../config";
import { Link } from "react-router-dom";

export function Home() {
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

  return (
    <div className="flex flex-col gap-8">

      {/* ── Hero Banner ── */}
      <section
        className="glass-panel relative overflow-hidden rounded-3xl p-10 md:p-14"
        style={{ boxShadow: "0 0 80px -20px rgba(34,211,238,0.15), 0 0 60px -30px rgba(99,102,241,0.15)" }}
      >
        {/* Background orbs */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full bg-emerald-400"
                style={{ boxShadow: "0 0 8px #34d399", animation: "pulse-glow 2s ease-in-out infinite" }}
              />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Live on Hardhat Local</span>
            </div>
            <h1
              className="text-4xl font-extrabold leading-tight md:text-5xl"
              style={{
                background: "linear-gradient(135deg, #fff 0%, #cbd5e1 60%, #94a3b8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Non-Custodial<br />ETH Lending &<br />Staking
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Deposit ETH as collateral, borrow against it, and earn DVT rewards through staking. 
              Full control over your assets — no middlemen.
            </p>
            <div className="flex items-center gap-3">
              <Link to="/deposit" className="btn-primary">Start Depositing</Link>
              <Link to="/markets" className="btn-secondary">View Markets</Link>
            </div>
          </div>

          {/* Stats pills */}
          <div className="flex flex-col gap-3 min-w-[200px]">
            {[
              { label: "Base Supply APY", value: "8.00%", color: "text-emerald-400" },
              { label: "Borrow APY", value: "10.50%", color: "text-indigo-400" },
              { label: "Collateral Factor", value: "75%", color: "text-cyan-400" },
              { label: "Liquidation Threshold", value: "80%", color: "text-amber-400" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-900/50 px-4 py-3"
              >
                <span className="text-xs text-slate-500 font-medium">{label}</span>
                <span className={`text-sm font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Protocol Stats ── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Protocol Overview</h2>
          {!loading && <span className="text-[11px] text-slate-600">Auto-refreshing every 15s</span>}
        </div>
        <ErrorBanner message={error} />
        {loading && <Loading label="Loading protocol metrics..." />}
        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Value Locked"
              value={`${Number(stats.tvlEth).toFixed(4)} ETH`}
              helper="Total deposits minus borrows"
              accent="cyan"
            />
            <StatCard
              label="Total Supplied"
              value={`${Number(window.parseFloat((Number(stats.totalDepositsWei)/1e18).toString())).toFixed(4)} ETH`}
              helper="All deposited collateral"
              accent="emerald"
            />
            <StatCard
              label="Total Borrowed"
              value={`${Number(window.parseFloat((Number(stats.totalBorrowedWei)/1e18).toString())).toFixed(4)} ETH`}
              helper="Outstanding borrows"
              accent="indigo"
            />
            <StatCard
              label="Active Users"
              value={stats.userCount}
              helper="Unique protocol participants"
              accent="amber"
            />
          </div>
        )}
      </section>

      {/* ── Quick Actions ── */}
      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Deposit & Withdraw",
              desc: "Add ETH as collateral to earn 8% APY and unlock borrowing power.",
              link: "/deposit",
              linkLabel: "Deposit ETH",
              gradient: "from-cyan-400 to-blue-500",
              glow: "rgba(34,211,238,0.2)",
            },
            {
              title: "Borrow & Repay",
              desc: "Borrow up to 75% of your collateral. Repay anytime to free your assets.",
              link: "/borrow",
              linkLabel: "Borrow ETH",
              gradient: "from-indigo-400 to-purple-500",
              glow: "rgba(99,102,241,0.2)",
            },
            {
              title: "Stake & Earn DVT",
              desc: "Stake DVT reward tokens to compound your yield over time.",
              link: "/stake",
              linkLabel: "Stake DVT",
              gradient: "from-emerald-400 to-teal-500",
              glow: "rgba(52,211,153,0.2)",
            },
          ].map(({ title, desc, link, linkLabel, gradient, glow }) => (
            <div
              key={title}
              className="glass-panel group flex flex-col gap-4 p-6 transition-all"
              style={{ boxShadow: `0 0 0 0 ${glow}`, transition: "box-shadow 0.3s" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 30px -5px ${glow}`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${gradient}`} />
              <div>
                <div className="mb-1 font-bold text-slate-100">{title}</div>
                <div className="text-xs leading-relaxed text-slate-400">{desc}</div>
              </div>
              <Link
                to={link}
                className="btn-primary self-start text-[13px] px-4 py-2"
              >
                {linkLabel} →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
