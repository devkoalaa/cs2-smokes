"use client"

import { LoadingSkeleton } from "@/components/loading-skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useMap } from "@/hooks/useMaps"
import { useRatings } from "@/hooks/useRatings"
import { useReports } from "@/hooks/useReports"
import { useSmokeActions, useSmokes } from "@/hooks/useSmokes"
import { Smoke, SmokeType } from "@/lib/services/smokes.service"
import { ArrowDown, ArrowLeft, ArrowUp, BookOpen, Check, Clock, Cloudy, Flag, Flame, Play, Plus, Search, Sparkles, ThumbsUp, Trash2, User, X, Share2, ArrowUpCircle } from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OtherMaps } from "./other-maps"

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
  const [newTimestamp, setNewTimestamp] = useState<string>("1")
  const [newType, setNewType] = useState<SmokeType>(SmokeType.SMOKE)
  const [selectedCoords, setSelectedCoords] = useState<{ x_coord: number; y_coord: number } | null>(null)
  const [selectingOnMap, setSelectingOnMap] = useState(false)
  const [hoveredSmokeId, setHoveredSmokeId] = useState<number | null>(null)
  const [reportReason, setReportReason] = useState("")
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [localScores, setLocalScores] = useState<Record<number, number>>({})
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [reportedSmokes, setReportedSmokes] = useState<Set<number>>(new Set())
  const [selectedFloor, setSelectedFloor] = useState<string>('upper') // 'upper' ou 'lower'
  const mapRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showBackToTop, setShowBackToTop] = useState(false)

  const { smokes, loading, error, refetch } = useSmokes(mapId)
  const { map, loading: mapLoading, error: mapError } = useMap(mapId)
  const { upvoteSmoke, downvoteSmoke, getUserVote, loading: ratingLoading } = useRatings()
  const { getReportsStatusBatch, reportSmoke, loading: reportLoading } = useReports()
  const { isAuthenticated, user } = useAuth()
  const { createSmoke, deleteSmoke, loading: createLoading } = useSmokeActions()
  const { toast } = useToast()

  // Deep linking effect
  useEffect(() => {
    const smokeId = searchParams.get('smokeId')
    if (smokeId && smokes.length > 0) {
      const smoke = smokes.find(s => s.id === Number(smokeId))
      if (smoke) {
        setSelectedSmoke(smoke)
      }
    }
  }, [searchParams, smokes])

  // Update URL when smoke is selected/deselected
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (selectedSmoke) {
      params.set('smokeId', selectedSmoke.id.toString())
    } else {
      params.delete('smokeId')
    }
    
    // Update URL without full page reload
    const queryString = params.toString()
    const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl)
  }, [selectedSmoke, searchParams])

  // Scroll handler for back to top button
  const handleScroll = useCallback(() => {
    if (listRef.current) {
      setShowBackToTop(listRef.current.scrollTop > 300)
    }
  }, [])

  useEffect(() => {
    const listElement = listRef.current
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll)
      return () => listElement.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const scrollToTop = () => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleCopyLink = () => {
    if (selectedSmoke) {
      const url = `${window.location.origin}${window.location.pathname}?smokeId=${selectedSmoke.id}`
      navigator.clipboard.writeText(url)
      toast({
        title: "Link copiado!",
        description: "O link para esta smoke foi copiado para a área de transferência.",
      })
    }
  }

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
    // Filtrar por andar se o mapa tiver múltiplos andares
    const matchesFloor = !map?.radarLower || smoke.floor === selectedFloor || (!smoke.floor && selectedFloor === 'upper')
    return matchesSearch && matchesType && matchesFloor
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
                {/* Toggle de andar para mapas com múltiplos andares */}
                {map.radarLower && (
                  <div className="flex items-center gap-3 bg-card border border-border/50 p-1.5 rounded-xl shadow-sm">
                    <span className="text-xs font-medium text-muted-foreground ml-2">Nível</span>
                    <div className="relative flex bg-muted/40 p-1 rounded-lg">
                      {(['upper', 'lower'] as const).map((floor) => (
                        <button
                          key={floor}
                          onClick={() => setSelectedFloor(floor)}
                          className={`
                            cursor-pointer relative flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 z-10
                            ${selectedFloor === floor ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}
                          `}
                        >
                          {selectedFloor === floor && (
                            <motion.div
                              layoutId="active-floor-indicator"
                              className="absolute inset-0 bg-background shadow-sm border border-border/50 rounded-md -z-10"
                              initial={false}
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                          )}
                          <span className="flex items-center gap-2">
                            {floor === 'upper' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                            {floor === 'upper' ? 'Superior' : 'Inferior'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Usar componente unificado para todos os mapas */}
              {map.radar ? (
                <UnifiedMap
                  key={`${map.id}-${selectedFloor}`}
                  radarImagePath={map.radarLower && selectedFloor === 'lower' ? map.radarLower : map.radar}
                  smokes={filteredSmokes}
                  onSmokeClick={handleSmokeClick}
                  onMapClick={selectingOnMap ? ((x, y) => setSelectedCoords({ x_coord: x, y_coord: y })) : undefined}
                  tempPoint={selectingOnMap ? (selectedCoords || undefined) : undefined}
                  highlightedSmokeId={hoveredSmokeId}
                  height="600px"
                  className="rounded-lg border border-border"
                  floor={map.radarLower ? selectedFloor : undefined}
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
            <div className="w-full lg:w-96 h-[600px] flex flex-col space-y-4 min-h-0">
              <div className="w-full flex-1 flex flex-col min-h-0 space-y-4">
                {/* Header */}
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-card-foreground">Smokes</h2>
                  
                  {/* Filter Icons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant={filterType === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterType("all")}
                      className="text-base"
                      title="Todos"
                      asChild
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Todos
                      </motion.button>
                    </Button>
                    <Button
                      variant={filterType === SmokeType.SMOKE ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterType(SmokeType.SMOKE)}
                      className="text-base"
                      title="Smoke"
                      asChild
                    >
                       <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Cloudy className="w-5 h-5" />
                      </motion.button>
                    </Button>
                    <Button
                      variant={filterType === SmokeType.BANG ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterType(SmokeType.BANG)}
                      className="text-base"
                      title="Flashbang"
                      asChild
                    >
                       <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Sparkles className="w-5 h-5" />
                      </motion.button>
                    </Button>
                    <Button
                      variant={filterType === SmokeType.MOLOTOV ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterType(SmokeType.MOLOTOV)}
                      className="text-base"
                      title="Molotov"
                      asChild
                    >
                       <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Flame className="w-5 h-5" />
                      </motion.button>
                    </Button>
                    <Button
                      variant={filterType === SmokeType.STRATEGY ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterType(SmokeType.STRATEGY)}
                      className="text-base"
                      title="Estratégia"
                      asChild
                    >
                       <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <BookOpen className="w-5 h-5" />
                      </motion.button>
                    </Button>
                  </div>

                  {/* Search */}
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

                <div 
                  ref={listRef}
                  className="space-y-2 flex-1 overflow-y-auto overflow-x-hidden scrollbar-smokes pr-1 min-h-0 p-1 relative"
                >
                  <AnimatePresence>
                    {filteredSmokes.map((smoke) => (
                      <motion.div
                        key={smoke.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="border border-border rounded-lg p-3 hover:bg-accent transition-colors group cursor-pointer"
                        onClick={() => handleSmokeClick(smoke)}
                        onMouseEnter={() => setHoveredSmokeId(smoke.id)}
                        onMouseLeave={() => setHoveredSmokeId((prev) => (prev === smoke.id ? null : prev))}
                        whileHover={{ scale: 1.02, x: 4 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-1 pt-1">
                            <div
                              className={`h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-md border ${smoke.type === SmokeType.SMOKE ? 'bg-blue-500 border-blue-500 text-white' :
                                  smoke.type === SmokeType.BANG ? 'bg-orange-500 border-orange-500 text-white' :
                                    smoke.type === SmokeType.MOLOTOV ? 'bg-red-500 border-red-500 text-white' :
                                      'bg-green-500 border-green-500 text-white'
                                }`}
                            >
                              {smoke.type === SmokeType.SMOKE ? <Cloudy size={24} strokeWidth={2.5} /> :
                                smoke.type === SmokeType.BANG ? <Sparkles size={24} strokeWidth={2.5} /> :
                                  smoke.type === SmokeType.MOLOTOV ? <Flame size={24} strokeWidth={2.5} /> :
                                    <BookOpen size={24} strokeWidth={2.5} />}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-medium truncate">{smoke.title}</div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                              <div className="flex items-center gap-1 truncate flex-1 mr-2">
                                <User className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{smoke.author.displayName}</span>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                  <ThumbsUp className="w-4 h-4" />
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

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSmokeClick(smoke)
                            }}
                            className="p-1 h-auto self-center"
                            onMouseEnter={() => setHoveredSmokeId(smoke.id)}
                            onMouseLeave={() => setHoveredSmokeId((prev) => (prev === smoke.id ? null : prev))}
                          >
                            <Play className="w-5 h-5 text-primary group-hover:text-accent-foreground transition-colors" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {filteredSmokes.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
                          <Search className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">Nenhum smoke encontrado</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Back to Top Button */}
                  <AnimatePresence>
                    {showBackToTop && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={scrollToTop}
                        className="absolute bottom-4 right-4 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors z-10"
                        title="Voltar ao topo"
                      >
                        <ArrowUpCircle className="w-6 h-6" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <OtherMaps currentMapId={mapId} />

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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyLink}
                  className="ml-auto h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Copiar link"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
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
          setNewTimestamp("1")
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
              <Input type="number" min={1} step={1} value={newTimestamp} onChange={(e) => setNewTimestamp(e.target.value)} placeholder="Ex: 42" className="hide-number-input-arrows" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={newType} onValueChange={(value) => setNewType(value as SmokeType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SmokeType.SMOKE}>
                    <div className="flex items-center gap-2">
                      <Cloudy className="w-4 h-4" />
                      <span>Smoke</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={SmokeType.BANG}>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Flashbang</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={SmokeType.MOLOTOV}>
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4" />
                      <span>Molotov</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={SmokeType.STRATEGY}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Estratégia</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {map.radarLower && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Nível</label>
                <div className="relative flex bg-muted/40 p-1 rounded-lg w-full">
                  {(['upper', 'lower'] as const).map((floor) => (
                    <button
                      key={floor}
                      type="button"
                      onClick={() => setSelectedFloor(floor)}
                      className={`
                        cursor-pointer relative flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 z-10
                        ${selectedFloor === floor ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}
                      `}
                    >
                      {selectedFloor === floor && (
                        <motion.div
                          layoutId="active-floor-indicator-dialog"
                          className="absolute inset-0 bg-background shadow-sm border border-border/50 rounded-md -z-10"
                          initial={false}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="flex items-center gap-2">
                        {floor === 'upper' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        {floor === 'upper' ? 'Superior' : 'Inferior'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
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
                      mapId,
                      floor: map.radarLower ? selectedFloor : undefined
                    })
                    toast({ title: "Smoke criado", description: "Seu smoke foi adicionado." })
                    setShowAddSmoke(false)
                    setNewTitle("")
                    setNewVideoUrl("")
                    setNewTimestamp("1")
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
