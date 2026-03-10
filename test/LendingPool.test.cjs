const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LendingPool", function () {
  let lendingPool;
  let owner;
  let user;
  let liquidator;

  beforeEach(async function () {
    [owner, user, liquidator] = await ethers.getSigners();

    const LendingPool = await ethers.getContractFactory("LendingPool");
    lendingPool = await LendingPool.deploy();
    await lendingPool.waitForDeployment();
  });

  it("allows deposit and updates state", async function () {
    const amount = ethers.parseEther("1");

    await expect(
      lendingPool.connect(user).deposit({ value: amount })
    ).to.emit(lendingPool, "Deposited");

    const collateral = await lendingPool.collateralOf(user.address);
    expect(collateral).to.equal(amount);

    const totalDeposits = await lendingPool.totalDeposits();
    expect(totalDeposits).to.equal(amount);
  });

  it("allows borrow within collateral factor", async function () {
    const depositAmount = ethers.parseEther("1");
    await lendingPool.connect(user).deposit({ value: depositAmount });

    const borrowAmount = ethers.parseEther("0.7");

    await expect(
      lendingPool.connect(user).borrow(borrowAmount)
    ).to.emit(lendingPool, "Borrowed");

    const debt = await lendingPool.debtOf(user.address);
    expect(debt).to.equal(borrowAmount);
  });

  it("prevents over-borrowing", async function () {
    const depositAmount = ethers.parseEther("1");
    await lendingPool.connect(user).deposit({ value: depositAmount });

    const borrowAmount = ethers.parseEther("0.8");

    await expect(
      lendingPool.connect(user).borrow(borrowAmount)
    ).to.be.revertedWith("Exceeds max borrow");
  });

  it("allows repay and reduces debt", async function () {
    const depositAmount = ethers.parseEther("1");
    await lendingPool.connect(user).deposit({ value: depositAmount });

    const borrowAmount = ethers.parseEther("0.5");
    await lendingPool.connect(user).borrow(borrowAmount);

    await expect(
      lendingPool.connect(user).repay({ value: borrowAmount })
    ).to.emit(lendingPool, "Repaid");

    const debt = await lendingPool.debtOf(user.address);
    expect(debt).to.equal(0n);
  });

  it("prevents liquidation when position is healthy", async function () {
    const depositAmount = ethers.parseEther("1");
    await lendingPool.connect(user).deposit({ value: depositAmount });

    const borrowAmount = ethers.parseEther("0.75");
    await lendingPool.connect(user).borrow(borrowAmount);

    const healthFactor = await lendingPool.getHealthFactor(user.address);
    expect(healthFactor).to.be.gte(ethers.parseEther("1"));

    await expect(
      lendingPool
        .connect(liquidator)
        .liquidate(user.address, { value: borrowAmount })
    ).to.be.revertedWith("Health factor >= 1");
  });
});