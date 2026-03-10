const express = require("express");
const { ethers } = require("ethers");
const { UserPosition } = require("../models/UserPosition");

const router = express.Router();

router.get("/:address/positions", async (req, res) => {
  try {
    const { address } = req.params;
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid address" });
    }

    const normalized = ethers.getAddress(address);
    const position = await UserPosition.findOne({ address: normalized }).lean();

    if (!position) {
      return res.json({
        address: normalized,
        totalCollateralWei: "0",
        totalDebtWei: "0",
        totalStakedWei: "0",
        pendingRewardsWei: "0",
        healthFactor: "0"
      });
    }

    res.json(position);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user position" });
  }
});

module.exports = router;

