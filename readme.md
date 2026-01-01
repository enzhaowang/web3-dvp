# Web3 DvP

A minimal **Delivery vs. Payment (DvP)** Web3 demo application.

- **Buyer** pays stablecoin (**USDX**) to the **Broker**
- **Seller** delivers stock token (**MyStock**) to the **Broker**
- **Broker** executes settlement by exchanging assets on-chain

**Tech Stack**
- Smart Contracts: Foundry (Solidity)
- Frontend: React (Vite) + wagmi + viem
- Backend: Node.js + Express + MongoDB
- Deployment: Docker + Google Cloud Run

---

## Routes
- `/buyer` – Buyer creates a deal and sends USDX  
- `/seller` – Seller accepts/rejects deals and sends MyStock  
- `/broker` – Broker verifies funds and executes settlement  

---

## How to Run (Local)

### 1. Deploy contracts
```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge script script/Deploy.s.sol:Deploy --rpc-url $RPC_URL --broadcast
```

Save the deployed contract addresses:
- `USDX`
- `MyStock`

---

### 2. Configure environment
Create `.env` in the **repo root**:
```env
RPC_URL=YOUR_SEPOLIA_RPC
CHAIN_ID=11155111

BROKER_ADDRESS=0xBroker
SELLER_ADDRESS=0xSeller

USDX_ADDRESS=0xUSDX
MYSTOCK_ADDRESS=0xMyStock

PRICE_USDX_PER_STOCK=10
EXPLORER_TX_BASE=https://sepolia.etherscan.io/tx/
```

---

### 3. Run backend (Express)
```bash
cd backend
npm install
npm run dev
```

Backend runs at:
```
http://localhost:8080
```

---

### 4. Run frontend (React)
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:
```
http://localhost:5173
```

---

### 5. Open the app
- Buyer: `http://localhost:5173/buyer`
- Seller: `http://localhost:5173/seller`
- Broker: `http://localhost:5173/broker`

---

## Demo Flow
1. Buyer creates a deal and transfers **USDX → Broker**
2. Seller accepts the deal and transfers **MyStock → Broker**
3. Broker executes settlement:
   - **MyStock → Buyer**
   - **USDX → Seller**
4. Deal is finalized with 4 on-chain transaction links

---

## Notes
- Fake login is used for demo purposes
- Backend verifies ERC20 transfers by decoding on-chain receipt logs
- Token price is defined in Web2 config (no oracle)
- This project is for interview/demo use, not production
