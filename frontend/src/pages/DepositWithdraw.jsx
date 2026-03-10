import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "../state/WalletContext";
import { getLendingContract } from "../lib/contracts";
import { Loading, ErrorBanner, SuccessBanner } from "../components/Feedback";

function FormCard({ title, desc, onSubmit, amount, setAmount, loading, action, accent, label1, label2, hint }) {
  const accentStyles = {
    cyan: { bar: "from-cyan-400 to-blue-500", btn: "btn-primary" },
    slate: { bar: "from-slate-500 to-slate-600", btn: "btn-secondary" },
  };
  const s = accentStyles[accent] ?? accentStyles.cyan;

  return (
    <div className="glass-panel flex flex-col gap-5 p-7">
      <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${s.bar}`} />
      <div>
        <div className="font-bold text-slate-100 mb-1">{title}</div>
        <p className="text-xs leading-relaxed text-slate-500">{desc}</p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-400">{label1 || "Amount (ETH)"}</label>
            {hint && <span className="text-[10px] font-mono text-cyan-400">{hint}</span>}
          </div>
          <input
            className="input"
            type="number"
            min="0"
            step="0.0001"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.0"
          />
        </div>
        <button type="submit" className={`${s.btn} w-full justify-center`} disabled={!!loading}>
          {loading ? (
            <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />{loading}</>
          ) : (label2 || "Submit")}
        </button>
      </form>
    </div>
  );
}

export function DepositWithdraw() {
  const { signer, isOnTargetNetwork } = useWallet();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [collateral, setCollateral] = useState("0.0000");

  useEffect(() => {
    if (!signer) return;
    const fetch = async () => {
      try {
        const contract = getLendingContract(signer);
        const addr = await signer.getAddress();
        const c = await contract.collateralOf(addr);
        setCollateral(ethers.formatEther(c));
      } catch {}
    };
    fetch();
  }, [signer, success]);

  const requireSigner = () => {
    if (!signer) throw new Error("Connect wallet to continue");
    if (!isOnTargetNetwork) throw new Error("Switch to the target network");
    return signer;
  };

  const handle = async (action, amount, fn) => {
    try {
      setLoading(action);
      setError(null);
      setSuccess(null);
      if (!amount.trim()) throw new Error("Enter an amount");
      await fn(requireSigner(), ethers.parseEther(amount.trim()));
      setSuccess(`${action} successful!`);
    } catch (err) {
      setError(err.message || `${action} failed`);
    } finally {
      setLoading(null);
    }
  };

  const handleDeposit = e => {
    e.preventDefault();
    handle("Deposit", depositAmount, async (s, parsed) => {
      const tx = await getLendingContract(s).deposit({ value: parsed });
      await tx.wait();
      setDepositAmount("");
    });
  };

  const handleWithdraw = e => {
    e.preventDefault();
    handle("Withdraw", withdrawAmount, async (s, parsed) => {
      const tx = await getLendingContract(s).withdraw(parsed);
      await tx.wait();
      setWithdrawAmount("");
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100">Deposit & Withdraw</h1>
        <p className="text-sm text-slate-500 mt-1">Your current collateral: <span className="font-mono text-cyan-400">{collateral} ETH</span></p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <FormCard
          title="Deposit ETH"
          desc="Add ETH as collateral to earn 8% APY and unlock up to 75% borrowing power."
          onSubmit={handleDeposit}
          amount={depositAmount}
          setAmount={setDepositAmount}
          loading={loading === "Deposit" ? "Depositing..." : null}
          accent="cyan"
          label1="Amount (ETH)"
          label2="Deposit ETH"
        />
        <FormCard
          title="Withdraw ETH"
          desc="Withdraw collateral while maintaining a safe health factor above 1.0."
          onSubmit={handleWithdraw}
          amount={withdrawAmount}
          setAmount={setWithdrawAmount}
          loading={loading === "Withdraw" ? "Withdrawing..." : null}
          accent="slate"
          label1="Amount (ETH)"
          label2="Withdraw ETH"
          hint={`Available: ${collateral} ETH`}
        />
      </div>
      <div className="flex flex-col gap-2">
        <ErrorBanner message={error} />
        <SuccessBanner message={success} />
        {loading && <Loading label="Waiting for on-chain confirmation..." />}
      </div>
    </div>
  );
}
