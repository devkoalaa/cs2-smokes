"use client"

import { LoadingSkeleton } from "@/components/loading-skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useMap } from "@/hooks/useMaps"
import { useRatings } from "@/hooks/useRatings"
import { useReports } from "@/hooks/useReports"
import { useSmokeActions, useSmokes } from "@/hooks/useSmokes"
import { Smoke } from "@/lib/services/smokes.service"
import { ArrowLeft, Clock, Flag, Play, Plus, Search, Target, ThumbsDown, ThumbsUp, Trash2, X } from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

// Importar o componente unificado dinamicamente para evitar problemas de SSR
const UnifiedMap = dynamic(() => import('./unified-map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-muted/20 rounded-lg border border-border">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-muted-foreground">Carregando mapa...</p>
      </div>
    </div>
  )
})

interface MapViewerProps {
  mapId: number
}

function buildEmbeddableVideoUrl(originalUrl: string, startSeconds?: number): string {
  try {
    const url = new URL(originalUrl)
    const hostname = url.hostname.replace(/^www\./, "")

    // Handle YouTube and youtu.be URLs
    if (hostname === "youtube.com" || hostname === "m.youtube.com" || hostname === "youtube-nocookie.com" || hostname === "youtu.be") {
      let videoId: string | null = null

      if (hostname === "youtu.be") {
        videoId = url.pathname.split("/").filter(Boolean)[0] || null
      } else if (url.pathname.startsWith("/watch")) {
        videoId = url.searchParams.get("v")
      } else if (url.pathname.startsWith("/shorts/")) {
        videoId = url.pathname.split("/")[2] || null
      } else if (url.pathname.startsWith("/embed/")) {
        videoId = url.pathname.split("/")[2] || null
      }

      if (videoId) {
        const base = `https://www.youtube-nocookie.com/embed/${videoId}`
        const params = new URLSearchParams()
        const start = Number(startSeconds)
        if (!Number.isNaN(start) && start > 0) {
          params.set("start", String(start))
        }
        const query = params.toString()
        return query ? `${base}?${query}` : base
      }
    }

    // Any other URL: return as-is
    return originalUrl
  } catch {
    return originalUrl
  }
}

