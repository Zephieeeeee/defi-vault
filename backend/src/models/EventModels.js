const mongoose = require("mongoose");

const commonEventFields = {
  txHash: { type: String, required: true, index: true },
  blockNumber: { type: Number, required: true, index: true },
  logIndex: { type: Number, required: true },
  user: { type: String, required: true, index: true },
  timestamp: { type: Date, required: true, index: true }
};

const DepositSchema = new mongoose.Schema(
  {
    ...commonEventFields,
    amount: { type: String, required: true }
  },
  { timestamps: true }
);

const BorrowSchema = new mongoose.Schema(
  {
    ...commonEventFields,
    amount: { type: String, required: true }
  },
  { timestamps: true }
);

const RepaySchema = new mongoose.Schema(
  {
    ...commonEventFields,
    amount: { type: String, required: true }
  },
  { timestamps: true }
);

const LiquidationSchema = new mongoose.Schema(
  {
    ...commonEventFields,
    liquidator: { type: String, required: true, index: true },
    repaidAmount: { type: String, required: true },
    seizedCollateral: { type: String, required: true }
  },
  { timestamps: true }
);

const StakeSchema = new mongoose.Schema(
  {
    ...commonEventFields,
    amount: { type: String, required: true }
  },
  { timestamps: true }
);

const UnstakeSchema = new mongoose.Schema(
  {
    ...commonEventFields,
    amount: { type: String, required: true }
  },
  { timestamps: true }
);

const RewardSchema = new mongoose.Schema(
  {
    ...commonEventFields,
    reward: { type: String, required: true }
  },
  { timestamps: true }
);

const Deposit = mongoose.model("Deposit", DepositSchema);
const Borrow = mongoose.model("Borrow", BorrowSchema);
const Repay = mongoose.model("Repay", RepaySchema);
const Liquidation = mongoose.model("Liquidation", LiquidationSchema);
const Stake = mongoose.model("Stake", StakeSchema);
const Unstake = mongoose.model("Unstake", UnstakeSchema);
const Reward = mongoose.model("Reward", RewardSchema);

module.exports = {
  Deposit,
  Borrow,
  Repay,
  Liquidation,
  Stake,
  Unstake,
  Reward
};

