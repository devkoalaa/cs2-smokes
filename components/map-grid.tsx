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
import { useMaps } from "@/hooks/useMaps"

function MapGridContent() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  
  const { maps, loading, error } = useMaps()

  const filteredAndSortedMaps = useMemo(() => {
    if (!maps || maps.length === 0) return []
    
    let filtered = maps.filter((map) => {
      const displayName = map.displayName || map.name
      const matchesSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (map.description && map.description.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesSearch
    })

    return filtered.sort((a, b) => {
      const aName = a.displayName || a.name
      const bName = b.displayName || b.name
      switch (sortBy) {
        case "name":
          return aName.localeCompare(bName)
        case "smokes":
          return (b.smokesCount ?? 0) - (a.smokesCount ?? 0)
        case "difficulty":
          return 0 // TODO: Add difficulty when available
        case "popularity":
        default:
          return aName.localeCompare(bName)
      }
    })
  }, [maps, searchTerm, filterCategory, sortBy])

  const handleMapSelect = (mapId: number) => {
    router.push(`/map/${mapId}`)
  }

  if (loading) {
    return <MapGridSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Erro ao carregar mapas: {error}</p>
      </div>
    )
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
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px] border-border">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
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
                src={map.thumbnail || "/placeholder.svg"}
                alt={map.displayName || map.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
              <div className="absolute top-3 right-3 flex gap-2">
                <Badge className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm font-medium shadow-lg">
                  {(map.smokesCount ?? 0)} smoke{(map.smokesCount ?? 0) !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                    {map.displayName || map.name}
                  </h3>
                </div>
                <p className="text-muted-foreground mb-4 text-pretty line-clamp-2">
                  {map.description || 'Mapa do Counter-Strike 2'}
                </p>
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