export function MapViewer({ mapId }: MapViewerProps) {
  const [selectedSmoke, setSelectedSmoke] = useState<Smoke | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDifficulty, setFilterDifficulty] = useState("all")
  const [showAllMarkers, setShowAllMarkers] = useState(true)
  const [showAddSmoke, setShowAddSmoke] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newVideoUrl, setNewVideoUrl] = useState("")
  const [newTimestamp, setNewTimestamp] = useState<string>("")
  const [selectedCoords, setSelectedCoords] = useState<{ x_coord: number; y_coord: number } | null>(null)
  const [selectingOnMap, setSelectingOnMap] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const mapRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const { smokes, loading, error, refetch } = useSmokes(mapId)
  const { map, loading: mapLoading, error: mapError } = useMap(mapId)
  const { upvoteSmoke, downvoteSmoke, loading: ratingLoading } = useRatings()
  const { reportSmoke, loading: reportLoading } = useReports()
  const { isAuthenticated, user } = useAuth()
  const { createSmoke, loading: createLoading } = useSmokeActions()
  const { toast } = useToast()

  useEffect(() => {
    if (selectingOnMap && selectedCoords) {
      setSelectingOnMap(false)
      setShowAddSmoke(true)
    }
  }, [selectingOnMap, selectedCoords])

  const handleSmokeClick = (smoke: Smoke) => {
    setSelectedSmoke(smoke)
  }

  const closeModal = () => {
    setSelectedSmoke(null)
  }


  const handleUpvote = async (smokeId: number) => {
    try {
      await upvoteSmoke(smokeId)
      refetch()
    } catch (error) {
      console.error('Failed to upvote:', error)
    }
  }

  const handleDownvote = async (smokeId: number) => {
    try {
      await downvoteSmoke(smokeId)
      refetch()
    } catch (error) {
      console.error('Failed to downvote:', error)
    }
  }

  const handleReport = async (smokeId: number) => {
    if (!reportReason.trim()) return

    try {
      await reportSmoke(smokeId, { reason: reportReason })
      setReportReason("")
      setSelectedSmoke(null)
    } catch (error) {
      console.error('Failed to report:', error)
    }
  }

  const filteredSmokes = smokes.filter(smoke => {
    const matchesSearch = smoke.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading || mapLoading) {
    return <LoadingSkeleton />
  }

  if (error || mapError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Erro ao carregar dados: {error || mapError}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (!map) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Mapa não encontrado</p>
      </div>
    )
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
            {smokes.length} smokes disponíveis
          </Badge>
          <Badge variant="outline" className="border-border">
            {filteredSmokes.length} filtrados
          </Badge>
        </div>
        {isAuthenticated && (
          <Button onClick={() => setShowAddSmoke(true)} className="ml-auto">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Smoke
          </Button>
        )}
      </div>

      {/* Map Controls */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Map Container */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-foreground">
                  {map.name} - Mapa Tático
                </h3>
              </div>

              {/* Usar componente unificado para todos os mapas */}
              {map.radar ? (
                <UnifiedMap
                  radarImagePath={map.radar}
                  smokes={filteredSmokes}
                  onSmokeClick={handleSmokeClick}
                  onMapClick={selectingOnMap ? ((x, y) => setSelectedCoords({ x_coord: x, y_coord: y })) : undefined}
                  tempPoint={selectingOnMap ? (selectedCoords || undefined) : undefined}
                  height="600px"
                  className="rounded-lg border border-border"
                />
              ) : (
                <div className="flex items-center justify-center h-96 bg-muted/20 rounded-lg border border-border">
                  <div className="text-center">
                    <p className="text-muted-foreground">Radar não disponível para este mapa</p>
                    <p className="text-sm text-muted-foreground mt-2">Usando fallback...</p>
                  </div>
                </div>
              )}
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
                      <div
                        key={smoke.id}
                        className="border border-border rounded-lg p-3 hover:bg-accent transition-colors group cursor-pointer"
                        onClick={() => handleSmokeClick(smoke)}
                      >
                        <div className="flex items-start gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSmokeClick(smoke)
                            }}
                            className="p-1 h-auto"
                          >
                            <Play className="w-4 h-4 text-primary group-hover:text-accent-foreground transition-colors" />
                          </Button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-medium truncate">{smoke.title}</div>
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              Por {smoke.author.displayName}
                            </div>
                          </div>
                        </div>
                      </div>
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
        <DialogContent className="max-w-5xl bg-popover border-border" showCloseButton={false}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-popover-foreground flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                {selectedSmoke?.title}
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={closeModal} className="hover:bg-accent">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          {selectedSmoke && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="border-border">
                  Score: {selectedSmoke.score}
                </Badge>
                <Badge variant="outline" className="border-border">
                  Por {selectedSmoke.author.displayName}
                </Badge>
                <Badge variant="outline" className="border-border">
                  <Clock className="w-3 h-3 mr-1" />
                  {selectedSmoke.timestamp}s
                </Badge>
              </div>

              <div className="aspect-video">
                <iframe
                  src={buildEmbeddableVideoUrl(selectedSmoke.videoUrl, selectedSmoke.timestamp)}
                  title={selectedSmoke.title}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  loading="lazy"
                  allowFullScreen
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleUpvote(selectedSmoke.id)}
                    disabled={ratingLoading}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Upvote
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDownvote(selectedSmoke.id)}
                    disabled={ratingLoading}
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Downvote
                  </Button>
                  {isAuthenticated && user?.id === selectedSmoke.author.id && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        // TODO: Implement delete functionality
                        console.log('Delete smoke:', selectedSmoke.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar
                    </Button>
                  )}
                  {isAuthenticated && user?.id !== selectedSmoke.author.id && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setReportReason("")
                      }}
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Reportar
                    </Button>
                  )}
                </div>

                {isAuthenticated && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Motivo do reporte:</label>
                    <Input
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder="Descreva o motivo do reporte..."
                      className="border-border"
                    />
                    <Button
                      onClick={() => handleReport(selectedSmoke.id)}
                      disabled={!reportReason.trim() || reportLoading}
                      variant="destructive"
                      size="sm"
                    >
                      {reportLoading ? "Enviando..." : "Enviar Reporte"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Smoke Dialog */}
      <Dialog open={showAddSmoke} onOpenChange={(open) => {
        setShowAddSmoke(open)
        if (!open) {
          setNewTitle("")
          setNewVideoUrl("")
          setNewTimestamp("")
          setSelectedCoords(null)
        }
      }}>
        <DialogContent className="max-w-lg bg-popover border-border">
          <DialogHeader>
            <DialogTitle className="text-popover-foreground">Adicionar novo Smoke</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: CT Smoke from T Spawn" className="border-border" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL do Vídeo</label>
              <Input value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} placeholder="https://youtu.be/..." className="border-border" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Timestamp (segundos)</label>
              <Input type="number" min={0} step={1} value={newTimestamp} onChange={(e) => setNewTimestamp(e.target.value)} placeholder="Ex: 42" className="border-border" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Coordenadas</label>
              <div className="text-sm text-muted-foreground">
                {selectedCoords ? (
                  <span>X: {selectedCoords.x_coord}% • Y: {selectedCoords.y_coord}%</span>
                ) : (
                  <span>Clique no mapa para selecionar X/Y</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectingOnMap ? "default" : "outline"}
                  type="button"
                  onClick={() => {
                    setSelectingOnMap(true)
                    setShowAddSmoke(false)
                  }}
                >
                  {selectingOnMap ? 'Selecionando...' : 'Selecionar no mapa'}
                </Button>
                {selectedCoords && (
                  <Button variant="ghost" type="button" onClick={() => setSelectedCoords(null)}>Limpar</Button>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setShowAddSmoke(false)} disabled={createLoading}>Cancelar</Button>
              <Button
                type="button"
                onClick={async () => {
                  if (!newTitle.trim() || !newVideoUrl.trim()) return
                  const ts = Number.parseInt(newTimestamp, 10)
                  if (!Number.isFinite(ts) || ts <= 0) return
                  if (!selectedCoords) return
                  try {
                    await createSmoke({
                      title: newTitle.trim(),
                      videoUrl: newVideoUrl.trim(),
                      timestamp: ts,
                      x_coord: selectedCoords.x_coord,
                      y_coord: selectedCoords.y_coord,
                      mapId
                    })
                    toast({ title: "Smoke criado", description: "Seu smoke foi adicionado." })
                    setShowAddSmoke(false)
                    setNewTitle("")
                    setNewVideoUrl("")
                    setNewTimestamp("")
                    setSelectedCoords(null)
                    refetch()
                  } catch (err) {
                    const message = err instanceof Error ? err.message : 'Falha ao criar smoke'
                    toast({ title: "Erro ao criar", description: message })
                  }
                }}
                disabled={
                  createLoading ||
                  !newTitle.trim() ||
                  !newVideoUrl.trim() ||
                  !selectedCoords ||
                  !Number.isFinite(Number.parseInt(newTimestamp, 10)) ||
                  Number.parseInt(newTimestamp, 10) <= 0
                }
                className="cursor-pointer"
              >
                {createLoading ? 'Salvando...' : 'Salvar Smoke'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
