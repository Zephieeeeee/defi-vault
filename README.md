## DeFiVault

DeFiVault is an ETH-only lending and staking protocol deployed on Sepolia. Users can deposit ETH as collateral, borrow against their positions, and stake the DVT reward token for additional yield. The stack is Hardhat + Solidity on-chain, Node/Express/Mongo for indexing, and Vite/React/Tailwind for the frontend.

### Project layout

- **smart contracts**: `contracts`, `scripts`, `test`, `hardhat.config.js`
- **backend**: `backend/`
- **frontend**: `frontend/`

### Prerequisites

- Node.js 18+
- pnpm or npm
- MongoDB running locally or a hosted Mongo URI
- Sepolia RPC and a funded deployer key

### Environment configuration

Root `.env` (Hardhat):

```bash
SEPOLIA_RPC_URL=your_sepolia_http_rpc
PRIVATE_KEY=your_private_key
```

Backend `.env` (copy from `backend/.env.example`):

```bash
PORT=4000
MONGO_URI=mongodb://localhost:27017/defivault
SEPOLIA_WS_URL=wss_sepolia_rpc_with_ws
LENDING_POOL_ADDRESS=deployed_lending_pool_address
STAKING_ADDRESS=deployed_staking_address
REWARD_TOKEN_ADDRESS=deployed_reward_token_address
```

Frontend `.env` (copy from `frontend/.env.example`):

```bash
VITE_BACKEND_URL=http://localhost:4000
VITE_LENDING_POOL_ADDRESS=deployed_lending_pool_address
VITE_STAKING_ADDRESS=deployed_staking_address
VITE_REWARD_TOKEN_ADDRESS=deployed_reward_token_address
```

### Install dependencies

From the project root:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Smart contracts

Compile:

```bash
cd ..
npx hardhat compile
```

Run tests:

```bash
npx hardhat test
```

Deploy to Sepolia:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Record the deployed addresses and update the backend and frontend `.env` files.

### Backend

Start the indexer and API:

```bash
cd backend
npm run dev
```

The backend connects to Sepolia via a WebSocket provider, listens to all lending and staking events, stores them in MongoDB, and maintains a materialized view of user positions and protocol stats. REST endpoints:

- `GET /api/protocol/stats`
- `GET /api/protocol/tvl`
- `GET /api/user/:address/positions`

### Frontend

Run the Vite dev server:

```bash
cd frontend
npm run dev
```

The app exposes:

- Home: protocol stats (TVL, deposits, borrows, users)
- Dashboard: user collateral, debt, health factor, staking balances
- Deposit/Withdraw: ETH collateral management
- Borrow/Repay: debt management
- Stake/Claim: DVT staking and rewards
- Admin: pause/unpause and reward rate management for the owner

Wallet connectivity is handled via Ethers BrowserProvider and MetaMask, enforcing the Sepolia network and surfacing clear error states and loading indicators for every transaction flow.

### Suggested commit structure

- `feat(contracts): add lending pool and staking`
- `feat(backend): index events and expose api`
- `feat(frontend): add dashboard and transaction flows`
- `chore(config): add env examples and docs`

