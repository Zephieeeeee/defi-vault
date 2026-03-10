import { ethers } from "ethers";
import { config } from "../config";
import lendingAbi from "../abi/lendingPool.json";
import stakingAbi from "../abi/staking.json";
import rewardTokenAbi from "../abi/rewardToken.json";

export function getLendingContract(signerOrProvider) {
  return new ethers.Contract(config.lendingPoolAddress, lendingAbi, signerOrProvider);
}

export function getStakingContract(signerOrProvider) {
  return new ethers.Contract(config.stakingAddress, stakingAbi, signerOrProvider);
}

export function getRewardTokenContract(signerOrProvider) {
  return new ethers.Contract(config.rewardTokenAddress, rewardTokenAbi, signerOrProvider);
}

