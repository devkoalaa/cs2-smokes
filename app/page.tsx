import { Header } from "@/components/header"
import { MapGrid } from "@/components/map-grid"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapsService } from "@/lib/services/maps.service"
import { UsersService } from "@/lib/services/users.service"
import { BookOpen, Target, Users } from "lucide-react"

export default async function HomePage() {
  const mapsService = MapsService.getInstance()
  const usersService = UsersService.getInstance()
  const maps = await mapsService.getAllMaps()
  const usersCount = await usersService.getUsersCount()

  const totalSmokes = maps.reduce((sum, m) => sum + (m.smokesCount ?? 0), 0)

  const stats = [
    { label: "Mapas Disponíveis", value: maps.length.toString(), icon: Target },
    { label: "Smokes Totais", value: totalSmokes.toString(), icon: BookOpen },
    { label: "Usuários Ativos", value: usersCount.toString(), icon: Users },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            CS2 Smokes
          </h1>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto mb-8">
            Domine as smokes do Counter Strike 2 com tutoriais interativos.
            Aprenda as melhores posições táticas e eleve seu jogo para o próximo nível.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-card border-border hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-card-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

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
