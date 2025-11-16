"use client"

import { LoadingSkeleton } from "@/components/loading-skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useMap } from "@/hooks/useMaps"
import { useRatings } from "@/hooks/useRatings"
import { useReports } from "@/hooks/useReports"
import { useSmokeActions, useSmokes } from "@/hooks/useSmokes"
import { Smoke, SmokeType } from "@/lib/services/smokes.service"
import { ArrowDown, ArrowLeft, ArrowUp, Check, Clock, Flag, Play, Plus, Search, ThumbsUp, Trash2, User, X } from "lucide-react"
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
        params.set("autoplay", "1")
        params.set("rel", "0")
        params.set("modestbranding", "1")
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
  const [filterType, setFilterType] = useState<string>("all")
  const [showAddSmoke, setShowAddSmoke] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newVideoUrl, setNewVideoUrl] = useState("")
  const [newTimestamp, setNewTimestamp] = useState<string>("")
  const [newType, setNewType] = useState<SmokeType>(SmokeType.SMOKE)
  const [selectedCoords, setSelectedCoords] = useState<{ x_coord: number; y_coord: number } | null>(null)
  const [selectingOnMap, setSelectingOnMap] = useState(false)
  const [hoveredSmokeId, setHoveredSmokeId] = useState<number | null>(null)
  const [reportReason, setReportReason] = useState("")
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [localScores, setLocalScores] = useState<Record<number, number>>({})
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [reportedSmokes, setReportedSmokes] = useState<Set<number>>(new Set())
  const mapRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const { smokes, loading, error, refetch } = useSmokes(mapId)
  const { map, loading: mapLoading, error: mapError } = useMap(mapId)
  const { upvoteSmoke, downvoteSmoke, getUserVote, loading: ratingLoading } = useRatings()
  const { getReportsStatusBatch, reportSmoke, loading: reportLoading } = useReports()
  const { isAuthenticated, user } = useAuth()
  const { createSmoke, deleteSmoke, loading: createLoading } = useSmokeActions()
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

  const getCurrentScore = (smokeId: number, originalScore: number) => {
    return localScores[smokeId] !== undefined ? localScores[smokeId] : originalScore
  }

  // Clear local scores when smokes are refetched
  useEffect(() => {
    setLocalScores({})
  }, [smokes])

  // Check report status for all smokes when component loads or user changes
  useEffect(() => {
    if (isAuthenticated && user?.token && smokes.length > 0) {
      let isCancelled = false;

      const checkReportStatuses = async () => {
        try {
          const smokeIds = smokes.map(smoke => smoke.id)
          const statuses = await getReportsStatusBatch(smokeIds)

          if (!isCancelled) {
            const newReportedSmokes = new Set<number>()
            statuses.forEach(status => {
              if (status.hasReported) {
                newReportedSmokes.add(status.smokeId)
              }
            })
            setReportedSmokes(newReportedSmokes)
          }
        } catch (error) {
          console.warn('Failed to check report statuses:', error)
        }
      }

      checkReportStatuses()

      return () => {
        isCancelled = true;
      }
    }
  }, [isAuthenticated, user?.token, smokes, getReportsStatusBatch])


  const handleUpvote = async (smokeId: number) => {
    if (!isAuthenticated) {
      console.log('User not authenticated, showing toast')
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para votar em smokes.",
        variant: "destructive",
      })
      return
    }

    try {
      const currentVote = getUserVote(smokeId)
      const originalScore = smokes.find(s => s.id === smokeId)?.score || 0
      const currentScore = getCurrentScore(smokeId, originalScore)

      await upvoteSmoke(smokeId)

      // Update local score
      let newScore = currentScore
      if (currentVote === 1) {
        // Removing upvote
        newScore = currentScore - 1
      } else if (currentVote === -1) {
        // Changing from downvote to upvote
        newScore = currentScore + 2
      } else {
        // New upvote
        newScore = currentScore + 1
      }

      setLocalScores(prev => ({
        ...prev,
        [smokeId]: newScore
      }))

      toast({
        title: "Voto registrado!",
        description: "Seu upvote foi registrado com sucesso.",
      })
    } catch (error) {
      console.error('Failed to upvote:', error)
      toast({
        title: "Erro ao votar",
        description: "Não foi possível registrar seu voto. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleDownvote = async (smokeId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para votar em smokes.",
        variant: "destructive",
      })
      return
    }

    try {
      const currentVote = getUserVote(smokeId)
      const originalScore = smokes.find(s => s.id === smokeId)?.score || 0
      const currentScore = getCurrentScore(smokeId, originalScore)

      await downvoteSmoke(smokeId)

      // Update local score
      let newScore = currentScore
      if (currentVote === -1) {
        // Removing downvote
        newScore = currentScore + 1
      } else if (currentVote === 1) {
        // Changing from upvote to downvote
        newScore = currentScore - 2
      } else {
        // New downvote
        newScore = currentScore - 1
      }

      setLocalScores(prev => ({
        ...prev,
        [smokeId]: newScore
      }))

      toast({
        title: "Voto registrado!",
        description: "Seu downvote foi registrado com sucesso.",
      })
    } catch (error) {
      console.error('Failed to downvote:', error)
      toast({
        title: "Erro ao votar",
        description: "Não foi possível registrar seu voto. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleReport = async (smokeId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para reportar smokes.",
        variant: "destructive",
      })
      return
    }

    if (!reportReason.trim()) return

    try {
      await reportSmoke(smokeId, { reason: reportReason })
      setReportedSmokes(prev => new Set([...prev, smokeId]))
      setReportReason("")
      setShowReportDialog(false)
      setSelectedSmoke(null)
      toast({
        title: "Reporte enviado!",
        description: "Seu reporte foi enviado com sucesso.",
      })
    } catch (error) {
      console.error('Failed to report:', error)
      toast({
        title: "Erro ao reportar",
        description: error instanceof Error ? error.message : "Não foi possível enviar o reporte. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSmoke = async (smokeId: number) => {
    try {
      await deleteSmoke(smokeId)
      toast({
        title: "Sucesso",
        description: "Smoke excluída com sucesso!",
      })
      refetch()
      setConfirmingDelete(false)
      setSelectedSmoke(null)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir smoke. Tente novamente.",
        variant: "destructive",
      })
      setConfirmingDelete(false)
    }
  }

  const handleDeleteClick = () => {
    if (confirmingDelete) {
      // Se já está confirmando, executa a exclusão
      if (selectedSmoke) {
        handleDeleteSmoke(selectedSmoke.id)
      }
    } else {
      // Primeiro clique: ativa o modo de confirmação
      setConfirmingDelete(true)
      // Auto-reset após 3 segundos se não confirmar
      setTimeout(() => {
        setConfirmingDelete(false)
      }, 3000)
    }
  }

  const filteredSmokes = smokes.filter(smoke => {
    const matchesSearch = smoke.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || smoke.type === filterType
    return matchesSearch && matchesType
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
                  highlightedSmokeId={hoveredSmokeId}
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
            <div className="w-full lg:w-80 h-[600px] flex flex-col space-y-4 min-h-0">
              <Tabs defaultValue="smokes" className="w-full flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="smokes">Smokes</TabsTrigger>
                  <TabsTrigger value="filters">Filtros</TabsTrigger>
                </TabsList>

                <TabsContent value="smokes" className="flex-1 flex flex-col min-h-0 space-y-4">
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Buscar smokes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto scrollbar-smokes pr-1 min-h-0">
                    {filteredSmokes.map((smoke) => (
                      <div
                        key={smoke.id}
                        className="border border-border rounded-lg p-3 hover:bg-accent transition-colors group cursor-pointer"
                        onClick={() => handleSmokeClick(smoke)}
                        onMouseEnter={() => setHoveredSmokeId(smoke.id)}
                        onMouseLeave={() => setHoveredSmokeId((prev) => (prev === smoke.id ? null : prev))}
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
                            onMouseEnter={() => setHoveredSmokeId(smoke.id)}
                            onMouseLeave={() => setHoveredSmokeId((prev) => (prev === smoke.id ? null : prev))}
                          >
                            <Play className="w-4 h-4 text-primary group-hover:text-accent-foreground transition-colors" />
                          </Button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-medium truncate">{smoke.title}</div>
                              <Badge
                                variant="outline"
                                className={`text-xs ${smoke.type === SmokeType.SMOKE ? 'border-blue-500 text-blue-600' :
                                    smoke.type === SmokeType.BANG ? 'border-orange-500 text-orange-600' :
                                      smoke.type === SmokeType.MOLOTOV ? 'border-red-500 text-red-600' :
                                        'border-green-500 text-green-600'
                                  }`}
                              >
                                {smoke.type === SmokeType.SMOKE ? '💨' :
                                  smoke.type === SmokeType.BANG ? '💥' :
                                    smoke.type === SmokeType.MOLOTOV ? '🔥' :
                                      '📋'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                              <div className="flex items-center gap-1 truncate flex-1 mr-2">
                                <User className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{smoke.author.displayName}</span>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                  <ThumbsUp className="w-3 h-3" />
                                  {(() => {
                                    const currentScore = getCurrentScore(smoke.id, smoke.score)
                                    return currentScore > 0 ? `+${currentScore}` : currentScore
                                  })()}
                                </Badge>
                                {getUserVote(smoke.id) && (
                                  <Badge
                                    variant={getUserVote(smoke.id) === 1 ? "default" : "destructive"}
                                    className="text-xs"
                                  >
                                    {getUserVote(smoke.id) === 1 ? '↑' : '↓'}
                                  </Badge>
                                )}
                              </div>
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
                        Tipo
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: "all", label: "Todos" },
                          { value: SmokeType.SMOKE, label: "💨 Smoke" },
                          { value: SmokeType.BANG, label: "💥 Flashbang" },
                          { value: SmokeType.MOLOTOV, label: "🔥 Molotov" },
                          { value: SmokeType.STRATEGY, label: "📋 Estratégia" },
                        ].map((type) => (
                          <Button
                            key={type.value}
                            variant={filterType === type.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterType(type.value)}
                            className="w-full justify-start"
                          >
                            {type.label}
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
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {(() => {
                      const currentScore = getCurrentScore(selectedSmoke.id, selectedSmoke.score)
                      return currentScore > 0 ? `+${currentScore}` : currentScore
                    })()}
                  </Badge>
                </Badge>
                <Badge variant="outline" className="border-border flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {selectedSmoke.author.displayName}
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={getUserVote(selectedSmoke.id) === 1 ? "default" : "outline"}
                      onClick={() => handleUpvote(selectedSmoke.id)}
                      disabled={ratingLoading}
                      size="icon"
                      className={`${getUserVote(selectedSmoke.id) === 1
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : ''
                        }`}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={getUserVote(selectedSmoke.id) === -1 ? "default" : "outline"}
                      onClick={() => handleDownvote(selectedSmoke.id)}
                      disabled={ratingLoading}
                      size="icon"
                      className={`${getUserVote(selectedSmoke.id) === -1
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : ''
                        }`}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAuthenticated && user?.id === selectedSmoke.author.id && (
                      <Button
                        variant={confirmingDelete ? "default" : "destructive"}
                        onClick={handleDeleteClick}
                        size={confirmingDelete ? "default" : "icon"}
                        className={`transition-all duration-300 ${confirmingDelete
                            ? "px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                            : ""
                          }`}
                      >
                        {confirmingDelete ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Apagar?
                          </>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    {isAuthenticated && user?.id !== selectedSmoke.author.id && !reportedSmokes.has(selectedSmoke.id) && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setReportReason("")
                          setShowReportDialog(true)
                        }}
                        size="icon"
                        className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                      >
                        <Flag className="w-4 h-4" />
                      </Button>
                    )}
                    {isAuthenticated && user?.id !== selectedSmoke.author.id && reportedSmokes.has(selectedSmoke.id) && (
                      <Button
                        variant="outline"
                        size="icon"
                        disabled
                        className="bg-gray-500 text-white border-gray-500 cursor-not-allowed"
                        title="Você já reportou esta smoke"
                      >
                        <Flag className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {isAuthenticated && showReportDialog && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Motivo do reporte:</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowReportDialog(false)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          if (selectedSmoke && reportReason.trim()) {
                            handleReport(selectedSmoke.id)
                          }
                        }
                      }}
                      placeholder="Descreva o motivo do reporte..."
                      className=""
                    />
                    <Button
                      type="button"
                      onClick={() => selectedSmoke && handleReport(selectedSmoke.id)}
                      disabled={!reportReason.trim() || reportLoading || !selectedSmoke}
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
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: CT Smoke from T Spawn" className="" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL do Vídeo</label>
              <Input value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} placeholder="https://youtu.be/..." className="" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Timestamp do momento da smoke (segundos)</label>
              <Input type="number" min={0} step={1} value={newTimestamp} onChange={(e) => setNewTimestamp(e.target.value)} placeholder="Ex: 42" className="hide-number-input-arrows" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={newType} onValueChange={(value) => setNewType(value as SmokeType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SmokeType.SMOKE}>💨 Smoke</SelectItem>
                  <SelectItem value={SmokeType.BANG}>💥 Flashbang</SelectItem>
                  <SelectItem value={SmokeType.MOLOTOV}>🔥 Molotov</SelectItem>
                  <SelectItem value={SmokeType.STRATEGY}>📋 Estratégia</SelectItem>
                </SelectContent>
              </Select>
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
                    setSelectedCoords(null)
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
                      type: newType,
                      x_coord: selectedCoords.x_coord,
                      y_coord: selectedCoords.y_coord,
                      mapId
                    })
                    toast({ title: "Smoke criado", description: "Seu smoke foi adicionado." })
                    setShowAddSmoke(false)
                    setNewTitle("")
                    setNewVideoUrl("")
                    setNewTimestamp("")
                    setNewType(SmokeType.SMOKE)
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
