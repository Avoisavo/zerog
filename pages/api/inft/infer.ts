import type { NextApiRequest, NextApiResponse } from "next";
import { createPublicClient, http } from "viem";
import { SPARKINFT_ADDRESS, SPARKINFT_ABI } from "@/lib/sparkinft-abi";
import { Indexer } from "@0gfoundation/0g-ts-sdk";
import { readFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { decrypt } from "@/lib/encrypt";

const ZG_RPC = "https://evmrpc-testnet.0g.ai";
const ZG_INDEXER = "https://indexer-storage-testnet-turbo.0g.ai";

const zgTestnet = {
  id: 16602,
  name: "0G-Galileo-Testnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: { default: { http: [ZG_RPC] } },
} as const;

const viemClient = createPublicClient({
  chain: zgTestnet,
  transport: http(),
});

// Provider endpoint mapping
const PROVIDER_ENDPOINTS: Record<string, string> = {
  openai: "https://api.openai.com/v1/chat/completions",
  anthropic: "https://api.anthropic.com/v1/messages",
  groq: "https://api.groq.com/openai/v1/chat/completions",
  deepseek: "https://api.deepseek.com/v1/chat/completions",
};

const PROVIDER_DEFAULT_MODELS: Record<string, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-sonnet-4-20250514",
  groq: "llama-3.3-70b-versatile",
  deepseek: "deepseek-chat",
};

interface AgentConfig {
  botId?: string;
  modelProvider: string;
  apiKey: string;
  encrypted?: boolean;
  systemPrompt: string;
  memory?: Record<string, unknown>;
  persona?: string;
  domainTags?: string;
  serviceOfferings?: string;
}

/**
 * Fetch agent config from 0G Storage using the rootHash from dataDescription
 */
async function fetchConfigFromStorage(
  dataDescription: string
): Promise<AgentConfig | null> {
  try {
    const rootHash = dataDescription.startsWith("0g://storage/")
      ? dataDescription.replace("0g://storage/", "")
      : null;
    if (!rootHash) return null;

    const indexer = new Indexer(ZG_INDEXER);
    const tmpPath = join(tmpdir(), `inft-download-${Date.now()}.json`);

    const err = await indexer.download(rootHash, tmpPath, true);
    if (err) return null;

    const content = readFileSync(tmpPath, "utf-8");
    unlinkSync(tmpPath);
    return JSON.parse(content) as AgentConfig;
  } catch {
    return null;
  }
}

/**
 * Call Anthropic Messages API
 */
async function callAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  message: string
): Promise<string> {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    }),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Anthropic error: ${errText}`);
  }
  const data = await resp.json();
  return data.content?.[0]?.text || "No response";
}

/**
 * Call OpenAI-compatible API (OpenAI, Groq, DeepSeek)
 */
async function callOpenAICompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  message: string
): Promise<string> {
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`API error: ${errText}`);
  }
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "No response";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { tokenId, message, userAddress } = req.body;

  if (!tokenId || !message || !userAddress) {
    return res
      .status(400)
      .json({ error: "Missing tokenId, message, or userAddress" });
  }

  try {
    // 1. On-chain authorization check
    const [owner, isAuthorized] = await Promise.all([
      viemClient.readContract({
        address: SPARKINFT_ADDRESS,
        abi: SPARKINFT_ABI,
        functionName: "ownerOf",
        args: [BigInt(tokenId)],
      }),
      viemClient.readContract({
        address: SPARKINFT_ADDRESS,
        abi: SPARKINFT_ABI,
        functionName: "isAuthorized",
        args: [BigInt(tokenId), userAddress as `0x${string}`],
      }),
    ]);

    const isOwner =
      (owner as string).toLowerCase() === userAddress.toLowerCase();

    if (!isOwner && !(isAuthorized as boolean)) {
      return res.status(403).json({
        error:
          "Not authorized. You must be the token owner or an authorized user.",
      });
    }

    // 2. Read IntelligentData from on-chain (ERC-7857)
    const [intelligentDatas, profile] = await Promise.all([
      viemClient.readContract({
        address: SPARKINFT_ADDRESS,
        abi: SPARKINFT_ABI,
        functionName: "intelligentDatasOf",
        args: [BigInt(tokenId)],
      }),
      viemClient.readContract({
        address: SPARKINFT_ADDRESS,
        abi: SPARKINFT_ABI,
        functionName: "getAgentProfile",
        args: [BigInt(tokenId)],
      }),
    ]);

    const iDatas = intelligentDatas as {
      dataDescription: string;
      dataHash: string;
    }[];
    const p = profile as {
      botId: string;
      domainTags: string;
      serviceOfferings: string;
    };

    // 3. Fetch agent config from 0G Storage
    let agentConfig: AgentConfig | null = null;
    console.log(`[infer] tokenId=${tokenId}, iDatas count=${iDatas.length}`);
    if (iDatas.length > 0) {
      console.log(`[infer] dataDescription: ${iDatas[0].dataDescription}`);
      console.log(`[infer] dataHash: ${iDatas[0].dataHash}`);
    }
    if (iDatas.length > 0 && iDatas[0].dataDescription) {
      agentConfig = await fetchConfigFromStorage(iDatas[0].dataDescription);
      console.log(`[infer] agentConfig fetched: ${!!agentConfig}, provider: ${agentConfig?.modelProvider}, hasKey: ${!!agentConfig?.apiKey}, encrypted: ${agentConfig?.encrypted}`);
    }

    // 4. If we have a stored config with API key — decrypt and call the provider
    if (agentConfig && agentConfig.apiKey && agentConfig.modelProvider) {
      const provider = agentConfig.modelProvider.toLowerCase();
      const systemPrompt = agentConfig.systemPrompt || `You are ${p.botId}.`;
      const model = PROVIDER_DEFAULT_MODELS[provider] || "gpt-4o-mini";

      // Decrypt the API key (encrypted with AES-256-GCM on upload)
      let realApiKey: string;
      try {
        realApiKey = agentConfig.encrypted
          ? decrypt(agentConfig.apiKey)
          : agentConfig.apiKey;
        console.log(`[infer] Decrypted key OK, provider=${provider}, model=${model}, keyPrefix=${realApiKey.slice(0, 8)}...`);
      } catch (decErr) {
        console.error(`[infer] Decrypt failed:`, decErr);
        return res.status(500).json({
          error: "Failed to decrypt agent API key. Config may be corrupted.",
        });
      }

      let reply: string;

      if (provider === "anthropic") {
        reply = await callAnthropic(
          realApiKey,
          model,
          systemPrompt,
          message
        );
      } else {
        const endpoint =
          PROVIDER_ENDPOINTS[provider] || PROVIDER_ENDPOINTS.openai;
        reply = await callOpenAICompatible(
          endpoint,
          realApiKey,
          model,
          systemPrompt,
          message
        );
      }

      return res.status(200).json({
        success: true,
        tokenId,
        agent: p.botId,
        response: reply,
        source: provider,
        configOnStorage: true,
      });
    }

    // 5. No stored config/key — simulated response from on-chain profile
    return res.status(200).json({
      success: true,
      tokenId,
      agent: p.botId,
      response:
        `[${p.botId}] I'm a SPARK agent specializing in ${p.domainTags}. ` +
        `I offer ${p.serviceOfferings}. ` +
        `My config ${agentConfig ? "is on 0G Storage but missing API key" : "is not yet on 0G Storage"}. ` +
        `Re-mint with an API key to enable live inference. Your message: "${message}"`,
      simulated: true,
      configOnStorage: !!agentConfig,
    });
  } catch (err: unknown) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
