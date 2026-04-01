# 0GClaw

**We made INFTs wake up on a schedule, buy what they need through x402, and keep working without a human in the loop.**

0G INFTs are currently ownable AI objects — they hold identity, config, ownership, and state — but they're mostly passive. They don't do anything by themselves.

0GClaw changes that by adding two things:

- **Cron** gives INFTs time — a wake-up loop so they can act on a schedule
- **x402** gives INFTs money — a native way to pay for external services and other agent endpoints when they wake up

Together, that turns an INFT from "ownable agent metadata" into "an agent that can actually operate on its own."

```
INFT alone:     a container — owns config, identity, state
INFT + cron:    a container that wakes up
INFT + x402:    a container that can pay
INFT + both:    an autonomous economic agent
```

## The Three Pieces

| Piece | What it does |
|-------|-------------|
| **INFT (ERC-7857)** | Ownership + config + transferability. The agent container |
| **Cron** | Autonomous execution. The agent wakes up on a schedule |
| **x402** | Payment rail. The agent pays for tools, APIs, or other agent endpoints |

That's it. No over-claiming. These three primitives are enough to turn passive INFTs into self-operating agents.

## How It Compares to OpenClaw

OpenClaw-style agents can be wrapped as INFTs and made autonomous with cron + x402. Not "all of OpenClaw lives on an INFT" — but the core pattern of an agent that wakes up, gathers data, reasons, and acts can be captured as a transferable, tradeable INFT.

| | OpenClaw | 0GClaw |
|---|---------|--------|
| Where it runs | Your laptop | 0G decentralized infra |
| How it pays | Raw wallet access (dangerous) | x402 — scoped, auto-pay USDC per API call |
| Transferable | No — dies with your machine | Yes — sell as INFT, buyer gets full agent |
| Verifiable | No | Yes — results on 0G Storage |
| Security | 280+ CVEs, wallet drain risk | Encrypted intelligence (ERC-7857), scoped x402 payments |
| Scheduling | Manual or local scripts | Built-in cron config, stored in INFT metadata |

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                          0GClaw                              │
│                                                              │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────────┐   │
│  │  ERC-7857   │    │  0G Storage  │    │  0G Compute    │   │
│  │  INFT       │    │              │    │                │   │
│  │  Contract   │◄──►│  Agent       │    │  AI Inference  │   │
│  │             │    │  Configs     │    │                │   │
│  │  - mint()   │    │  Results     │    │                │   │
│  │  - transfer │    │  History     │    └───────┬────────┘   │
│  │  - authz    │    └──────┬───────┘            │            │
│  └──────┬──────┘           │                    │            │
│         │                  │                    │            │
│  ┌──────┴──────────────────┴────────────────────┴─────────┐  │
│  │                  Cron Executor                         │  │
│  │                                                       │  │
│  │  On each tick:                                        │  │
│  │  1. Read agent config from INFT (0G Storage)          │  │
│  │  2. x402/fetch calls paid APIs (auto-pay USDC)        │  │
│  │  3. 0G Compute runs inference                         │  │
│  │  4. Store results to 0G Storage                       │  │
│  │  5. Interact with other 0GClaw agents on-chain        │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │              x402 Payment Layer                        │  │
│  │                                                       │  │
│  │  Each agent has its own USDC wallet                   │  │
│  │  HTTP request → server returns 402 → agent auto-pays  │  │
│  │  → server delivers data → agent continues             │  │
│  │                                                       │  │
│  │  Like a credit card for your AI agent.                │  │
│  │  No API keys. No subscriptions. Just pay-per-call.    │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## x402 — Giving INFTs Money

x402 turns HTTP 402 ("Payment Required") into a payment protocol. When an agent fetches a paid endpoint, the server responds with a price, the agent auto-signs a USDC payment, and the server delivers the data. One HTTP round-trip.

```
Agent wants market data
  → fetch("https://paid-api.com/data")
  → server responds: "402 — pay $0.001 USDC"
  → @x402/fetch auto-signs payment from agent wallet
  → server gets paid, delivers data
  → agent continues
```

```typescript
import { wrapFetchWithPayment } from "@x402/fetch";

const paidFetch = wrapFetchWithPayment(fetch, x402Client);

// agent fetches like normal — x402 handles payment
const marketData = await paidFetch("https://api.example.com/prices");
const newsData = await paidFetch("https://api.example.com/news");
```

The agent can pay external services or other agent endpoints via x402. An INFT itself isn't the payable thing — the service exposed by the agent is.

## Cron — Giving INFTs Time

Without cron, an INFT just sits there. With cron, it wakes up on a schedule and acts. The schedule is stored in the INFT metadata:

```json
{
  "name": "alpha-scanner",
  "persona": "You are a DeFi alpha researcher. Be concise and actionable.",
  "prompt": "Analyze top 10 tokens by volume. Flag anything unusual.",
  "schedule": "*/30 * * * *",
  "x402_endpoints": [
    "https://api.coingecko.com/pro/v3/coins/markets",
    "https://api.dune.com/v1/query/results"
  ],
  "actions": ["store_report", "notify_owner"]
}
```

```typescript
import cron from "node-cron";

const config = await loadINFTConfig(tokenId);

// agent runs every 30 minutes, forever
cron.schedule(config.schedule, async () => {
  // pay for data (x402)
  const data = await paidFetch(config.x402_endpoints[0]);

  // think (0G Compute)
  const analysis = await ogCompute.inference({
    model: "deepseek-v3",
    prompt: `${config.persona}\n\n${config.prompt}\n\nData: ${JSON.stringify(data)}`
  });

  // remember (0G Storage)
  await ogStorage.store(tokenId, {
    timestamp: Date.now(),
    input: data,
    output: analysis
  });
});
```

