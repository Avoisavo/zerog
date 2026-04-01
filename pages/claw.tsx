import { useState } from "react";
import Image from "next/image";
import { Space_Grotesk } from "next/font/google";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

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

function InftModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [api, setApi] = useState("");
  const [schedule, setSchedule] = useState("");
  const [task, setTask] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isValid = name && api && task;

  const handleSubmit = () => {
    if (!isValid) return;
    setSubmitting(true);
    // TODO: integrate actual INFT submit contract call
    setTimeout(() => {
      setSubmitting(false);
      onClose();
    }, 2000);
  };

  const inputStyle = {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(178, 132, 190, 0.3)",
    background: "rgba(50, 10, 70, 0.5)",
    color: "#F8F9FA",
    fontSize: "0.9rem",
    outline: "none",
    fontFamily: "inherit",
  };

  const labelStyle = {
    fontSize: "0.8rem",
    color: "#B284BE",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(6px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: 440,
          background: "#320A46",
          border: "1px solid rgba(196, 87, 208, 0.3)",
          borderRadius: 20,
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Modal header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "#E5B6F2" }}>
            Submit INFT
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#B284BE",
              fontSize: "1.4rem",
              cursor: "pointer",
              lineHeight: 1,
              padding: 0,
            }}
          >
            x
          </button>
        </div>

        {/* Name */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelStyle}>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter INFT name"
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your INFT"
            rows={2}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* API */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelStyle}>API</label>
          <input
            value={api}
            onChange={(e) => setApi(e.target.value)}
            placeholder="Enter API endpoint"
            style={inputStyle}
          />
        </div>

        {/* Schedule */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelStyle}>Schedule</label>
          <input
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            placeholder="e.g. every 24h, daily, weekly"
            style={inputStyle}
          />
        </div>

        {/* Task */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelStyle}>Task</label>
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Define the task for this INFT"
            rows={2}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          style={{
            padding: "14px 0",
            fontSize: "1rem",
            fontWeight: 700,
            fontFamily: "inherit",
            color: "#FFFFFF",
            background: !isValid
              ? "rgba(93, 42, 142, 0.3)"
              : "linear-gradient(135deg, #5D2A8E, #C457D0)",
            border: !isValid
              ? "1px solid rgba(178, 132, 190, 0.2)"
              : "none",
            borderRadius: 12,
            cursor: isValid ? "pointer" : "not-allowed",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            transition: "opacity 0.2s",
            opacity: submitting ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (isValid) e.currentTarget.style.opacity = "0.85";
          }}
          onMouseLeave={(e) => {
            if (isValid) e.currentTarget.style.opacity = "1";
          }}
        >
          {submitting ? "Submitting..." : "Submit INFT"}
        </button>
      </div>
    </div>
  );
}

