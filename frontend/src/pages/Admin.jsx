import React, { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../state/WalletContext";
import {
  getLendingContract,
  getStakingContract
} from "../lib/contracts";
import { Loading, ErrorBanner } from "../components/Feedback";

export function Admin() {
  const { signer, isOnTargetNetwork, address } = useWallet();
  const [rewardRate, setRewardRate] = useState("");
  const [loadingAction, setLoadingAction] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const requireSigner = () => {
    if (!signer) {
      throw new Error("Connect wallet to continue");
    }
    if (!isOnTargetNetwork) {
      throw new Error("Switch to the target network");
    }
    return signer;
  };

  const handlePauseLending = async paused => {
    try {
      setLoadingAction("lending");
      setError(null);
      setSuccess(null);
      const contract = getLendingContract(requireSigner());
      const tx = await (paused ? contract.pause() : contract.unpause());
      await tx.wait();
      setSuccess("Lending pool updated");
    } catch (err) {
      setError(err.message || "Action failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePauseStaking = async paused => {
    try {
      setLoadingAction("staking");
      setError(null);
      setSuccess(null);
      const contract = getStakingContract(requireSigner());
      const tx = await (paused ? contract.pause() : contract.unpause());
      await tx.wait();
      setSuccess("Staking updated");
    } catch (err) {
      setError(err.message || "Action failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUpdateRewardRate = async e => {
    e.preventDefault();
    try {
      setLoadingAction("rate");
      setError(null);
      setSuccess(null);
      const value = rewardRate.trim();
      if (!value) {
        throw new Error("Enter a reward rate");
      }
      const perSecond = ethers.parseEther(value);
      const contract = getStakingContract(requireSigner());
      const tx = await contract.setRewardRate(perSecond);
      await tx.wait();
      setSuccess("Reward rate updated");
      setRewardRate("");
    } catch (err) {
      setError(err.message || "Action failed");
    } finally {
      setLoadingAction(null);
    }
  };

  if (!address) {
    return (
      <div className="glass-panel flex flex-col gap-3 p-6">
        <div className="text-lg font-semibold text-slate-50">
          Connect as admin
        </div>
        <p className="text-sm text-slate-400">
          Connect the protocol owner wallet to manage pause state and reward parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel flex flex-col gap-2 p-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Admin controls
        </div>
        <p className="text-xs text-slate-400">
          These actions are restricted on-chain to the contract owner.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="glass-panel flex flex-col gap-3 p-5">
          <div className="text-sm font-semibold text-slate-100">
            Lending pool
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handlePauseLending(true)}
              className="btn-secondary"
              disabled={loadingAction === "lending"}
            >
              Pause
            </button>
            <button
              type="button"
              onClick={() => handlePauseLending(false)}
              className="btn-primary"
              disabled={loadingAction === "lending"}
            >
              Unpause
            </button>
          </div>
        </div>

        <div className="glass-panel flex flex-col gap-3 p-5">
          <div className="text-sm font-semibold text-slate-100">
            Staking
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handlePauseStaking(true)}
              className="btn-secondary"
              disabled={loadingAction === "staking"}
            >
              Pause
            </button>
            <button
              type="button"
              onClick={() => handlePauseStaking(false)}
              className="btn-primary"
              disabled={loadingAction === "staking"}
            >
              Unpause
            </button>
          </div>
        </div>

        <div className="glass-panel flex flex-col gap-3 p-5">
          <div className="text-sm font-semibold text-slate-100">
            Reward emission
          </div>
          <form onSubmit={handleUpdateRewardRate} className="flex flex-col gap-3">
            <label className="text-xs text-slate-300">
              Reward rate (DVT per second)
              <input
                className="input mt-1"
                type="number"
                min="0"
                step="0.0001"
                value={rewardRate}
                onChange={e => setRewardRate(e.target.value)}
                placeholder="0.1"
              />
            </label>
            <button
              type="submit"
              className="btn-primary"
              disabled={loadingAction === "rate"}
            >
              {loadingAction === "rate" ? "Updating..." : "Update rate"}
            </button>
          </form>
        </div>
      </div>

      <ErrorBanner message={error} />
      {loadingAction && <Loading label="Submitting admin transaction..." />}
      {success && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-2 text-xs text-emerald-200">
          {success}
        </div>
      )}
    </div>
  );
}

