import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { config } from "../config";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [rawBalance, setRawBalance] = useState("0");

  useEffect(() => {
    if (!window.ethereum) {
      return;
    }

    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts && accounts.length > 0) {
          const ethProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(ethProvider);
          const normalized = ethers.getAddress(accounts[0]);
          setAddress(normalized);
          const nextSigner = await ethProvider.getSigner();
          setSigner(nextSigner);
          const network = await ethProvider.getNetwork();
          setChainId(Number(network.chainId));
          const balance = await ethProvider.getBalance(normalized);
          setRawBalance(ethers.formatEther(balance));
        }
      } catch (e) {
        console.error("Auto-connect failed", e);
      }
    };
    checkConnection();

    const handleAccountsChanged = async accounts => {
      if (accounts.length === 0) {
        setAddress(null);
        setSigner(null);
        setRawBalance("0");
      } else {
        const normalized = ethers.getAddress(accounts[0]);
        setAddress(normalized);
        if (provider) {
          try {
            const nextSigner = await provider.getSigner();
            setSigner(nextSigner);
            const balance = await provider.getBalance(normalized);
            setRawBalance(ethers.formatEther(balance));
          } catch(e) {}
        }
      }
    };
    const handleChainChanged = async () => {
      const network = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(parseInt(network, 16));
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      if (!window.ethereum.removeListener) return;
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [provider]);

  const ensureProvider = () => {
    if (!window.ethereum) {
      throw new Error("MetaMask not detected");
    }
    if (!provider) {
      const next = new ethers.BrowserProvider(window.ethereum);
      setProvider(next);
      return next;
    }
    return provider;
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      const ethProvider = ensureProvider();
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned");
      }
      const normalized = ethers.getAddress(accounts[0]);
      setAddress(normalized);
      const nextSigner = await ethProvider.getSigner();
      setSigner(nextSigner);
      const network = await ethProvider.getNetwork();
      setChainId(Number(network.chainId));
      const balance = await ethProvider.getBalance(normalized);
      setRawBalance(ethers.formatEther(balance));
      if (Number(network.chainId) !== config.targetChainId) {
        await switchNetwork();
      }
    } catch (e) {
      setError(e.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const switchNetwork = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask not detected");
    }
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: config.targetChainIdHex }]
      });
      const ethProvider = ensureProvider();
      const network = await ethProvider.getNetwork();
      setChainId(Number(network.chainId));
    } catch (e) {
      throw new Error("Please switch to the target network in your wallet");
    }
  };

  const value = {
    address,
    chainId,
    provider,
    signer,
    isConnecting,
    error,
    connectWallet,
    switchNetwork,
    isOnTargetNetwork: chainId === config.targetChainId,
    rawBalance
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return ctx;
}

