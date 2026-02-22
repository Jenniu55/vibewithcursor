"use client";

import dynamic from "next/dynamic";

const loadingEl = (
  <div
    style={{
      padding: "2rem",
      textAlign: "center",
      fontFamily: "system-ui",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <p style={{ color: "#666" }}>Loading piano…</p>
  </div>
);

const DigitalPianoClient = dynamic(
  () => import("./prototypes/digital-piano/DigitalPianoClient"),
  { ssr: false, loading: () => loadingEl }
);

export default function Home() {
  return <DigitalPianoClient />;
}
