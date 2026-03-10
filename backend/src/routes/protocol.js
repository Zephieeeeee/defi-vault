const express = require("express");
const { ethers } = require("ethers");
const { UserPosition } = require("../models/UserPosition");

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const { LENDING_POOL_ADDRESS, RPC_URL } = process.env;
    if (!LENDING_POOL_ADDRESS || !RPC_URL) {
      return res.status(500).json({ error: "Contracts or provider not configured" });
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const lendingAbi = require("../../../artifacts/contracts/LendingPool.sol/LendingPool.json").abi;
    const lending = new ethers.Contract(LENDING_POOL_ADDRESS, lendingAbi, provider);

    const [totalDeposits, totalBorrowed, userCount] = await Promise.all([
      lending.totalDeposits(),
      lending.totalBorrowed(),
      UserPosition.countDocuments()
    ]);

    const tvlEth = ethers.formatEther(totalDeposits - totalBorrowed);

    res.json({
      totalDepositsWei: totalDeposits.toString(),
      totalBorrowedWei: totalBorrowed.toString(),
      tvlEth,
      userCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch protocol stats" });
  }
});

router.get("/tvl", async (req, res) => {
  try {
    const { LENDING_POOL_ADDRESS, RPC_URL } = process.env;
    if (!LENDING_POOL_ADDRESS || !RPC_URL) {
      return res.status(500).json({ error: "Contracts or provider not configured" });
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const lendingAbi = require("../../../artifacts/contracts/LendingPool.sol/LendingPool.json").abi;
    const lending = new ethers.Contract(LENDING_POOL_ADDRESS, lendingAbi, provider);

    const [totalDeposits, totalBorrowed] = await Promise.all([
      lending.totalDeposits(),
      lending.totalBorrowed()
    ]);

    const tvlEth = ethers.formatEther(totalDeposits - totalBorrowed);

    res.json({
      totalDepositsWei: totalDeposits.toString(),
      totalBorrowedWei: totalBorrowed.toString(),
      tvlEth
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch TVL" });
  }
});

module.exports = router;

