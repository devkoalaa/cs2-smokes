export const dynamic = 'force-dynamic'
import type { Metadata } from "next"
import { Header } from "@/components/header"
import { BRAND } from "@/lib/brand"
import { MapGrid } from "@/components/map-grid"
import { Footer } from "@/components/footer"
import { MapsService } from "@/lib/services/maps.service"
import { UsersService } from "@/lib/services/users.service"
import { HomeHero } from "@/components/home-hero"
import { HomeStats } from "@/components/home-stats"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: BRAND.name, description: BRAND.description, siteName: BRAND.name, type: "website", locale: "pt_BR" },
}

// Dados estruturados para buscadores: o site e o que ele oferece.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BRAND.name,
  url: BRAND.url,
  description: BRAND.description,
  inLanguage: "pt-BR",
}

export default async function HomePage() {
  const mapsService = MapsService.getInstance()
  const usersService = UsersService.getInstance()
  const maps = await mapsService.getAllMaps()
  const usersCount = await usersService.getUsersCount()

  const totalSmokes = maps.reduce((sum, m) => sum + (m.smokesCount ?? 0), 0)

  const stats = [
    { label: "Mapas", value: maps.length.toString(), icon: "map" as const },
    { label: "Smokes", value: totalSmokes.toString(), icon: "cloudy" as const },
    { label: "Usuários", value: usersCount.toString(), icon: "users" as const },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Hero Section */}
        <HomeHero backgroundImage={maps.find((m) => m.thumbnail)?.thumbnail} />

        {/* Stats Section */}
        <HomeStats stats={stats} />

        {/* Maps Section */}
        <div id="mapas" className="mb-8 scroll-mt-24">
          <div className="mb-8">
            <h2 className="font-display text-4xl md:text-5xl leading-none mb-2">Mapas</h2>
            <p className="text-muted-foreground">Escolha um mapa para ver as smokes, flashes e molotovs.</p>
          </div>
          <MapGrid />
        </div>
      </main>
      <Footer />
    </div>
  )
}
