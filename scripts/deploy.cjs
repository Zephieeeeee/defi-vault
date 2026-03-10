const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  const RewardToken = await hre.ethers.getContractFactory("RewardToken");
  const rewardToken = await RewardToken.deploy();
  await rewardToken.waitForDeployment();
  console.log("RewardToken deployed to:", await rewardToken.getAddress());

  const LendingPool = await hre.ethers.getContractFactory("LendingPool");
  const lendingPool = await LendingPool.deploy();
  await lendingPool.waitForDeployment();
  console.log("LendingPool deployed to:", await lendingPool.getAddress());

  const Staking = await hre.ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(
    await rewardToken.getAddress(),
    await rewardToken.getAddress()
  );
  await staking.waitForDeployment();
  console.log("Staking deployed to:", await staking.getAddress());

  const initialRewards = hre.ethers.parseEther("1000000");
  const tx = await rewardToken.mint(await staking.getAddress(), initialRewards);
  await tx.wait();
  console.log("Funded Staking with initial rewards:", initialRewards.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

