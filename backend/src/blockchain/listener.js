const { ethers } = require("ethers");

const {
  Deposit,
  Borrow,
  Repay,
  Liquidation,
  Stake,
  Unstake,
  Reward
} = require("../models/EventModels");

const { UserPosition } = require("../models/UserPosition");

const lendingArtifact = require("../abi/LendingPool.json");
const stakingArtifact = require("../abi/Staking.json");

const lendingAbi = lendingArtifact.abi;
const stakingAbi = stakingArtifact.abi;

function toHexAddress(addr) {
  return ethers.getAddress(addr);
}

async function updateUserPositionFromChain(userAddress, lendingContract, stakingContract) {
  const [collateral, debt, healthFactor, staked, earned] = await Promise.all([
    lendingContract.collateralOf(userAddress),
    lendingContract.debtOf(userAddress),
    lendingContract.getHealthFactor(userAddress),
    stakingContract.balances(userAddress),
    stakingContract.earned(userAddress)
  ]);

  const address = toHexAddress(userAddress);

  const data = {
    address,
    totalCollateralWei: collateral.toString(),
    totalDebtWei: debt.toString(),
    totalStakedWei: staked.toString(),
    pendingRewardsWei: earned.toString(),
    healthFactor: healthFactor.toString(),
    lastUpdated: new Date()
  };

  await UserPosition.findOneAndUpdate({ address }, data, {
    upsert: true,
    new: true
  });
}

async function startBlockchainListener() {
  const {
    RPC_URL,
    LENDING_POOL_ADDRESS,
    STAKING_ADDRESS
  } = process.env;

  if (!RPC_URL) {
    throw new Error("RPC_URL not set");
  }

  if (!LENDING_POOL_ADDRESS || !STAKING_ADDRESS) {
    throw new Error("Contract addresses not set");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const lending = new ethers.Contract(
    LENDING_POOL_ADDRESS,
    lendingAbi,
    provider
  );

  const staking = new ethers.Contract(
    STAKING_ADDRESS,
    stakingAbi,
    provider
  );

  console.log(`Blockchain listener connected to ${RPC_URL}`);

  lending.on("Deposited", async (user, amount, event) => {
    const doc = new Deposit({
      txHash: event.log.transactionHash,
      blockNumber: event.log.blockNumber,
      logIndex: event.log.index,
      user: toHexAddress(user),
      amount: amount.toString(),
      timestamp: new Date()
    });

    await doc.save();
    await updateUserPositionFromChain(user, lending, staking);
  });

  lending.on("Withdrawn", async (user, amount, event) => {
    const doc = new Deposit({
      txHash: event.log.transactionHash,
      blockNumber: event.log.blockNumber,
      logIndex: event.log.index,
      user: toHexAddress(user),
      amount: "-" + amount.toString(),
      timestamp: new Date()
    });

    await doc.save();
    await updateUserPositionFromChain(user, lending, staking);
  });

  lending.on("Borrowed", async (user, amount, event) => {
    const doc = new Borrow({
      txHash: event.log.transactionHash,
      blockNumber: event.log.blockNumber,
      logIndex: event.log.index,
      user: toHexAddress(user),
      amount: amount.toString(),
      timestamp: new Date()
    });

    await doc.save();
    await updateUserPositionFromChain(user, lending, staking);
  });

  lending.on("Repaid", async (user, amount, event) => {
    const doc = new Repay({
      txHash: event.log.transactionHash,
      blockNumber: event.log.blockNumber,
      logIndex: event.log.index,
      user: toHexAddress(user),
      amount: amount.toString(),
      timestamp: new Date()
    });

    await doc.save();
    await updateUserPositionFromChain(user, lending, staking);
  });

  lending.on("Liquidated", async (liquidator, user, repaidAmount, seizedCollateral, event) => {
    const doc = new Liquidation({
      txHash: event.log.transactionHash,
      blockNumber: event.log.blockNumber,
      logIndex: event.log.index,
      user: toHexAddress(user),
      liquidator: toHexAddress(liquidator),
      repaidAmount: repaidAmount.toString(),
      seizedCollateral: seizedCollateral.toString(),
      timestamp: new Date()
    });

    await doc.save();

    await updateUserPositionFromChain(user, lending, staking);
    await updateUserPositionFromChain(liquidator, lending, staking);
  });

  staking.on("Staked", async (user, amount, event) => {
    const doc = new Stake({
      txHash: event.log.transactionHash,
      blockNumber: event.log.blockNumber,
      logIndex: event.log.index,
      user: toHexAddress(user),
      amount: amount.toString(),
      timestamp: new Date()
    });

    await doc.save();
    await updateUserPositionFromChain(user, lending, staking);
  });

  staking.on("Unstaked", async (user, amount, event) => {
    const doc = new Unstake({
      txHash: event.log.transactionHash,
      blockNumber: event.log.blockNumber,
      logIndex: event.log.index,
      user: toHexAddress(user),
      amount: amount.toString(),
      timestamp: new Date()
    });

    await doc.save();
    await updateUserPositionFromChain(user, lending, staking);
  });

  staking.on("RewardPaid", async (user, reward, event) => {
    const doc = new Reward({
      txHash: event.log.transactionHash,
      blockNumber: event.log.blockNumber,
      logIndex: event.log.index,
      user: toHexAddress(user),
      reward: reward.toString(),
      timestamp: new Date()
    });

    await doc.save();
    await updateUserPositionFromChain(user, lending, staking);
  });
}

module.exports = { startBlockchainListener };
