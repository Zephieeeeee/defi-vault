import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "../state/WalletContext";
import { getLendingContract } from "../lib/contracts";
import { Loading, ErrorBanner, SuccessBanner } from "../components/Feedback";

export function BorrowRepay() {
  const { signer, isOnTargetNetwork } = useWallet();
  const [borrowAmount, setBorrowAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [position, setPosition] = useState({ collateral: 0n, debt: 0n });

  useEffect(() => {
    if (!signer) return;
    const fetch = async () => {
      try {
        const contract = getLendingContract(signer);
        const addr = await signer.getAddress();
        const coll = await contract.collateralOf(addr);
        const dbt = await contract.debtOf(addr);
        setPosition({ collateral: coll, debt: dbt });
      } catch {}
    };
    fetch();
  }, [signer, success]);

  const requireSigner = () => {
    if (!signer) throw new Error("Connect wallet to continue");
    if (!isOnTargetNetwork) throw new Error("Switch to the target network");
    return signer;
  };

  const maxBorrow = position.collateral > 0n
    ? (position.collateral * 7500n) / 10000n - position.debt
    : 0n;
  const maxBorrowStr = maxBorrow > 0n ? Number(ethers.formatEther(maxBorrow)).toFixed(4) : "0.0000";
  const debtStr = ethers.formatEther(position.debt);
  const collStr = Number(ethers.formatEther(position.collateral)).toFixed(4);

  const ltv = position.collateral > 0n
    ? ((Number(position.debt) / Number(position.collateral)) * 100).toFixed(1)
    : "0.0";

  const handleBorrow = async e => {
    e.preventDefault();
    try {
      setLoading("borrow");
      setError(null);
      setSuccess(null);
      if (!borrowAmount.trim()) throw new Error("Enter an amount");
      const parsed = ethers.parseEther(borrowAmount.trim());
      const tx = await getLendingContract(requireSigner()).borrow(parsed);
      await tx.wait();
      setSuccess("Borrow successful!");
      setBorrowAmount("");
    } catch (err) {
      setError(err.message || "Borrow failed");
    } finally {
      setLoading(null);
    }
  };

  const handleRepay = async e => {
    e.preventDefault();
    try {
      setLoading("repay");
      setError(null);
      setSuccess(null);
      if (!repayAmount.trim()) throw new Error("Enter an amount");
      const parsed = ethers.parseEther(repayAmount.trim());
      const tx = await getLendingContract(requireSigner()).repay({ value: parsed });
      await tx.wait();
      setSuccess("Repay successful!");
      setRepayAmount("");
    } catch (err) {
      setError(err.message || "Repay failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100">Borrow & Repay</h1>
        <p className="text-sm text-slate-500 mt-1">Borrow up to 75% of your collateral. Maintain a health factor above 1.0 to avoid liquidation.</p>
      </div>

      {/* Current position summary */}
      <div className="glass-panel grid grid-cols-3 divide-x divide-slate-800/60 rounded-2xl overflow-hidden">
        {[
          { label: "Your Collateral", value: `${collStr} ETH`, color: "text-cyan-400" },
          { label: "Current LTV", value: `${ltv}%`, color: Number(ltv) > 75 ? "text-red-400" : Number(ltv) > 60 ? "text-amber-400" : "text-emerald-400" },
          { label: "Max Borrowable", value: `${maxBorrowStr} ETH`, color: "text-indigo-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col gap-1 p-5 text-center">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</div>
            <div className={`text-xl font-bold font-mono ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Borrow */}
        <div className="glass-panel flex flex-col gap-5 p-7">
          <div className="h-1 w-12 rounded-full" style={{ background: "linear-gradient(to right, #818cf8, #a78bfa)" }} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="font-bold text-slate-100">Borrow ETH</div>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Borrow against your deposited ETH collateral. Keep your health factor above 1.3 for safety.
            </p>
          </div>
          <form onSubmit={handleBorrow} className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-400">Amount (ETH)</label>
                <button
                  type="button"
                  className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 transition-colors"
                  onClick={() => setBorrowAmount(maxBorrowStr)}
                >
                  Max: {maxBorrowStr} ETH
                </button>
              </div>
              <input
                className="input"
                type="number"
                min="0"
                step="0.0001"
                value={borrowAmount}
                onChange={e => setBorrowAmount(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full justify-center"
              disabled={loading === "borrow"}
            >
              {loading === "borrow" ? (
                <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Borrowing...</>
              ) : "Borrow ETH"}
            </button>
          </form>
        </div>

        {/* Repay */}
        <div className="glass-panel flex flex-col gap-5 p-7">
          <div className="h-1 w-12 rounded-full" style={{ background: "linear-gradient(to right, #34d399, #22d3ee)" }} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="font-bold text-slate-100">Repay ETH</div>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Repay your outstanding borrow to improve your health factor and free up collateral.
            </p>
          </div>
          <form onSubmit={handleRepay} className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-400">Amount (ETH)</label>
                <button
                  type="button"
                  className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
                  onClick={() => setRepayAmount(debtStr)}
                >
                  Debt: {Number(debtStr).toFixed(4)} ETH
                </button>
              </div>
              <input
                className="input"
                type="number"
                min="0"
                step="0.0001"
                value={repayAmount}
                onChange={e => setRepayAmount(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <button
              type="submit"
              className="btn-secondary w-full justify-center"
              disabled={loading === "repay"}
            >
              {loading === "repay" ? (
                <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" /> Repaying...</>
              ) : "Repay ETH"}
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <ErrorBanner message={error} />
        <SuccessBanner message={success} />
        {loading && <Loading label="Waiting for on-chain confirmation..." />}
      </div>
    </div>
  );
}
