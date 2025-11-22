export const dynamic = 'force-dynamic'
import { Header } from "@/components/header"
import { MapGrid } from "@/components/map-grid"
import { Badge } from "@/components/ui/badge"
import { MapsService } from "@/lib/services/maps.service"
import { UsersService } from "@/lib/services/users.service"
import { HomeHero } from "@/components/home-hero"
import { HomeStats } from "@/components/home-stats"

export default async function HomePage() {
  const mapsService = MapsService.getInstance()
  const usersService = UsersService.getInstance()
  const maps = await mapsService.getAllMaps()
  const usersCount = await usersService.getUsersCount()

  const totalSmokes = maps.reduce((sum, m) => sum + (m.smokesCount ?? 0), 0)

  const stats = [
    { label: "Mapas Disponíveis", value: maps.length.toString(), icon: "map" as const },
    { label: "Smokes Totais", value: totalSmokes.toString(), icon: "cloudy" as const },
    { label: "Usuários Ativos", value: usersCount.toString(), icon: "users" as const },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <HomeHero />

        {/* Stats Section */}
        <HomeStats stats={stats} />

        {/* Maps Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Mapas Disponíveis</h2>
              <p className="text-muted-foreground">Selecione um mapa para começar a aprender</p>
            </div>
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
              {maps.length} Mapas
            </Badge>
          </div>
          <MapGrid />
        </div>
      </main>
    </div>
  )
}
