const mongoose = require("mongoose");

const UserPositionSchema = new mongoose.Schema(
  {
    address: { type: String, required: true, unique: true, index: true },
    totalCollateralWei: { type: String, required: true, default: "0" },
    totalDebtWei: { type: String, required: true, default: "0" },
    totalStakedWei: { type: String, required: true, default: "0" },
    pendingRewardsWei: { type: String, required: true, default: "0" },
    healthFactor: { type: String, required: true, default: "0" },
    lastUpdated: { type: Date, required: true, default: Date.now }
  },
  { timestamps: true }
);

const UserPosition = mongoose.model("UserPosition", UserPositionSchema);

module.exports = { UserPosition };

