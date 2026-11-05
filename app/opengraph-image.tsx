import { ImageResponse } from "next/og"
import { asset, background, loadFonts } from "@/lib/og"
import { BRAND } from "@/lib/brand"

export const alt = BRAND.name
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage() {
  const [fonts, radar] = await Promise.all([loadFonts(), asset("images", "maps", "og", "mirage.png")])
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "Geist", color: "#fafafa", background }}>
        <img src={`data:image/png;base64,${radar.toString("base64")}`} width={600} height={600} style={{ position: "absolute", right: -40, top: 15, opacity: 0.22 }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px" }}>
          <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, color: BRAND.primary, fontWeight: 600 }}>COUNTER-STRIKE 2</div>
          <div style={{ display: "flex", fontFamily: "Display", fontSize: 220, lineHeight: 1, marginTop: 12 }}>CS2 HUB</div>
          <div style={{ display: "flex", fontSize: 38, marginTop: 20, color: BRAND.muted }}>{BRAND.tagline}</div>
        </div>
      </div>
    ),
    { ...size, fonts }
  )
}
