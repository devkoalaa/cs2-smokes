import { MapViewer } from "@/components/map-viewer"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MapsService } from "@/lib/services/maps.service"
import { PageTitle } from "@/components/hub-ui"

interface MapPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: MapPageProps): Promise<Metadata> {
  const { id } = await params
  const map = await MapsService.getInstance().getMapById(parseInt(id)).catch(() => null)
  if (!map) return { title: "Mapa não encontrado", robots: { index: false } }
  const name = map.displayName || map.name
  const title = `${name}: smokes, flashes e molotovs`
  const description = `Smokes, flashes e molotovs da ${name} no CS2, com vídeo e a posição exata no radar.`
  return { title, description, alternates: { canonical: `/map/${map.id}` },
    openGraph: { title, description, url: `/map/${map.id}`, type: "website", siteName: "CS2 Hub", locale: "pt_BR" },
    twitter: { card: "summary_large_image", title, description } }
}

export default async function MapPage({ params }: MapPageProps) {
  const { id } = await params
  const mapId = parseInt(id)

  if (isNaN(mapId)) {
    notFound()
  }

  const mapsService = MapsService.getInstance()
  
  try {
    const map = await mapsService.getMapById(mapId)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
            <PageTitle className="mb-3">{map.displayName || map.name}</PageTitle>
            <p className="text-lg text-muted-foreground text-pretty">{map.description || 'Mapa do Counter-Strike 2'}</p>
        </div>
          <MapViewer mapId={mapId} />
      </main>
      <Footer />
    </div>
  )
  } catch (error) {
    console.error('Error fetching map:', error)
    notFound()
  }
}
