// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract LendingPool is ReentrancyGuard, Ownable, Pausable {

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);
    event Liquidated(address indexed liquidator, address indexed user, uint256 repaidAmount, uint256 seizedCollateral);

    uint256 public totalDeposits;
    uint256 public totalBorrowed;

    mapping(address => uint256) public collateralOf;
    mapping(address => uint256) public debtOf;

    uint256 public constant COLLATERAL_FACTOR_BPS = 7500;
    uint256 public constant LIQUIDATION_THRESHOLD_BPS = 8000;
    uint256 public constant BPS_DIVISOR = 10_000;

    constructor() {}

    function deposit() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Deposit must be > 0");

        collateralOf[msg.sender] += msg.value;
        totalDeposits += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be > 0");

        uint256 userCollateral = collateralOf[msg.sender];
        require(userCollateral >= amount, "Insufficient collateral");

        collateralOf[msg.sender] = userCollateral - amount;
        totalDeposits -= amount;

        require(_healthFactor(msg.sender) >= 1e18, "Health factor too low");

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    function borrow(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be > 0");
        require(address(this).balance >= amount, "Insufficient pool liquidity");

        uint256 userCollateral = collateralOf[msg.sender];
        require(userCollateral > 0, "No collateral");

        uint256 newDebt = debtOf[msg.sender] + amount;
        uint256 maxDebt = (userCollateral * COLLATERAL_FACTOR_BPS) / BPS_DIVISOR;
        require(newDebt <= maxDebt, "Exceeds max borrow");

        debtOf[msg.sender] = newDebt;
        totalBorrowed += amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");

        emit Borrowed(msg.sender, amount);
    }

    function repay() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Repay amount must be > 0");

        uint256 userDebt = debtOf[msg.sender];
        require(userDebt > 0, "No debt");

        uint256 repayAmount = msg.value;

        if (repayAmount > userDebt) {
            uint256 refund = repayAmount - userDebt;
            repayAmount = userDebt;

            (bool refundSuccess, ) = msg.sender.call{value: refund}("");
            require(refundSuccess, "Refund failed");
        }

        debtOf[msg.sender] = userDebt - repayAmount;
        totalBorrowed -= repayAmount;

        emit Repaid(msg.sender, repayAmount);
    }

    function liquidate(address user) external payable nonReentrant whenNotPaused {
        require(user != address(0), "Invalid user");

        uint256 userDebt = debtOf[user];
        require(userDebt > 0, "User has no debt");

        uint256 hf = _healthFactor(user);
        require(hf < 1e18, "Health factor >= 1");

        uint256 userCollateral = collateralOf[user];
        require(userCollateral > 0, "No collateral to seize");

        uint256 repayAmount = userDebt;

        require(msg.value == repayAmount, "Incorrect repay amount");

        debtOf[user] = 0;
        collateralOf[user] = 0;

        totalBorrowed -= repayAmount;
        totalDeposits -= userCollateral;

        (bool success, ) = msg.sender.call{value: userCollateral}("");
        require(success, "Collateral transfer failed");

        emit Liquidated(msg.sender, user, repayAmount, userCollateral);
    }

    function getHealthFactor(address user) external view returns (uint256) {
        return _healthFactor(user);
    }

    function _healthFactor(address user) internal view returns (uint256) {
        uint256 debt = debtOf[user];

        if (debt == 0) {
            return type(uint256).max;
        }

        uint256 collateral = collateralOf[user];

        return (collateral * LIQUIDATION_THRESHOLD_BPS * 1e18) /
            (debt * BPS_DIVISOR);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    receive() external payable {}
}