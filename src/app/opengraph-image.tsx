import { ImageResponse } from "next/og";
import { siteConfig } from "../config/site.config";

export const dynamic = "force-static";
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, #0b0614 0%, #130824 45%, #1c0b3d 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "80px",
        color: "white",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* Soft bright-lilac bloom in lower-right */}
      <div
        style={{
          position: "absolute",
          right: "60px",
          bottom: "60px",
          width: "360px",
          height: "360px",
          borderRadius: "100%",
          background: "radial-gradient(circle, rgba(228,208,255,0.35) 0%, transparent 70%)",
        }}
      />
      {/* Scattered color dots */}
      {[
        { x: "72%", y: "20%", c: "#d63ae0", s: 10 },
        { x: "82%", y: "35%", c: "#7b2ff7", s: 14 },
        { x: "66%", y: "55%", c: "#5ad9ff", s: 8 },
        { x: "90%", y: "70%", c: "#ffffff", s: 12 },
        { x: "78%", y: "80%", c: "#3a3aff", s: 10 },
      ].map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: d.x,
            top: d.y,
            width: d.s,
            height: d.s,
            borderRadius: "100%",
            background: d.c,
            boxShadow: `0 0 ${d.s * 2}px ${d.c}`,
          }}
        />
      ))}
      {/* Brand wordmark */}
      <div
        style={{
          display: "flex",
          fontSize: 28,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.85)",
          fontWeight: 600,
        }}
      >
        {siteConfig.shortName}
      </div>
      {/* Main message */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: "auto",
          maxWidth: "720px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 300,
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            color: "white",
          }}
        >
          Welcome to
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 112,
            fontWeight: 700,
            lineHeight: 1.05,
            color: "white",
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "28px",
            fontSize: 28,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          {siteConfig.tagline}
        </div>
      </div>
    </div>,
    size,
  );
}
