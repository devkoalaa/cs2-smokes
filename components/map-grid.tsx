"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Play, Search, Filter, Star, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useMemo, Suspense } from "react"
import { MapGridSkeleton } from "@/components/loading-skeleton"

const maps = [
  {
    id: "dust2",
    name: "Dust II",
    description: "O mapa mais icônico do Counter Strike",
    image: "/dust2-counter-strike-map-desert.jpg",
    smokesCount: 12,
    difficulty: "Médio",
    popularity: 5,
    category: "Clássico",
  },
  {
    id: "mirage",
    name: "Mirage",
    description: "Mapa equilibrado com múltiplas rotas",
    image: "/mirage-counter-strike-map-middle-east.jpg",
    smokesCount: 10,
    difficulty: "Fácil",
    popularity: 5,
    category: "Competitivo",
  },
  {
    id: "inferno",
    name: "Inferno",
    description: "Mapa urbano com passagens estreitas",
    image: "/inferno-counter-strike-map-italian-village.jpg",
    smokesCount: 8,
    difficulty: "Difícil",
    popularity: 4,
    category: "Tático",
  },
  {
    id: "cache",
    name: "Cache",
    description: "Mapa industrial com controle de meio",
    image: "/cache-counter-strike-map-industrial-facility.jpg",
    smokesCount: 9,
    difficulty: "Médio",
    popularity: 3,
    category: "Industrial",
  },
  {
    id: "overpass",
    name: "Overpass",
    description: "Mapa vertical com múltiplos níveis",
    image: "/overpass-counter-strike-map-urban-bridge.jpg",
    smokesCount: 11,
    difficulty: "Difícil",
    popularity: 4,
    category: "Vertical",
  },
  {
    id: "vertigo",
    name: "Vertigo",
    description: "Mapa em arranha-céu com altura extrema",
    image: "/vertigo-counter-strike-map-skyscraper-construction.jpg",
    smokesCount: 7,
    difficulty: "Médio",
    popularity: 3,
    category: "Vertical",
  },
]

function MapGridContent() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [sortBy, setSortBy] = useState("popularity")

  const filteredAndSortedMaps = useMemo(() => {
    let filtered = maps.filter((map) => {
      const matchesSearch = map.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          map.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === "all" || map.category === filterCategory
      return matchesSearch && matchesCategory
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "smokes":
          return b.smokesCount - a.smokesCount
        case "difficulty":
          const difficultyOrder = { "Fácil": 1, "Médio": 2, "Difícil": 3 }
          return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - difficultyOrder[b.difficulty as keyof typeof difficultyOrder]
        case "popularity":
        default:
          return b.popularity - a.popularity
      }
    })
  }, [searchTerm, filterCategory, sortBy])

  const handleMapSelect = (mapId: string) => {
    router.push(`/map/${mapId}`)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Fácil":
        return "bg-green-600 text-white border-green-600 shadow-lg"
      case "Médio":
        return "bg-yellow-600 text-white border-yellow-600 shadow-lg"
      case "Difícil":
        return "bg-red-600 text-white border-red-600 shadow-lg"
      default:
        return "bg-gray-600 text-white border-gray-600 shadow-lg"
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar mapas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-border focus:ring-primary"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[180px] border-border">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="Clássico">Clássico</SelectItem>
            <SelectItem value="Competitivo">Competitivo</SelectItem>
            <SelectItem value="Tático">Tático</SelectItem>
            <SelectItem value="Industrial">Industrial</SelectItem>
            <SelectItem value="Vertical">Vertical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px] border-border">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">Popularidade</SelectItem>
            <SelectItem value="name">Nome</SelectItem>
            <SelectItem value="smokes">Número de Smokes</SelectItem>
            <SelectItem value="difficulty">Dificuldade</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredAndSortedMaps.length} mapa{filteredAndSortedMaps.length !== 1 ? 's' : ''} encontrado{filteredAndSortedMaps.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Maps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedMaps.map((map, index) => (
          <Card 
            key={map.id} 
            className="group hover:shadow-xl transition-all duration-300 bg-card border-border hover:border-primary/50 overflow-hidden p-0"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative overflow-hidden h-48">
              <img
                src={map.image || "/placeholder.svg"}
                alt={map.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
              <div className="absolute top-3 right-3 flex gap-2">
                <Badge className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm font-medium shadow-lg">
                  {map.smokesCount} smokes
                </Badge>
                <Badge className={`${getDifficultyColor(map.difficulty)} px-2 py-1 rounded-md text-sm font-medium border`}>
                  {map.difficulty}
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < map.popularity ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                    {map.name}
                  </h3>
                  <Badge variant="outline" className="text-xs border-border">
                    {map.category}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4 text-pretty line-clamp-2">{map.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Mapa Ativo</span>
                  </div>
                  <Button
                    onClick={() => handleMapSelect(map.id)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground group-hover:scale-105 transition-transform"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Ver Smokes
                  </Button>
                </div>
              </CardContent>
            </Card>
        ))}
      </div>

      {filteredAndSortedMaps.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum mapa encontrado</h3>
          <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
        </div>
      )}
    </div>
  )
}

export function MapGrid() {
  return (
    <Suspense fallback={<MapGridSkeleton />}>
      <MapGridContent />
    </Suspense>
  )
}
