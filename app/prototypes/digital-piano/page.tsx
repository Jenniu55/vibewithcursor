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

// Tone.js uses browser APIs — must load client-side only to avoid HTTP 500 / SSR errors
const DigitalPianoClient = dynamic(() => import("./DigitalPianoClient"), {
  ssr: false,
  loading: () => loadingEl,
});

export default function DigitalPianoPage() {
  return <DigitalPianoClient />;
}