export default function Claw() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const [showInftModal, setShowInftModal] = useState(false);

  const formattedBalance = balance
    ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol ?? "0G"}`
    : null;

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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image
            src="/logo.jpg"
            alt="0G Claw"
            width={40}
            height={40}
            style={{ borderRadius: 8 }}
          />
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
        </div>

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
          <button
            onClick={() => setShowInftModal(true)}
            style={{
              color: "#B284BE",
              background: "none",
              border: "1px solid rgba(196, 87, 208, 0.3)",
              padding: "6px 16px",
              borderRadius: 999,
              fontSize: "0.9rem",
              fontWeight: 500,
              fontFamily: "inherit",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#E5B6F2";
              e.currentTarget.style.borderColor = "rgba(196, 87, 208, 0.6)";
              e.currentTarget.style.background = "rgba(93, 42, 142, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#B284BE";
              e.currentTarget.style.borderColor = "rgba(196, 87, 208, 0.3)";
              e.currentTarget.style.background = "none";
            }}
          >
            INFT
          </button>
        </nav>

        <ConnectButton.Custom>
          {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted }) => {
            const connected = mounted && account && chain;
            return (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  ...(!mounted ? { opacity: 0, pointerEvents: "none", userSelect: "none" } : {}),
                }}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        style={{
                          padding: "10px 24px",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          fontFamily: "inherit",
                          color: "#FFFFFF",
                          background: "linear-gradient(135deg, #5D2A8E, #C457D0)",
                          border: "none",
                          borderRadius: 999,
                          cursor: "pointer",
                          letterSpacing: "0.03em",
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        style={{
                          padding: "10px 24px",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          fontFamily: "inherit",
                          color: "#FFFFFF",
                          background: "#a11",
                          border: "none",
                          borderRadius: 999,
                          cursor: "pointer",
                        }}
                      >
                        Wrong Network
                      </button>
                    );
                  }

                  return (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button
                        onClick={openChainModal}
                        style={{
                          padding: "8px 14px",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                          fontFamily: "inherit",
                          color: "#E5B6F2",
                          background: "rgba(93, 42, 142, 0.4)",
                          border: "1px solid rgba(196, 87, 208, 0.3)",
                          borderRadius: 999,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(93, 42, 142, 0.6)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(93, 42, 142, 0.4)";
                        }}
                      >
                        {chain.name}
                      </button>
                      {formattedBalance && (
                        <span
                          style={{
                            padding: "8px 14px",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: "#C457D0",
                            background: "rgba(50, 10, 70, 0.6)",
                            border: "1px solid rgba(196, 87, 208, 0.2)",
                            borderRadius: 999,
                          }}
                        >
                          {formattedBalance}
                        </span>
                      )}
                      <button
                        onClick={openAccountModal}
                        style={{
                          padding: "8px 18px",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          fontFamily: "inherit",
                          color: "#FFFFFF",
                          background: "linear-gradient(135deg, #5D2A8E, #C457D0)",
                          border: "none",
                          borderRadius: 999,
                          cursor: "pointer",
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        {account.displayName}
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </header>

      {/* Main content: lob.png far left | Chat */}
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: 24,
          padding: "24px 0",
          minHeight: 0,
          alignItems: "stretch",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: "0 12px" }}>
          <pre
            style={{
              fontFamily: "monospace",
              fontSize: "0.3rem",
              lineHeight: 1.1,
              color: "#C457D0",
              textShadow: "0 0 12px rgba(196, 87, 208, 0.5)",
              margin: 0,
              whiteSpace: "pre",
            }}
          >{`                                               @@@@@@@@@@@
                                             =@@++++*****@@
                                           @@%++++++**@@@        #@@
                                         @@+++++++**@@++=  @@@@  -==@@
                                         @@=++++=+*+@@     @@@@     @@
                                         @@+++++**@@     @@##@@     @@
                                         @@*******@@@@@@@####@@     @@
                                         @@*****###########@@       @@
                                         @@***###########@@      #@@  @@@@@@@@@
                                       **%%#############%%%    ***%%**%%%%%%%%%**
                                       @@**@@@@@@@@@@@@@@      @@+  @@         @@
                                     @@**@@:                 @@  #@@
                              @@     @@**@@:               @@  @@+
                              @@       @@**@@#           @@  @@           @@@@@@@
                         :@@  @@         @@###@@      %@@@@@@           @@+++++@@
                         :@@  @@         @@###@@      @@@@@@@           @@++++=@@
                         :@@    @@+    @@@@@@@@@@@@@@@@@@@@           @@++++*@@    @@@@@@@
                     @@- :@@      *@@@@##***********##@@@           @@++++@@#    @@#####@@
                     @@-    @@    *@@##**+++++******##@@@           @@****@@@@@@@#######@@
                       @@@    @@@@%##****+++++******##@@@           @@****##############@@
                       #%%%%  @@%%#******+++++******##@@@%%         @@****###########%%%%@
                         :@@  @@##******************##@@@@@         @@**#############@@@
                            @@##********************##@@@##@@       @@#############@@-
                            @@##******************####@@@@@**@@@@@@@**@@@@@@@@@@@@@
                         :@@@@##****************######@@@  @@*******@@
                       @@@####@@##************######@@       @@@@@@@
                       %@@####@@##************######@@       @@@@@@@
                     @@###****##@@%##******#######@@@@
                     @@###++****##%@@###########@@    @@@
                     @@@@@@@##*****##@@#######@@@@       @@@@@@
                   @@##***##@@##***####@@@@@@#    @@
                 %%##++*****##%%*######@@****+%%  **%%%%%%%
                 @@##+++****##@@#######@@    =@@    @@@@@@@
        @@@@@@@@@@@@@*******##@@#####@@         @@
        @@****++=****@@#######@@@@@@@             @@@@
          @@@@%******##@@@##@@
            @@%##**####@@@@@
            @@%##**####@@@@@
              =@@######@@@
                 @@@@##@@@
                   @@##@@@
                     @@@@@
                     =====`}</pre>
        </div>
        <ChatBox />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: "0 12px" }}>
          <pre
            style={{
              fontFamily: "monospace",
              fontSize: "0.3rem",
              lineHeight: 1.1,
              color: "#C457D0",
              textShadow: "0 0 12px rgba(196, 87, 208, 0.5)",
              margin: 0,
              whiteSpace: "pre",
            }}
          >{`                         %%%%%%%%%%%%%%%
                         %%%%%%%%%%%%%%%
                         %%%%%%%%%%%%%%%
                                        %%%%%
                                        %%%%%
                         %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                         %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                         %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                    %%%%%**********++++++++++++++++++++++++++++++++++++++++%%%%%
                    %%%%%**********++++++++++++++++++++++++++++++++++++++++%%%%%
                    %%%%%**********++++++++++++++++++++++++++++++++++++++++%%%%%
                    %%%%%**********+++++==============================+++++%%%%%
                    %%%%%**********+++++==============================+++++%%%%%
                    %%%%%**********+++++==============================+++++%%%%%
                    %%%%%**********+++++=====%%%%%==========%%%%%=====+++++%%%%%
                    %%%%%**********+++++=====%%%%%==========%%%%%=====+++++%%%%%
                    %%%%%**********+++++=====********************=====+++++%%%%%
                    %%%%%**********+++++==========%%%%%%%%%%==========+++++%%%%%
                    %%%%%**********+++++==========%%%%%%%%%%==========+++++%%%%%
                    %%%%%**********+++++==============================+++++%%%%%
                    %%%%%**********+++++==============================+++++%%%%%
                    %%%%%**********+++++==============================+++++%%%%%
                    %%%%%**********++++++++++++++++++++++++++++++++++++++++%%%%%
                    %%%%%**********++++++++++++++++++++++++++++++++++++++++%%%%%
                    %%%%%**********++++++++++++++++++++++++++++++++++++++++%%%%%
                         %%%%%****************************************%%%%%
                         %%%%%****************************************%%%%%
                         %%%%%#####***************#####*****##########%%%%%
                              %%%%%*****+++++*****#####*****#####%%%%%
                              %%%%%*****+++++*****#####*****#####%%%%%
                              %%%%%*****+++++#####*****#####*****%%%%%
                              %%%%%*****+++++#####*****#####*****%%%%%
                              %%%%%*****+++++#####*****#####*****%%%%%
                              %%%%%*****+++++++++++++++++++++++++%%%%%
                              %%%%%*****+++++++++++++++++++++++++%%%%%
                              %%%%%*****+++++++++++++++++++++++++%%%%%
                              %%%%%*****%%%%%%%%%%%%%%%%%%%%+++++%%%%%
                              %%%%%*****%%%%%%%%%%%%%%%%%%%%+++++%%%%%
                              %%%%%*****%%%%%%%%%%%%%%%%%%%%+++++%%%%%
                              %%%%%*****%%%%%          %%%%%+++++%%%%%
                              %%%%%*****%%%%%          %%%%%+++++%%%%%
                                   %%%%%                    %%%%%
                                   %%%%%                    %%%%%
                                   %%%%%                    %%%%%`}</pre>
        </div>
      </div>

      {showInftModal && <InftModal onClose={() => setShowInftModal(false)} />}
    </div>
  );
}
