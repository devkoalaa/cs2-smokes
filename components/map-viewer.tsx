"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Play, X, Search, ZoomIn, ZoomOut, RotateCcw, Star, Clock, Target, Filter } from "lucide-react"
import { useRouter } from "next/navigation"

interface Smoke {
  id: number
  name: string
  position: { x: number; y: number }
  videoUrl: string
  description: string
  difficulty?: "Fácil" | "Médio" | "Difícil"
  category?: string
  duration?: string
}

interface Map {
  name: string
  description: string
  image: string
  smokes: Smoke[]
}

interface MapViewerProps {
  map: Map
}

export function MapViewer({ map }: MapViewerProps) {
  const [selectedSmoke, setSelectedSmoke] = useState<Smoke | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDifficulty, setFilterDifficulty] = useState("all")
  const [zoom, setZoom] = useState(1)
  const [showAllMarkers, setShowAllMarkers] = useState(true)
  const mapRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleSmokeClick = (smoke: Smoke) => {
    setSelectedSmoke(smoke)
  }

  const closeModal = () => {
    setSelectedSmoke(null)
  }

  const resetZoom = () => {
    setZoom(1)
  }

  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2))
  }

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5))
  }

  const filteredSmokes = map.smokes.filter(smoke => {
    const matchesSearch = smoke.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         smoke.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = filterDifficulty === "all" || smoke.difficulty === filterDifficulty
    return matchesSearch && matchesDifficulty
  })

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "Fácil":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Médio":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Difícil":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="outline" onClick={() => router.back()} className="border-border hover:bg-accent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
            {map.smokes.length} smokes disponíveis
          </Badge>
          <Badge variant="outline" className="border-border">
            {filteredSmokes.length} filtrados
          </Badge>
        </div>
      </div>

      {/* Map Controls */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Map Container */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-foreground">
                  Mapa Tático - {map.name}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={zoomOut}
                    disabled={zoom <= 0.5}
                    className="border-border hover:bg-accent"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={zoomIn}
                    disabled={zoom >= 2}
                    className="border-border hover:bg-accent"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetZoom}
                    className="border-border hover:bg-accent"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div 
                ref={mapRef}
                className="relative overflow-hidden rounded-lg border border-border bg-muted/20"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
              >
                <img
                  src={map.image || "/placeholder.svg"}
                  alt={`Mapa ${map.name}`}
                  className="w-full h-auto"
                />

                {/* Smoke markers */}
                {showAllMarkers && filteredSmokes.map((smoke) => (
                  <button
                    key={smoke.id}
                    onClick={() => handleSmokeClick(smoke)}
                    className="absolute w-8 h-8 bg-primary hover:bg-primary/80 rounded-full border-2 border-primary-foreground shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center group"
                    style={{
                      left: `${smoke.position.x}%`,
                      top: `${smoke.position.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    title={smoke.name}
                  >
                    <Play className="w-4 h-4 text-primary-foreground" />
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      {smoke.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Controls Panel */}
            <div className="w-full lg:w-80 space-y-4">
              <Tabs defaultValue="smokes" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="smokes">Smokes</TabsTrigger>
                  <TabsTrigger value="filters">Filtros</TabsTrigger>
                </TabsList>
                
                <TabsContent value="smokes" className="space-y-4">
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Buscar smokes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-border focus:ring-primary"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant={showAllMarkers ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowAllMarkers(!showAllMarkers)}
                        className="flex-1"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        {showAllMarkers ? "Ocultar" : "Mostrar"} Marcadores
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredSmokes.map((smoke) => (
                      <Button
                        key={smoke.id}
                        variant="outline"
                        onClick={() => handleSmokeClick(smoke)}
                        className="w-full justify-start h-auto p-3 border-border hover:bg-accent group"
                      >
                        <Play className="w-4 h-4 mr-3 text-primary group-hover:scale-110 transition-transform" />
                        <div className="text-left flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-medium">{smoke.name}</div>
                            {smoke.difficulty && (
                              <Badge className={`${getDifficultyColor(smoke.difficulty)} text-xs border`}>
                                {smoke.difficulty}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {smoke.description}
                          </div>
                          {smoke.duration && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {smoke.duration}
                            </div>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>

                  {filteredSmokes.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
                        <Search className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Nenhum smoke encontrado</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="filters" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-card-foreground mb-2 block">
                        Dificuldade
                      </label>
                      <div className="space-y-2">
                        {["all", "Fácil", "Médio", "Difícil"].map((difficulty) => (
                          <Button
                            key={difficulty}
                            variant={filterDifficulty === difficulty ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterDifficulty(difficulty)}
                            className="w-full justify-start"
                          >
                            {difficulty === "all" ? "Todas" : difficulty}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Modal */}
      <Dialog open={!!selectedSmoke} onOpenChange={closeModal}>
        <DialogContent className="max-w-5xl bg-popover border-border">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-popover-foreground flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                {selectedSmoke?.name}
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={closeModal} className="hover:bg-accent">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          {selectedSmoke && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                {selectedSmoke.difficulty && (
                  <Badge className={`${getDifficultyColor(selectedSmoke.difficulty)} border`}>
                    {selectedSmoke.difficulty}
                  </Badge>
                )}
                {selectedSmoke.duration && (
                  <Badge variant="outline" className="border-border">
                    <Clock className="w-3 h-3 mr-1" />
                    {selectedSmoke.duration}
                  </Badge>
                )}
              </div>
              
              <div className="aspect-video">
                <iframe
                  src={selectedSmoke.videoUrl}
                  title={selectedSmoke.name}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-popover-foreground">Descrição:</h4>
                <p className="text-popover-foreground">{selectedSmoke.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
