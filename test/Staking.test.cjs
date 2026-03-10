const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking", function () {
  let rewardToken;
  let staking;
  let owner;
  let user;
  let stakingAddress;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const RewardToken = await ethers.getContractFactory("RewardToken");
    rewardToken = await RewardToken.deploy();
    await rewardToken.waitForDeployment();

    const rewardTokenAddress = await rewardToken.getAddress();

    const Staking = await ethers.getContractFactory("Staking");
    staking = await Staking.deploy(rewardTokenAddress, rewardTokenAddress);
    await staking.waitForDeployment();

    stakingAddress = await staking.getAddress();

    const initialSupply = ethers.parseEther("10000");

    // mint tokens
    await rewardToken.mint(user.address, initialSupply);
    await rewardToken.mint(stakingAddress, initialSupply);

    // approve staking contract
    await rewardToken.connect(user).approve(stakingAddress, initialSupply);

    // set reward rate
    await staking.setRewardRate(ethers.parseEther("1"));
  });

  it("allows staking and updates balances", async function () {
    const amount = ethers.parseEther("100");

    await expect(staking.connect(user).stake(amount))
      .to.emit(staking, "Staked")
      .withArgs(user.address, amount);

    const balance = await staking.balances(user.address);
    expect(balance).to.equal(amount);
  });

  it("accrues rewards over time", async function () {
    const amount = ethers.parseEther("100");

    await staking.connect(user).stake(amount);

    await ethers.provider.send("evm_increaseTime", [10]);
    await ethers.provider.send("evm_mine");

    const earned = await staking.earned(user.address);
    expect(earned).to.be.gt(0n);
  });

  it("allows claimRewards", async function () {
    const amount = ethers.parseEther("100");

    await staking.connect(user).stake(amount);

    await ethers.provider.send("evm_increaseTime", [10]);
    await ethers.provider.send("evm_mine");

    const before = await rewardToken.balanceOf(user.address);

    await expect(staking.connect(user).claimRewards())
      .to.emit(staking, "RewardPaid");

    const after = await rewardToken.balanceOf(user.address);
    expect(after).to.be.gt(before);
  });
});