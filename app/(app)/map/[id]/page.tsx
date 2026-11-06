import { MapViewer } from "@/components/map-viewer"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MapsService } from "@/lib/services/maps.service"
import Link from "next/link"
import { ArtHero } from "@/components/kit"

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

  const name = map.displayName || map.name
  return (
    <>
      <ArtHero map={name} height="min-h-48 md:min-h-64">
        <nav aria-label="Caminho" className="text-sm text-zinc-300"><Link href="/smokes" className="hover:text-white">Smokes</Link><span className="mx-1.5 text-zinc-500">/</span>{name}</nav>
        <h1 className="mt-1 font-display text-4xl md:text-5xl">{name}</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-300">{map.description || 'Smokes, flashes e molotovs com vídeo e posição no radar.'}</p>
      </ArtHero>
      <MapViewer mapId={mapId} />
    </>
  )
  } catch (error) {
    console.error('Error fetching map:', error)
    notFound()
  }
}
