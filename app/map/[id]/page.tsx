import { MapViewer } from "@/components/map-viewer"
import { Header } from "@/components/header"
import { notFound } from "next/navigation"

const mapData = {
  dust2: {
    name: "Dust II",
    description: "O mapa mais icônico do Counter Strike",
    image: "/dust2-counter-strike-tactical-map-overview.jpg",
    smokes: [
      {
        id: 1,
        name: "Smoke Long A",
        position: { x: 65, y: 25 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para bloquear a visão dos CTs no Long A",
        difficulty: "Médio" as const,
        category: "Defensivo",
        duration: "2:30",
      },
      {
        id: 2,
        name: "Smoke Catwalk",
        position: { x: 45, y: 35 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para cobrir a passagem do Catwalk",
        difficulty: "Fácil" as const,
        category: "Ofensivo",
        duration: "1:45",
      },
      {
        id: 3,
        name: "Smoke Xbox",
        position: { x: 55, y: 45 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para bloquear a caixa do meio",
        difficulty: "Difícil" as const,
        category: "Tático",
        duration: "3:15",
      },
      {
        id: 4,
        name: "Smoke CT Spawn",
        position: { x: 70, y: 15 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para bloquear o spawn dos CTs",
        difficulty: "Médio" as const,
        category: "Defensivo",
        duration: "2:00",
      },
      {
        id: 5,
        name: "Smoke Short A",
        position: { x: 60, y: 40 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para cobrir Short A",
        difficulty: "Fácil" as const,
        category: "Ofensivo",
        duration: "1:30",
      },
    ],
  },
  mirage: {
    name: "Mirage",
    description: "Mapa equilibrado com múltiplas rotas",
    image: "/mirage-counter-strike-tactical-map-overview.jpg",
    smokes: [
      {
        id: 1,
        name: "Smoke Connector",
        position: { x: 40, y: 50 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para bloquear o Connector",
        difficulty: "Médio" as const,
        category: "Tático",
        duration: "2:45",
      },
      {
        id: 2,
        name: "Smoke Jungle",
        position: { x: 30, y: 40 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para cobrir a Jungle",
        difficulty: "Fácil" as const,
        category: "Ofensivo",
        duration: "1:50",
      },
      {
        id: 3,
        name: "Smoke Window",
        position: { x: 25, y: 30 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para bloquear a janela",
        difficulty: "Difícil" as const,
        category: "Defensivo",
        duration: "3:00",
      },
      {
        id: 4,
        name: "Smoke Stairs",
        position: { x: 35, y: 60 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para cobrir as escadas",
        difficulty: "Médio" as const,
        category: "Tático",
        duration: "2:20",
      },
    ],
  },
  inferno: {
    name: "Inferno",
    description: "Mapa urbano com passagens estreitas",
    image: "/inferno-counter-strike-tactical-map-overview.jpg",
    smokes: [
      {
        id: 1,
        name: "Smoke Banana",
        position: { x: 20, y: 60 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para bloquear a Banana",
        difficulty: "Fácil" as const,
        category: "Ofensivo",
        duration: "1:40",
      },
      {
        id: 2,
        name: "Smoke Pit",
        position: { x: 15, y: 45 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para cobrir o Pit",
        difficulty: "Médio" as const,
        category: "Tático",
        duration: "2:10",
      },
      {
        id: 3,
        name: "Smoke Library",
        position: { x: 25, y: 35 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para bloquear a Library",
        difficulty: "Difícil" as const,
        category: "Defensivo",
        duration: "2:55",
      },
    ],
  },
  cache: {
    name: "Cache",
    description: "Mapa industrial com controle de meio",
    image: "/cache-counter-strike-tactical-map-overview.jpg",
    smokes: [
      {
        id: 1,
        name: "Smoke Mid",
        position: { x: 50, y: 50 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para controlar o meio",
        difficulty: "Médio" as const,
        category: "Tático",
        duration: "2:30",
      },
      {
        id: 2,
        name: "Smoke A Site",
        position: { x: 30, y: 30 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para cobrir o site A",
        difficulty: "Fácil" as const,
        category: "Ofensivo",
        duration: "1:55",
      },
      {
        id: 3,
        name: "Smoke B Site",
        position: { x: 70, y: 70 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para cobrir o site B",
        difficulty: "Médio" as const,
        category: "Ofensivo",
        duration: "2:15",
      },
    ],
  },
  overpass: {
    name: "Overpass",
    description: "Mapa vertical com múltiplos níveis",
    image: "/overpass-counter-strike-tactical-map-overview.jpg",
    smokes: [
      {
        id: 1,
        name: "Smoke Monster",
        position: { x: 35, y: 45 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para bloquear Monster",
        difficulty: "Difícil" as const,
        category: "Tático",
        duration: "3:20",
      },
      {
        id: 2,
        name: "Smoke Connector",
        position: { x: 45, y: 35 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para bloquear o Connector",
        difficulty: "Médio" as const,
        category: "Defensivo",
        duration: "2:40",
      },
      {
        id: 3,
        name: "Smoke Water",
        position: { x: 25, y: 60 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para cobrir a área da água",
        difficulty: "Fácil" as const,
        category: "Ofensivo",
        duration: "1:50",
      },
    ],
  },
  vertigo: {
    name: "Vertigo",
    description: "Mapa em arranha-céu com altura extrema",
    image: "/vertigo-counter-strike-tactical-map-overview.jpg",
    smokes: [
      {
        id: 1,
        name: "Smoke Ramp",
        position: { x: 60, y: 30 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para cobrir a Ramp",
        difficulty: "Médio" as const,
        category: "Tático",
        duration: "2:25",
      },
      {
        id: 2,
        name: "Smoke A Site",
        position: { x: 40, y: 20 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para cobrir o site A",
        difficulty: "Difícil" as const,
        category: "Ofensivo",
        duration: "3:10",
      },
      {
        id: 3,
        name: "Smoke B Site",
        position: { x: 80, y: 50 },
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Smoke para cobrir o site B",
        difficulty: "Fácil" as const,
        category: "Ofensivo",
        duration: "1:45",
      },
    ],
  },
}

interface MapPageProps {
  params: Promise<{ id: string }>
}

export default async function MapPage({ params }: MapPageProps) {
  const { id } = await params
  const map = mapData[id as keyof typeof mapData]

  if (!map) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-balance mb-2">{map.name}</h1>
          <p className="text-lg text-muted-foreground text-pretty">{map.description}</p>
        </div>
        <MapViewer map={map} />
      </main>
    </div>
  )
}
