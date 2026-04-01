import { useState } from "react";
import { Space_Grotesk } from "next/font/google";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

function NftCard({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <div
      style={{
        width: 280,
        background: "rgba(93, 42, 142, 0.25)",
        border: "1px solid rgba(196, 87, 208, 0.3)",
        borderRadius: 16,
        overflow: "hidden",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* NFT Image placeholder */}
      <div
        style={{
          width: "100%",
          aspectRatio: "1",
          background: isLeft
            ? "linear-gradient(135deg, #5D2A8E 0%, #C457D0 100%)"
            : "linear-gradient(135deg, #C457D0 0%, #E5B6F2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "3rem",
        }}
      >
        {isLeft ? "🎮" : "🏆"}
      </div>

      {/* NFT Info */}
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <span
          style={{
            fontSize: "0.75rem",
            color: "#B284BE",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {isLeft ? "Your NFT" : "Prize NFT"}
        </span>
        <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#E5B6F2" }}>
          {isLeft ? "Claw Machine Pass" : "Rare Collectible"}
        </span>
        <span style={{ fontSize: "0.85rem", color: "#B284BE" }}>
          {isLeft ? "Entry ticket to play the claw game" : "Win this exclusive NFT"}
        </span>

        <div
          style={{
            marginTop: 8,
            padding: "8px 12px",
            background: "rgba(50, 10, 70, 0.5)",
            borderRadius: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "#D1D1D1" }}>Floor</span>
          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#C457D0" }}>
            {isLeft ? "0.05 ETH" : "1.2 ETH"}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 12px",
            background: "rgba(50, 10, 70, 0.3)",
            borderRadius: 8,
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "#D1D1D1" }}>Owner</span>
          <span style={{ fontSize: "0.75rem", color: "#B284BE" }}>0x3f...a1c2</span>
        </div>
      </div>
    </div>
  );
}

function ChatBox() {
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot" }[]>([
    { text: "Welcome to 0G Claw! Ready to play?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: "Processing your move...", sender: "bot" },
      ]);
    }, 600);
  };

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        background: "rgba(50, 10, 70, 0.4)",
        border: "1px solid rgba(196, 87, 208, 0.25)",
        borderRadius: 16,
        backdropFilter: "blur(12px)",
        overflow: "hidden",
      }}
    >
      {/* Chat header */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid rgba(196, 87, 208, 0.2)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#C457D0",
            boxShadow: "0 0 8px rgba(196, 87, 208, 0.6)",
          }}
        />
        <span style={{ fontWeight: 600, color: "#E5B6F2", fontSize: "0.95rem" }}>
          Game Chat
        </span>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              maxWidth: "75%",
              padding: "10px 14px",
              borderRadius: 12,
              fontSize: "0.9rem",
              lineHeight: 1.4,
              ...(msg.sender === "user"
                ? {
                    background: "rgba(196, 87, 208, 0.3)",
                    color: "#FFFFFF",
                    borderBottomRightRadius: 4,
                  }
                : {
                    background: "rgba(93, 42, 142, 0.4)",
                    color: "#E5B6F2",
                    borderBottomLeftRadius: 4,
                  }),
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div
        style={{
          padding: 12,
          borderTop: "1px solid rgba(196, 87, 208, 0.2)",
          display: "flex",
          gap: 10,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(178, 132, 190, 0.3)",
            background: "rgba(50, 10, 70, 0.5)",
            color: "#F8F9FA",
            fontSize: "0.9rem",
            outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, #5D2A8E, #C457D0)",
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default function Claw() {
  return (
    <div
      className={spaceGrotesk.className}
      style={{
        width: "100vw",
        height: "100vh",
        background: "#320A46",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 28px",
          borderBottom: "1px solid rgba(196, 87, 208, 0.2)",
          background: "rgba(50, 10, 70, 0.6)",
          backdropFilter: "blur(12px)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            color: "#E5B6F2",
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
          }}
        >
          0G Claw
        </span>

        <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <a
            href="/"
            style={{
              color: "#B284BE",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 500,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#E5B6F2")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#B284BE")}
          >
            Home
          </a>
          <a
            href="/claw"
            style={{
              color: "#C457D0",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 500,
            }}
          >
            Play
          </a>
        </nav>

        <ConnectButton />
      </header>

      {/* Main content: NFT left | Chat center | NFT right */}
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: 24,
          padding: 24,
          minHeight: 0,
          alignItems: "stretch",
        }}
      >
        <NftCard side="left" />
        <ChatBox />
        <NftCard side="right" />
      </div>
    </div>
  );
}
