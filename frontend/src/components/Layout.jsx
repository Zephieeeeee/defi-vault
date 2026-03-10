import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useWallet } from "../state/WalletContext";

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

export function Layout({ children }) {
  const { address, connectWallet, isConnecting, isOnTargetNetwork, rawBalance } = useWallet();

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-[#060d1a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg,#22d3ee,#6366f1)", boxShadow: "0 0 20px rgba(34,211,238,0.4)" }}>
              <span className="text-sm font-black text-white tracking-tighter">DV</span>
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight leading-none">DeFiVault</div>
              <div className="text-[10px] text-slate-500 leading-none tracking-wide mt-0.5">Lending Protocol</div>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { to: "/", label: "Home" },
              { to: "/markets", label: "Markets" },
              { to: "/dashboard", label: "Dashboard" },
              { to: "/deposit", label: "Deposit" },
              { to: "/borrow", label: "Borrow" },
              { to: "/stake", label: "Stake" },
              { to: "/admin", label: "Admin" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  classNames(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-slate-800/60 text-cyan-300"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/30"
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right side wallet */}
          <div className="flex items-center gap-3">
            {/* Network badge */}
            <div
              className={classNames(
                "hidden sm:flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold backdrop-blur",
                isOnTargetNetwork
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-400"
              )}
            >
              <span
                className={classNames(
                  "h-1.5 w-1.5 rounded-full",
                  isOnTargetNetwork ? "bg-emerald-400" : "bg-amber-400"
                )}
                style={{ boxShadow: isOnTargetNetwork ? "0 0 6px #34d399" : "0 0 6px #f59e0b" }}
              />
              {isOnTargetNetwork ? "Hardhat Local" : "Wrong Network"}
            </div>

            {/* Wallet display */}
            {address ? (
              <div
                className="flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-900/70 p-1 pr-3 backdrop-blur"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
              >
                <div
                  className="rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#22d3ee,#6366f1)" }}
                >
                  {Number(rawBalance).toFixed(2)} ETH
                </div>
                <span className="font-mono text-xs text-slate-300">
                  {address.slice(0, 6)}…{address.slice(-4)}
                </span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn-primary"
              >
                {isConnecting ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Connecting...
                  </>
                ) : "Connect Wallet"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/40 py-6 text-center text-xs text-slate-600">
        DeFiVault Protocol · Built on Hardhat Local · For Educational Purposes
      </footer>
    </div>
  );
}