When you transfer the INFT, the schedule transfers too. New owner's executor picks it up and the agent keeps running.

### Cron Roadmap

```
TODAY         node-cron (off-chain, works now)
NEXT          Chainlink Automation / Gelato (decentralized keepers)
ENDGAME       Protocol-level scheduling (like Hedera HIP-1215)

The INFT contract stays the same in all three cases.
Only the trigger changes.
```

## INFT — Giving Agents Ownership

ERC-7857 is the container. The agent's intelligence (prompts, strategy, config) is encrypted and stored on 0G Storage. When you transfer the INFT:

1. Oracle re-encrypts the intelligence for the new owner
2. New owner gets: brain + wallet + schedule + full history
3. Agent keeps running under new ownership
4. Track record is public and verifiable on 0G Storage

## Project Structure

```
0gclaw/
├── contracts/              # Solidity (Foundry)
│   ├── src/
│   │   ├── ZeroGClaw.sol          # ERC-7857 INFT contract
│   │   └── interfaces/
│   │       └── IERC7857.sol       # ERC-7857 interface
│   ├── script/
│   │   └── Deploy.s.sol           # Deployment script
│   ├── test/
│   │   └── ZeroGClaw.t.sol        # Contract tests
│   └── foundry.toml
│
├── executor/               # Cron + x402 engine (Node.js)
│   ├── src/
│   │   ├── index.ts               # Entry point
│   │   ├── cron.ts                # Reads INFT config, runs scheduled jobs
│   │   ├── x402.ts                # x402 fetch wrapper, auto-pay setup
│   │   ├── storage.ts             # 0G Storage read/write
│   │   ├── compute.ts             # 0G Compute inference
│   │   └── interact.ts            # Agent-to-agent interaction
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # Next.js dashboard
│   ├── app/
│   │   ├── page.tsx               # Landing — list agents
│   │   ├── mint/page.tsx          # Mint new agent
│   │   └── agent/[id]/page.tsx    # Agent dashboard + cron log
│   └── package.json
│
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+
- Foundry (forge, cast)
- 0G Testnet tokens — [faucet](https://faucet.0g.ai)
- Base Sepolia USDC for x402 — [CDP faucet](https://docs.cdp.coinbase.com/faucets/)

### 1. Deploy Contract

```bash
cd contracts
forge install
forge build
forge script script/Deploy.s.sol --rpc-url https://evmrpc-testnet.0g.ai --broadcast
```

### 2. Run the Executor

```bash
cd executor
npm install
cp .env.example .env
npm run start
```

### 3. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

## ERC-7857 Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ZeroGClaw is ERC721 {
    struct Agent {
        string encryptedConfigURI;   // 0G Storage URI (encrypted)
        bytes32 configHash;          // integrity check
        address wallet;              // agent's x402 USDC wallet
        address executor;            // authorized cron executor
    }

    mapping(uint256 => Agent) public agents;
    uint256 private _nextTokenId;

    constructor() ERC721("0GClaw", "0GCLAW") {}

    function mint(
        address to,
        string calldata encryptedConfigURI,
        bytes32 configHash,
        address wallet
    ) external returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        agents[tokenId] = Agent({
            encryptedConfigURI: encryptedConfigURI,
            configHash: configHash,
            wallet: wallet,
            executor: address(0)
        });
        return tokenId;
    }

    function authorizeExecutor(uint256 tokenId, address executor) external {
        require(ownerOf(tokenId) == msg.sender, "not owner");
        agents[tokenId].executor = executor;
    }

    function getAgent(uint256 tokenId) external view returns (Agent memory) {
        return agents[tokenId];
    }
}
```

## Network Config

| Parameter | Value |
|-----------|-------|
| 0G Testnet RPC | `https://evmrpc-testnet.0g.ai` |
| Chain ID | `16602` |
| 0G Storage | `https://storage-testnet.0g.ai` |
| 0G Compute | `https://compute-testnet.0g.ai` |
| 0G Faucet | `https://faucet.0g.ai` |
| x402 Facilitator | `https://x402.org/facilitator` |
| x402 Network | Base Sepolia |

## Team Split (2 hours)

| Task | Who | Time |
|------|-----|------|
| Deploy ERC-7857 on 0G testnet | Teammate | 45 min |
| Wire 0G Storage for configs + results | Teammate | 30 min |
| x402 client + funded agent wallet | You | 20 min |
| Cron executor (node-cron + inference + store) | You | 30 min |
| Demo / simple frontend | Both | 15 min |

## Links

- [ERC-7857 Standard](https://docs.0g.ai/developer-hub/building-on-0g/inft/erc7857)
- [INFT Integration Guide](https://docs.0g.ai/developer-hub/building-on-0g/inft/integration)
- [INFT Deploy Tutorial](https://medium.com/@intriiga/deploy-your-inft-ai-agent-to-0g-chain-on-the-new-erc-7857-standard-and-upload-it-to-0g-storage-and-176a482f12d2)
- [0G Docs](https://docs.0g.ai)
- [x402 Protocol](https://docs.cdp.coinbase.com/x402/welcome)
- [x402 Buyer Quickstart](https://docs.cdp.coinbase.com/x402/quickstart-for-buyers)
- [x402 GitHub](https://github.com/coinbase/x402)
- [@x402/fetch npm](https://www.npmjs.com/package/@x402/fetch)
- [x402 Autonomous Agents (Base)](https://docs.base.org/base-app/agents/x402-agents)
- [Hedera HIP-1215 (future cron reference)](https://hips.hedera.com/hip/hip-1215)
