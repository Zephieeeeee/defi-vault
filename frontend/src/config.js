export const config = {
  backendUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:4000",
  targetChainIdHex: import.meta.env.VITE_CHAIN_ID_HEX || "0x7a69",
  targetChainId: import.meta.env.VITE_CHAIN_ID ? parseInt(import.meta.env.VITE_CHAIN_ID) : 31337,
  lendingPoolAddress: import.meta.env.VITE_LENDING_POOL_ADDRESS,
  stakingAddress: import.meta.env.VITE_STAKING_ADDRESS,
  rewardTokenAddress: import.meta.env.VITE_REWARD_TOKEN_ADDRESS
};

