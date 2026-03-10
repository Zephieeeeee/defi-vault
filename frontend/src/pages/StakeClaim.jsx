import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "../state/WalletContext";
import {
  getRewardTokenContract,
  getStakingContract
} from "../lib/contracts";
import { Loading, ErrorBanner, SuccessBanner } from "../components/Feedback";

export function StakeClaim() {
  const { signer, isOnTargetNetwork } = useWallet();
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dvtBalance, setDvtBalance] = useState("0.0");
  const [stakedBalance, setStakedBalance] = useState("0.0");

  const requireSigner = () => {
    if (!signer) throw new Error("Connect wallet to continue");
    if (!isOnTargetNetwork) throw new Error("Switch to the target network");
    return signer;
  };

  useEffect(() => {
    if (!signer) return;
    const fetchBalances = async () => {
      try {
        const addr = await signer.getAddress();
        const token = getRewardTokenContract(signer);
        const staking = getStakingContract(signer);
        const bal = await token.balanceOf(addr);
        const staked = await staking.stakedOf(addr);
        setDvtBalance(Number(ethers.formatEther(bal)).toFixed(4));
        setStakedBalance(Number(ethers.formatEther(staked)).toFixed(4));
      } catch {}
    };
    fetchBalances();
  }, [signer, success]);

  const handleStake = async e => {
    e.preventDefault();
    try {
      setLoading("stake");
      setError(null);
      setSuccess(null);
      if (!stakeAmount.trim()) throw new Error("Enter an amount");
      const parsed = ethers.parseEther(stakeAmount.trim());
      const s = requireSigner();
      const token = getRewardTokenContract(s);
      const staking = getStakingContract(s);
      const approveTx = await token.approve(await staking.getAddress(), parsed);
      await approveTx.wait();
      const stakeTx = await staking.stake(parsed);
      await stakeTx.wait();
      setSuccess("Stake successful!");
      setStakeAmount("");
    } catch (err) {
      setError(err.message || "Stake failed");
    } finally {
      setLoading(null);
    }
  };

  const handleUnstake = async e => {
    e.preventDefault();
    try {
      setLoading("unstake");
      setError(null);
      setSuccess(null);
      if (!unstakeAmount.trim()) throw new Error("Enter an amount");
      const parsed = ethers.parseEther(unstakeAmount.trim());
      const tx = await getStakingContract(requireSigner()).unstake(parsed);
      await tx.wait();
      setSuccess("Unstake successful!");
      setUnstakeAmount("");
    } catch (err) {
      setError(err.message || "Unstake failed");
    } finally {
      setLoading(null);
    }
  };

  const handleClaim = async () => {
    try {
      setLoading("claim");
      setError(null);
      setSuccess(null);
      const tx = await getStakingContract(requireSigner()).claimRewards();
      await tx.wait();
      setSuccess("Rewards claimed successfully!");
    } catch (err) {
      setError(err.message || "Claim failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100">Stake & Earn</h1>
        <p className="text-sm text-slate-500 mt-1">Stake your DVT reward tokens to earn additional yield over time.</p>
      </div>

      {/* DVT balances summary */}
      <div className="glass-panel grid grid-cols-2 divide-x divide-slate-800/60 rounded-2xl overflow-hidden">
        {[
          { label: "Your DVT Balance", value: `${dvtBalance} DVT`, color: "text-amber-400" },
          { label: "Currently Staked", value: `${stakedBalance} DVT`, color: "text-emerald-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col gap-1 p-5 text-center">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</div>
            <div className={`text-xl font-bold font-mono ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Stake */}
        <div className="glass-panel flex flex-col gap-5 p-7">
          <div className="h-1 w-12 rounded-full" style={{ background: "linear-gradient(to right, #fbbf24, #fb923c)" }} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="font-bold text-slate-100">Stake DVT</div>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">Stake DVT tokens to earn compounding staking rewards.</p>
          </div>
          <form onSubmit={handleStake} className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-400">Amount (DVT)</label>
                <button type="button" className="text-[10px] font-mono text-amber-400" onClick={() => setStakeAmount(dvtBalance)}>
                  Balance: {dvtBalance}
                </button>
              </div>
              <input className="input" type="number" min="0" step="0.0001" value={stakeAmount} onChange={e => setStakeAmount(e.target.value)} placeholder="0.0" />
            </div>
            <button type="submit" className="btn-primary w-full justify-center" disabled={!!loading}>
              {loading === "stake" ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Staking...</> : "Stake DVT"}
            </button>
          </form>
        </div>

        {/* Unstake + Claim */}
        <div className="glass-panel flex flex-col gap-5 p-7">
          <div className="h-1 w-12 rounded-full" style={{ background: "linear-gradient(to right, #4ade80, #34d399)" }} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="font-bold text-slate-100">Unstake & Claim</div>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">Unstake DVT or claim rewards without changing your staked balance.</p>
          </div>
          <form onSubmit={handleUnstake} className="flex flex-col gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-400">Amount (DVT)</label>
                <button type="button" className="text-[10px] font-mono text-emerald-400" onClick={() => setUnstakeAmount(stakedBalance)}>
                  Staked: {stakedBalance}
                </button>
              </div>
              <input className="input" type="number" min="0" step="0.0001" value={unstakeAmount} onChange={e => setUnstakeAmount(e.target.value)} placeholder="0.0" />
            </div>
            <button type="submit" className="btn-secondary w-full justify-center" disabled={!!loading}>
              {loading === "unstake" ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" /> Unstaking...</> : "Unstake DVT"}
            </button>
          </form>
          <div className="border-t border-slate-800/60 pt-4">
            <button
              type="button"
              onClick={handleClaim}
              className="btn-primary w-full justify-center"
              disabled={!!loading}
            >
              {loading === "claim" ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Claiming...</> : "Claim Rewards"}
            </button>
          </div>
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
