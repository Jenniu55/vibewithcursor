/**
 * Shown while the digital piano page (and its client bundle) is loading.
 * Ensures the route /prototypes/digital-piano is recognized and shows feedback.
 */
export default function DigitalPianoLoading() {
  return (
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
        gap: "1rem",
      }}
    >
      <p style={{ color: "#666" }}>Loading piano…</p>
    </div>
  );
}
