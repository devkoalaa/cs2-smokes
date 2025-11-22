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
            <motion.div
              key={map.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: hoveredMapId === map.id ? 1.05 : hoveredMapId !== null ? 0.95 : 1,
                filter: hoveredMapId !== null && hoveredMapId !== map.id ? "blur(2px) grayscale(50%)" : "none",
                zIndex: hoveredMapId === map.id ? 50 : 1
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onMouseEnter={() => setHoveredMapId(map.id)}
              onMouseLeave={() => setHoveredMapId(null)}
              onClick={() => handleMapSelect(map.id)}
              className="h-full cursor-pointer"
            >
              <Card 
                className={`group relative h-full overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all duration-500 p-0 gap-0
                  ${hoveredMapId === map.id ? 'shadow-2xl shadow-primary/20 border-primary' : 'hover:border-primary/50'}
                `}
              >
                <div className="relative h-full flex flex-col">
                  {/* Image Section */}
                  <div className="relative overflow-hidden h-52">
                    <motion.div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${map.thumbnail || "/placeholder.svg"})` }}
                      animate={{ 
                        scale: hoveredMapId === map.id ? 1.15 : 1,
                        rotate: hoveredMapId === map.id ? 1 : 0
                      }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 right-3 z-10 flex gap-2">
                      <Badge className="bg-background/80 backdrop-blur-md text-foreground border border-border/50 shadow-sm">
                        {(map.smokesCount ?? 0)} smoke{(map.smokesCount ?? 0) !== 1 ? 's' : ''}
                      </Badge>
                    </div>

                    {/* Large Background Icon */}
                    <div className={`absolute -bottom-4 -right-4 text-primary/5 transition-all duration-500 transform
                      ${hoveredMapId === map.id ? 'opacity-100 scale-110 -rotate-12' : 'opacity-0'}
                    `}>
                      <MapPin className="w-32 h-32" />
                    </div>
                  </div>

                  {/* Content Section */}
                  <CardContent className="flex-1 p-6 relative z-10 flex flex-col border-t border-border/50 bg-card/50">
                    <div className="mb-3">
                      <h3 className={`text-2xl font-bold tracking-tight transition-colors duration-300 ${hoveredMapId === map.id ? 'text-primary' : ''}`}>
                        {map.displayName || map.name}
                      </h3>
                    </div>
                    
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-6 flex-1">
                        {map.description || 'Explore as melhores smokes, granadas e estratégias táticas para dominar este mapa.'}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                        <div className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider ${map.isActive ? 'text-muted-foreground' : 'text-destructive'}`}>
                          <span className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${map.isActive ? 'bg-green-400' : 'bg-red-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${map.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          </span>
                          {map.isActive ? 'Mapa Ativo' : 'Mapa Inativo'}
                        </div>
                        
                        <Button
                        size="sm"
                        className="relative overflow-hidden group/btn bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20"
                      >
                        <span className="relative z-10 flex items-center font-medium">
                          Ver Smokes 
                          <Play className={`ml-2 w-3 h-3 transition-transform ${hoveredMapId === map.id ? 'translate-x-1 scale-110' : ''}`} />
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
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
