import { ImageResponse } from "next/og"
import { background, loadFonts, mapArtData } from "@/lib/og"
import { BRAND } from "@/lib/brand"

export const alt = BRAND.name
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage() {
  const [fonts, art] = await Promise.all([loadFonts(), mapArtData("mirage")])
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "Geist", color: "#fafafa", background }}>
        {art && <img src={art} width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", background: "linear-gradient(90deg, rgba(14,15,18,0.95) 0%, rgba(14,15,18,0.8) 55%, rgba(76,5,25,0.45) 100%)" }} />
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
