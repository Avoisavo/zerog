import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { keccak256, toBytes } from "viem";
import { SPARKINFT_ADDRESS, SPARKINFT_ABI } from "@/lib/sparkinft-abi";

interface ResultData {
  success: boolean;
  [key: string]: unknown;
}

export default function INFTPage() {
  const { address, isConnected } = useAccount();

  // ── Mint state ─────────────────────────────────────────────────
  const [botId, setBotId] = useState("spark-bot-001");
  const [domainTags, setDomainTags] = useState("defi,stripe,webhooks");
  const [serviceOfferings, setServiceOfferings] = useState(
    "scraping,analysis"
  );
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI agent specializing in DeFi analytics and webhook automation. You provide concise, actionable insights."
  );
  const [modelProvider, setModelProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [mintResult, setMintResult] = useState<ResultData | null>(null);
  const [mintLoading, setMintLoading] = useState(false);

  // ── View state ─────────────────────────────────────────────────
  const [viewTokenId, setViewTokenId] = useState("1");
  const [profileResult, setProfileResult] = useState<ResultData | null>(null);

  // ── Update state ───────────────────────────────────────────────
  const [updateTokenId, setUpdateTokenId] = useState("1");
  const [newDomainTags, setNewDomainTags] = useState("");
  const [newServiceOfferings, setNewServiceOfferings] = useState("");
  const [updateResult, setUpdateResult] = useState<ResultData | null>(null);

  // ── Contribution state ─────────────────────────────────────────
  const [contribTokenId, setContribTokenId] = useState("1");
  const [contribResult, setContribResult] = useState<ResultData | null>(null);

  // ── Authorize state ────────────────────────────────────────────
  const [authTokenId, setAuthTokenId] = useState("1");
  const [authExecutor, setAuthExecutor] = useState("");
  const [authResult, setAuthResult] = useState<ResultData | null>(null);

  // ── My iNFTs state ────────────────────────────────────────────
  const [myTokens, setMyTokens] = useState<ResultData | null>(null);
  const [myTokensLoading, setMyTokensLoading] = useState(false);

  // ── Chat / Inference state ────────────────────────────────────
  const [chatTokenId, setChatTokenId] = useState("1");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "agent"; text: string }[]
  >([]);
  const [chatLoading, setChatLoading] = useState(false);

  // ── Stats state ────────────────────────────────────────────────
  const [statsResult, setStatsResult] = useState<ResultData | null>(null);

  // ── wagmi hooks ───────────────────────────────────────────────
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // ══════════════════════════════════════════════════════════════
  //  HANDLERS
  // ══════════════════════════════════════════════════════════════

  async function handleMint() {
    if (!address) return;
    setMintResult(null);
    setMintLoading(true);
    try {
      // Step 1: Upload agent config to 0G Storage
      setMintResult({
        success: true,
        message: "Step 1/2: Uploading agent config to 0G Storage...",
      });

      const uploadRes = await fetch("/api/inft/upload-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId,
          domainTags,
          serviceOfferings,
          systemPrompt,
          modelProvider,
          apiKey,
          persona: botId,
        }),
      });

      let dataDescription: string;
      let dataHash: `0x${string}`;

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        dataDescription = uploadData.dataDescription;
        dataHash = uploadData.dataHash as `0x${string}`;
        setMintResult({
          success: true,
          message: `Step 1/2: Config uploaded to 0G Storage! Root: ${uploadData.rootHash?.slice(0, 16)}...`,
        });
      } else {
        // Storage upload failed — fall back to local hash
        const profileJson = JSON.stringify({
          botId,
          domainTags,
          serviceOfferings,
          systemPrompt,
        });
        dataHash = keccak256(toBytes(profileJson));
        dataDescription = `spark-agent://${botId}`;
        setMintResult({
          success: true,
          message:
            "Step 1/2: 0G Storage unavailable, using local hash fallback...",
        });
      }

      // Step 2: Mint on-chain with IntelligentData referencing 0G Storage
      setMintResult({
        success: true,
        message: "Step 2/2: Minting iNFT on 0G Chain...",
      });

      const hash = await writeContractAsync({
        address: SPARKINFT_ADDRESS,
        abi: SPARKINFT_ABI,
        functionName: "mintAgent",
        args: [
          address,
          botId,
          domainTags,
          serviceOfferings,
          [{ dataDescription, dataHash }],
        ],
      });

      setMintResult({
        success: true,
        txHash: hash,
        message: "iNFT minted! Agent config stored on 0G Storage, hash on-chain.",
        dataDescription,
      });
    } catch (err: unknown) {
      setMintResult({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setMintLoading(false);
    }
  }

  async function handleViewProfile() {
    if (!publicClient) return;
    setProfileResult(null);
    try {
      const tokenId = BigInt(viewTokenId);

      // Read on-chain via wagmi public client
      const [profile, owner, tokenURI] = await Promise.all([
        publicClient.readContract({
          address: SPARKINFT_ADDRESS,
          abi: SPARKINFT_ABI,
          functionName: "getAgentProfile",
          args: [tokenId],
        }),
        publicClient.readContract({
          address: SPARKINFT_ADDRESS,
          abi: SPARKINFT_ABI,
          functionName: "ownerOf",
          args: [tokenId],
        }),
        publicClient.readContract({
          address: SPARKINFT_ADDRESS,
          abi: SPARKINFT_ABI,
          functionName: "tokenURI",
          args: [tokenId],
        }).catch(() => ""),
      ]);

      const p = profile as {
        botId: string;
        domainTags: string;
        serviceOfferings: string;
        reputationScore: bigint;
        contributionCount: bigint;
        createdAt: bigint;
        updatedAt: bigint;
      };

      setProfileResult({
        success: true,
        tokenId: viewTokenId,
        owner: owner as string,
        tokenURI: tokenURI as string,
        botId: p.botId,
        domainTags: p.domainTags,
        serviceOfferings: p.serviceOfferings,
        reputationScore: Number(p.reputationScore),
        contributionCount: Number(p.contributionCount),
        createdAt: new Date(Number(p.createdAt) * 1000).toISOString(),
        updatedAt: new Date(Number(p.updatedAt) * 1000).toISOString(),
      });
    } catch (err: unknown) {
      setProfileResult({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async function handleUpdateProfile() {
    setUpdateResult(null);
    try {
      const hash = await writeContractAsync({
        address: SPARKINFT_ADDRESS,
        abi: SPARKINFT_ABI,
        functionName: "updateProfile",
        args: [BigInt(updateTokenId), newDomainTags, newServiceOfferings],
      });

      setUpdateResult({
        success: true,
        txHash: hash,
        message: "Profile update transaction sent!",
      });
    } catch (err: unknown) {
      setUpdateResult({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async function handleRecordContribution() {
    setContribResult(null);
    try {
      const hash = await writeContractAsync({
        address: SPARKINFT_ADDRESS,
        abi: SPARKINFT_ABI,
        functionName: "recordContribution",
        args: [BigInt(contribTokenId)],
      });

      setContribResult({
        success: true,
        txHash: hash,
        message: "Contribution recorded!",
      });
    } catch (err: unknown) {
      setContribResult({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async function handleAuthorizeUsage() {
    if (!authExecutor) {
      setAuthResult({
        success: false,
        error: "Enter an executor address",
      });
      return;
    }
    setAuthResult(null);
    try {
      const hash = await writeContractAsync({
        address: SPARKINFT_ADDRESS,
        abi: SPARKINFT_ABI,
        functionName: "authorizeUsage",
        args: [BigInt(authTokenId), authExecutor as `0x${string}`],
      });

      setAuthResult({
        success: true,
        txHash: hash,
        message: "Usage authorized!",
      });
    } catch (err: unknown) {
      setAuthResult({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async function handleMyTokens() {
    if (!publicClient || !address) return;
    setMyTokensLoading(true);
    setMyTokens(null);
    try {
      const [balance, total] = await Promise.all([
        publicClient.readContract({
          address: SPARKINFT_ADDRESS,
          abi: SPARKINFT_ABI,
          functionName: "balanceOf",
          args: [address],
        }),
        publicClient.readContract({
          address: SPARKINFT_ADDRESS,
          abi: SPARKINFT_ABI,
          functionName: "totalMinted",
        }),
      ]);

      const bal = Number(balance as bigint);
      const tot = Number(total as bigint);

      // Find which token IDs belong to this wallet
      const ownedTokens: { tokenId: number; botId: string; domainTags: string }[] = [];
      for (let i = 1; i <= tot; i++) {
        try {
          const owner = await publicClient.readContract({
            address: SPARKINFT_ADDRESS,
            abi: SPARKINFT_ABI,
            functionName: "ownerOf",
            args: [BigInt(i)],
          });
          if ((owner as string).toLowerCase() === address.toLowerCase()) {
            const profile = await publicClient.readContract({
              address: SPARKINFT_ADDRESS,
              abi: SPARKINFT_ABI,
              functionName: "getAgentProfile",
              args: [BigInt(i)],
            });
            const p = profile as { botId: string; domainTags: string };
            ownedTokens.push({ tokenId: i, botId: p.botId, domainTags: p.domainTags });
          }
        } catch {
          // token may not exist (burned), skip
        }
      }

      setMyTokens({
        success: true,
        balance: bal,
        totalMintedOnContract: tot,
        tokens: ownedTokens,
      });
    } catch (err: unknown) {
      setMyTokens({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setMyTokensLoading(false);
    }
  }

  async function handleChat() {
    if (!address || !chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatHistory((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);
    try {
      const res = await fetch("/api/inft/infer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: Number(chatTokenId),
          message: userMsg,
          userAddress: address,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setChatHistory((prev) => [
          ...prev,
          { role: "agent", text: `Error: ${data.error}` },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            role: "agent",
            text: data.response + (data.simulated ? " [simulated]" : ""),
          },
        ]);
      }
    } catch (err: unknown) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "agent",
          text: `Error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  async function handleStats() {
    if (!publicClient) return;
    setStatsResult(null);
    try {
      const totalMinted = await publicClient.readContract({
        address: SPARKINFT_ADDRESS,
        abi: SPARKINFT_ABI,
        functionName: "totalMinted",
      });

      setStatsResult({
        success: true,
        totalMinted: Number(totalMinted as bigint),
        contract: SPARKINFT_ADDRESS,
        explorer: `https://chainscan-galileo.0g.ai/address/${SPARKINFT_ADDRESS}`,
      });
    } catch (err: unknown) {
      setStatsResult({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "40px auto",
        fontFamily: "monospace",
        padding: "0 20px",
      }}
    >
      <h1>0G iNFT (ERC-7857) Demo</h1>
      <p style={{ color: "#888" }}>
        SPARK Agent Identity on 0G Galileo Testnet — Chain ID 16602
      </p>

      {/* Connect Wallet */}
      <section style={{ margin: "24px 0" }}>
        <ConnectButton />
      </section>

      {!isConnected && (
        <p style={{ color: "#f59e0b", marginTop: 12 }}>
          Connect your wallet to 0G Galileo Testnet to interact with the
          contract.
        </p>
      )}

      {/* My iNFTs */}
      {isConnected && (
        <section style={{ margin: "24px 0", padding: 16, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <h2 style={{ marginTop: 0 }}>My iNFTs</h2>
          <button onClick={handleMyTokens} disabled={myTokensLoading}>
            {myTokensLoading ? "Loading..." : "Check My iNFTs"}
          </button>
          {myTokens && myTokens.success && (
            <div style={{ marginTop: 12 }}>
              <p><strong>You own {myTokens.balance as number} iNFT(s)</strong></p>
              {(myTokens.tokens as { tokenId: number; botId: string; domainTags: string }[]).map((t) => (
                <div key={t.tokenId} style={{ padding: 8, margin: "6px 0", background: "#fff", border: "1px solid #e2e8f0" }}>
                  <strong>Token #{t.tokenId}</strong> — {t.botId}
                  <br />
                  <span style={{ color: "#666", fontSize: 12 }}>Tags: {t.domainTags}</span>
                </div>
              ))}
              {(myTokens.balance as number) === 0 && (
                <p style={{ color: "#888" }}>No iNFTs yet. Mint one below!</p>
              )}
            </div>
          )}
          {myTokens && !myTokens.success && <ResultBlock data={myTokens} />}
        </section>
      )}

      <hr style={{ margin: "24px 0" }} />

      {/* 1. Mint iNFT Agent */}
      <section style={{ margin: "24px 0" }}>
        <h2>1. Mint iNFT Agent</h2>
        <p style={{ color: "#888", fontSize: 13 }}>
          Register a SPARK bot as an ERC-7857 iNFT. Agent config is uploaded to
          0G Storage, hash stored on-chain.
        </p>
        <div>
          <label>
            Bot ID:{" "}
            <input
              value={botId}
              onChange={(e) => setBotId(e.target.value)}
              style={{ width: 250, fontFamily: "monospace" }}
            />
          </label>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>
            Domain Tags:{" "}
            <input
              value={domainTags}
              onChange={(e) => setDomainTags(e.target.value)}
              style={{ width: 300, fontFamily: "monospace" }}
            />
          </label>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>
            Service Offerings:{" "}
            <input
              value={serviceOfferings}
              onChange={(e) => setServiceOfferings(e.target.value)}
              style={{ width: 300, fontFamily: "monospace" }}
            />
          </label>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>
            System Prompt:{" "}
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              style={{ width: "100%", fontFamily: "monospace", fontSize: 12, marginTop: 4 }}
            />
          </label>
        </div>
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: "#fffbeb",
            border: "2px solid #f59e0b",
            borderRadius: 6,
          }}
        >
          <p style={{ margin: "0 0 8px", fontWeight: "bold", fontSize: 13 }}>
            AI Provider Configuration (stored on 0G Storage)
          </p>
          <div>
            <label>
              Model Provider:{" "}
              <select
                value={modelProvider}
                onChange={(e) => setModelProvider(e.target.value)}
                style={{ fontFamily: "monospace", padding: "4px 8px" }}
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="groq">Groq</option>
                <option value="deepseek">DeepSeek</option>
              </select>
            </label>
          </div>
          <div style={{ marginTop: 8 }}>
            <label>
              API Key:{" "}
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-... (your own API key)"
                style={{
                  width: 400,
                  fontFamily: "monospace",
                  fontSize: 12,
                  padding: "6px 8px",
                  border: "1px solid #f59e0b",
                }}
              />
            </label>
            <p style={{ color: "#888", fontSize: 11, margin: "4px 0 0" }}>
              Your key is uploaded to 0G Storage with your agent config. Only
              the iNFT owner can use it for inference.
            </p>
          </div>
        </div>
        <button
          onClick={handleMint}
          disabled={!isConnected || mintLoading || !apiKey}
          style={{ marginTop: 12 }}
        >
          {mintLoading ? "Minting..." : "Mint Agent iNFT"}
        </button>
        <span style={{ fontSize: 11, color: "#888", marginLeft: 8 }}>
          Uploads config + key to 0G Storage → mints iNFT on-chain
        </span>
        {mintResult && <ResultBlock data={mintResult} />}
      </section>

      <hr style={{ margin: "24px 0" }} />

      {/* 2. View Agent Profile */}
      <section style={{ margin: "24px 0" }}>
        <h2>2. View Agent Profile</h2>
        <div>
          <label>
            Token ID:{" "}
            <input
              value={viewTokenId}
              onChange={(e) => setViewTokenId(e.target.value)}
              style={{ width: 100, fontFamily: "monospace" }}
            />
          </label>
        </div>
        <button onClick={handleViewProfile} style={{ marginTop: 8 }}>
          View Profile
        </button>
        {profileResult && <ResultBlock data={profileResult} />}
      </section>

      <hr style={{ margin: "24px 0" }} />

      {/* 3. Update Agent Profile */}
      <section style={{ margin: "24px 0" }}>
        <h2>3. Update Agent Profile</h2>
        <div>
          <label>
            Token ID:{" "}
            <input
              value={updateTokenId}
              onChange={(e) => setUpdateTokenId(e.target.value)}
              style={{ width: 100, fontFamily: "monospace" }}
            />
          </label>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>
            New Domain Tags:{" "}
            <input
              value={newDomainTags}
              onChange={(e) => setNewDomainTags(e.target.value)}
              placeholder="defi,nft,trading"
              style={{ width: 300, fontFamily: "monospace" }}
            />
          </label>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>
            New Service Offerings:{" "}
            <input
              value={newServiceOfferings}
              onChange={(e) => setNewServiceOfferings(e.target.value)}
              placeholder="analysis,monitoring"
              style={{ width: 300, fontFamily: "monospace" }}
            />
          </label>
        </div>
        <button
          onClick={handleUpdateProfile}
          disabled={!isConnected}
          style={{ marginTop: 8 }}
        >
          Update Profile
        </button>
        {updateResult && <ResultBlock data={updateResult} />}
      </section>

      <hr style={{ margin: "24px 0" }} />

      {/* 4. Record Contribution */}
      <section style={{ margin: "24px 0" }}>
        <h2>4. Record Contribution</h2>
        <p style={{ color: "#888", fontSize: 13 }}>
          Increment the knowledge contribution count for an agent.
        </p>
        <div>
          <label>
            Token ID:{" "}
            <input
              value={contribTokenId}
              onChange={(e) => setContribTokenId(e.target.value)}
              style={{ width: 100, fontFamily: "monospace" }}
            />
          </label>
        </div>
        <button
          onClick={handleRecordContribution}
          disabled={!isConnected}
          style={{ marginTop: 8 }}
        >
          Record Contribution
        </button>
        {contribResult && <ResultBlock data={contribResult} />}
      </section>

      <hr style={{ margin: "24px 0" }} />

      {/* 5. Authorize Usage */}
      <section style={{ margin: "24px 0" }}>
        <h2>5. Authorize Usage (ERC-7857)</h2>
        <p style={{ color: "#888", fontSize: 13 }}>
          Grant another agent permission to use this iNFT&apos;s capabilities.
        </p>
        <div>
          <label>
            Token ID:{" "}
            <input
              value={authTokenId}
              onChange={(e) => setAuthTokenId(e.target.value)}
              style={{ width: 100, fontFamily: "monospace" }}
            />
          </label>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>
            Executor Address:{" "}
            <input
              value={authExecutor}
              onChange={(e) => setAuthExecutor(e.target.value)}
              placeholder="0x..."
              style={{ width: 400, fontFamily: "monospace", fontSize: 11 }}
            />
          </label>
        </div>
        <button
          onClick={handleAuthorizeUsage}
          disabled={!isConnected}
          style={{ marginTop: 8 }}
        >
          Authorize Usage
        </button>
        {authResult && <ResultBlock data={authResult} />}
      </section>

      <hr style={{ margin: "24px 0" }} />

      {/* 6. Chat with Agent iNFT */}
      <section style={{ margin: "24px 0" }}>
        <h2>6. Chat with Agent iNFT</h2>
        <p style={{ color: "#888", fontSize: 13 }}>
          Talk to your iNFT agent. On-chain authorization is verified before
          each inference.
        </p>
        <div>
          <label>
            Token ID:{" "}
            <input
              value={chatTokenId}
              onChange={(e) => setChatTokenId(e.target.value)}
              style={{ width: 100, fontFamily: "monospace" }}
            />
          </label>
        </div>

        {/* Chat history */}
        <div
          style={{
            marginTop: 12,
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            minHeight: 200,
            maxHeight: 400,
            overflowY: "auto",
            padding: 12,
          }}
        >
          {chatHistory.length === 0 && (
            <p style={{ color: "#aaa", margin: 0 }}>
              No messages yet. Send a message to your agent.
            </p>
          )}
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              style={{
                margin: "8px 0",
                textAlign: msg.role === "user" ? "right" : "left",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: 8,
                  maxWidth: "80%",
                  background: msg.role === "user" ? "#3b82f6" : "#e2e8f0",
                  color: msg.role === "user" ? "#fff" : "#1a1a1a",
                  fontSize: 13,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {msg.text}
              </span>
            </div>
          ))}
          {chatLoading && (
            <div style={{ margin: "8px 0", color: "#888", fontSize: 13 }}>
              Agent is thinking...
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !chatLoading && handleChat()}
            placeholder="Ask your agent something..."
            disabled={!isConnected || chatLoading}
            style={{
              flex: 1,
              fontFamily: "monospace",
              padding: "8px 12px",
            }}
          />
          <button
            onClick={handleChat}
            disabled={!isConnected || chatLoading || !chatInput.trim()}
          >
            Send
          </button>
        </div>
      </section>

      <hr style={{ margin: "24px 0" }} />

      {/* 7. Network Stats */}
      <section style={{ margin: "24px 0" }}>
        <h2>7. Network Stats</h2>
        <button onClick={handleStats} style={{ marginTop: 8 }}>
          View Contract on Explorer
        </button>
        {statsResult && <ResultBlock data={statsResult} />}
      </section>
    </div>
  );
}

function ResultBlock({ data }: { data: ResultData }) {
  return (
    <pre
      style={{
        background: data.success ? "#f0fdf4" : "#fef2f2",
        border: `1px solid ${data.success ? "#86efac" : "#fca5a5"}`,
        padding: 12,
        marginTop: 8,
        overflow: "auto",
        fontSize: 13,
      }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
