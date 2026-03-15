const express = require("express");
const router = express.Router();

router.get("/stats", async (req, res) => {
  try {

    // Demo data so frontend works
    res.json({
      tvl: "1250000",
      totalDeposits: "850000",
      totalBorrowed: "400000",
      totalStaked: "150000",
      activeUsers: 24,
      healthFactor: "1.8"
    });

  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch protocol stats"
    });
  }
});

module.exports = router;
