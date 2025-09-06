import { MapViewer } from "@/components/map-viewer"
import { Header } from "@/components/header"
import { notFound } from "next/navigation"
import { MapsService } from "@/lib/services/maps.service"

interface MapPageProps {
  params: Promise<{ id: string }>
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-balance mb-2">{map.displayName || map.name}</h1>
            <p className="text-lg text-muted-foreground text-pretty">{map.description || 'Mapa do Counter-Strike 2'}</p>
        </div>
          <MapViewer mapId={mapId} />
      </main>
    </div>
  )
  } catch (error) {
    console.error('Error fetching map:', error)
    notFound()
  }
}
