import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "CS2 Smokes Hub"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1c1030 100%)",
          color: "#fafafa",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, textTransform: "uppercase", color: "#b46cff" }}>
          Counter-Strike 2
        </div>
        <div style={{ fontSize: 96, fontWeight: 800, marginTop: 16 }}>CS2 Smokes Hub</div>
        <div style={{ fontSize: 36, marginTop: 24, color: "#a3a3a3", maxWidth: 900 }}>
          O arsenal de smokes definitivo, alimentado e validado pela comunidade.
        </div>
      </div>
    ),
    size
  )
}
