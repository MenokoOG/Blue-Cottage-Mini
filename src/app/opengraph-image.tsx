import { ImageResponse } from "next/og";

/**
 * The link-preview card (Open Graph and Twitter), drawn at build time.
 * Colours are the Blue Cottage theme tokens from globals.css.
 */
export const alt = "Blue Cottage Mini: A Tour of ITF Taekwon-Do";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(160deg, #1b3550 0%, #12263a 55%, #0b1a29 100%)",
          color: "#f3f1ea",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 8,
            color: "#83a8ca",
            textTransform: "uppercase",
          }}
        >
          24 patterns · Chang-Hon · ITF
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 700, lineHeight: 1.05 }}>
            Blue Cottage Mini
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              color: "#a6c2dc",
            }}
          >
            A Tour of ITF Taekwon-Do
          </div>
          <div
            style={{ display: "flex", width: 120, height: 6, background: "#83a8ca", marginTop: 32 }}
          />
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#c4d3e2" }}>
          One Master Instructor · 6 belt agents · 24 pattern agents · every source cited
        </div>
      </div>
    ),
    size,
  );
}
