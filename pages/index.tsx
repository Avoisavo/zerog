import dynamic from "next/dynamic";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
});

const Silk = dynamic(() => import("@/components/Silk"), { ssr: false });

export default function Home() {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", background: "#320A46" }}>
      <Silk
        speed={5}
        scale={1}
        color="#5D2A8E"
        noiseIntensity={1.5}
        rotation={0}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2.5rem",
        }}
      >
        <h1
          className={spaceGrotesk.className}
          style={{
            fontSize: "clamp(3rem, 8vw, 7rem)",
            fontWeight: 700,
            color: "#E5B6F2",
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            pointerEvents: "none",
            userSelect: "none",
            textAlign: "center",
            margin: 0,
            textShadow: [
              "0 1px 0 #B284BE",
              "0 2px 0 #A374AE",
              "0 3px 0 #94649E",
              "0 4px 0 #85548E",
              "0 5px 0 #76447E",
              "0 6px 0 #67346E",
              "0 7px 15px rgba(50, 10, 70, 0.6)",
              "0 7px 30px rgba(50, 10, 70, 0.4)",
              "0 0 40px rgba(196, 87, 208, 0.35)",
            ].join(", "),
          }}
        >
          0G Claw
        </h1>
        <button
          className={spaceGrotesk.className}
          style={{
            padding: "14px 48px",
            fontSize: "1.1rem",
            fontWeight: 500,
            color: "#E5B6F2",
            background: "rgba(93, 42, 142, 0.3)",
            border: "1px solid rgba(196, 87, 208, 0.4)",
            borderRadius: "999px",
            cursor: "pointer",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            backdropFilter: "blur(8px)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(196, 87, 208, 0.3)";
            e.currentTarget.style.borderColor = "rgba(229, 182, 242, 0.6)";
            e.currentTarget.style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(93, 42, 142, 0.3)";
            e.currentTarget.style.borderColor = "rgba(196, 87, 208, 0.4)";
            e.currentTarget.style.color = "#E5B6F2";
          }}
        >
          Start
        </button>
      </div>
    </div>
  );
}
