const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts locally with account:", deployer.address);

  const RewardToken = await hre.ethers.getContractFactory("RewardToken");
  const rewardToken = await RewardToken.deploy();
  await rewardToken.waitForDeployment();
  const rewardTokenAddress = await rewardToken.getAddress();
  console.log("RewardToken deployed to:", rewardTokenAddress);

  const LendingPool = await hre.ethers.getContractFactory("LendingPool");
  const lendingPool = await LendingPool.deploy();
  await lendingPool.waitForDeployment();
  const lendingPoolAddress = await lendingPool.getAddress();
  console.log("LendingPool deployed to:", lendingPoolAddress);

  const Staking = await hre.ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(rewardTokenAddress, rewardTokenAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("Staking deployed to:", stakingAddress);

  const initialRewards = hre.ethers.parseEther("1000000");
  const tx = await rewardToken.mint(stakingAddress, initialRewards);
  await tx.wait();
  console.log("Funded Staking with initial rewards:", initialRewards.toString());

  const frontendEnvContent = `VITE_BACKEND_URL=http://localhost:4000
VITE_CHAIN_ID=31337
VITE_CHAIN_ID_HEX=0x7a69
VITE_LENDING_POOL_ADDRESS=${lendingPoolAddress}
VITE_STAKING_ADDRESS=${stakingAddress}
VITE_REWARD_TOKEN_ADDRESS=${rewardTokenAddress}
`;

  const backendEnvContent = `PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/defivault
RPC_URL=http://127.0.0.1:8545
LENDING_POOL_ADDRESS=${lendingPoolAddress}
STAKING_ADDRESS=${stakingAddress}
REWARD_TOKEN_ADDRESS=${rewardTokenAddress}
`;

  fs.writeFileSync(path.join(__dirname, "..", "frontend", ".env"), frontendEnvContent);
  console.log("Wrote frontend/.env");

  fs.writeFileSync(path.join(__dirname, "..", "backend", ".env"), backendEnvContent);
  console.log("Wrote backend/.env");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
