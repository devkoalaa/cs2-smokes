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
import { motion, AnimatePresence } from "framer-motion"
import { MapCard } from "@/components/map-card"

function MapGridContent() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  
  const [hoveredMapId, setHoveredMapId] = useState<number | null>(null)
  
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
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredAndSortedMaps.map((map, index) => (
            <MapCard
              key={map.id}
              map={map}
              isHovered={hoveredMapId === map.id}
              onMouseEnter={() => setHoveredMapId(map.id)}
              onMouseLeave={() => setHoveredMapId(null)}
              onClick={() => handleMapSelect(map.id)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

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
