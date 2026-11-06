export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, Crosshair, Radar, Swords, Trophy } from "lucide-react"
import { HomeHero } from "@/components/home-hero"
import { Panel } from "@/components/kit"
import { MapGrid } from "@/components/map-grid"
import { BRAND } from "@/lib/brand"
import { rise } from "@/lib/motion"
import { MapsService } from "@/lib/services/maps.service"
import { UsersService } from "@/lib/services/users.service"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: BRAND.name, description: BRAND.description, siteName: BRAND.name, type: "website", locale: "pt_BR" },
}

// Dados estruturados para buscadores: o site e o que ele oferece.
const jsonLd = { "@context": "https://schema.org", "@type": "WebSite", name: BRAND.name, url: BRAND.url, description: BRAND.description, inLanguage: "pt-BR" }

const FEATURES: [React.ElementType, string, string][] = [
  [Swords, "Placar completo", "Rating, ADR, KAST, HS, clutches e Premier de todo mundo da partida."],
  [Radar, "Mapa de abates", "Onde você matou e morreu em cada round, sobre o radar do mapa."],
  [Trophy, "Ranking com os amigos", "Crie um grupo, mande o link e veja quem está carregando."],
  [Crosshair, "Smokes por mapa", "Granadas com vídeo e a posição exata no radar."],
]

export default async function HomePage() {
  const [maps, users] = await Promise.all([
    MapsService.getInstance().getAllMaps().catch(() => []),
    UsersService.getInstance().getUsersCount().catch(() => 0),
  ])
  const grenades = maps.reduce((sum, m) => sum + (m.smokesCount ?? 0), 0)
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <HomeHero />
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{FEATURES.map(([Icon, title, text], i) =>
      <Panel key={title} className="p-5 transition hover:-translate-y-1" style={rise(i + 2)}>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary"><Icon className="h-5 w-5" /></span>
        <h2 className="mt-4 font-bold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{text}</p>
      </Panel>)}</div>
    <section className="space-y-4 pt-2">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div><h2 className="font-display text-2xl md:text-3xl">Smokes por mapa</h2>
          <p className="mt-1 text-sm text-muted-foreground">{maps.length} mapas · {grenades} granadas com vídeo · {users} jogadores</p></div>
        <Link href="/smokes" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">Ver todos<ChevronRight className="h-4 w-4" /></Link>
      </div>
      <MapGrid limit={6} />
    </section>
  </>
}
