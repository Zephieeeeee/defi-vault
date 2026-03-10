import React, { useEffect, useState } from "react";
import axios from "axios";
import { useWallet } from "../state/WalletContext";
import { config } from "../config";
import { StatCard } from "../components/StatCard";
import { Loading, ErrorBanner } from "../components/Feedback";

export function Dashboard() {
  const { address } = useWallet();
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!address) return;
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${config.backendUrl}/api/user/${address}/positions`);
        if (!active) return;
        setPosition(res.data);
      } catch (e) {
        if (!active) return;
        setError("Failed to load your position");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => { active = false; clearInterval(interval); };
  }, [address]);

  if (!address) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center gap-6 p-16 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "linear-gradient(135deg,#22d3ee22,#6366f122)", border: "1px solid rgba(34,211,238,0.2)" }}
        >
          <svg className="h-7 w-7 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.563A.562.562 0 0 1 9 14.437V9.563Z" />
          </svg>
        </div>
        <div>
          <div className="text-xl font-bold text-slate-100 mb-2">Connect Your Wallet</div>
          <p className="text-sm text-slate-400 max-w-sm">
            Connect MetaMask to view your collateral, debt, health factor, and staking rewards.
          </p>
        </div>
      </div>
    );
  }

  const toEth = value => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "0.0000";
    return (n / 1e18).toFixed(4);
  };

  const health = position ? Number(position.healthFactor) / 1e18 : 0;
  const healthConfig =
    health > 2 ? { label: "Excellent", gradient: "from-emerald-400 to-teal-400", bar: "bg-emerald-400" } :
    health > 1.3 ? { label: "Healthy", gradient: "from-emerald-300 to-cyan-400", bar: "bg-emerald-300" } :
    health > 1 ? { label: "At Risk", gradient: "from-amber-400 to-orange-400", bar: "bg-amber-400" } :
    health > 0 ? { label: "Liquidatable", gradient: "from-red-400 to-rose-500", bar: "bg-red-400" } :
    { label: "No Debt", gradient: "from-slate-400 to-slate-500", bar: "bg-slate-400" };

  const healthPct = health > 0 ? Math.min((health / 3) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-8">

      {/* ── Header card ── */}
      <div
        className="glass-panel relative overflow-hidden rounded-3xl p-8"
        style={{ boxShadow: "0 0 60px -20px rgba(34,211,238,0.1)" }}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">

          {/* Address info */}
          <div>
            <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Your Position</div>
            <div className="text-lg font-bold text-slate-100 mb-1">Connected Wallet</div>
            <div className="font-mono text-sm text-slate-400">{address}</div>
          </div>

          {/* Health factor */}
          {health > 0 && (
            <div className="flex flex-col items-end gap-2">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Health Factor</div>
              <div
                className={`text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${healthConfig.gradient}`}
              >
                {health.toFixed(2)}
              </div>
              <div className="text-xs font-semibold text-slate-400">{healthConfig.label}</div>
              {/* Health bar */}
              <div className="h-1.5 w-40 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${healthConfig.bar} transition-all duration-700`}
                  style={{ width: `${healthPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <ErrorBanner message={error} />
      {loading && <Loading label="Loading your position..." />}

      {position && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Collateral" value={`${toEth(position.totalCollateralWei)} ETH`} helper="Deposited as collateral" accent="cyan" />
          <StatCard label="Debt" value={`${toEth(position.totalDebtWei)} ETH`} helper="Outstanding borrow balance" accent="indigo" />
          <StatCard label="Staked DVT" value={`${toEth(position.totalStakedWei)} DVT`} helper="DVT staked for rewards" accent="emerald" />
          <StatCard label="Pending Rewards" value={`${toEth(position.pendingRewardsWei)} DVT`} helper="Claimable staking rewards" accent="amber" />
        </div>
      )}
    </div>
  );
}
