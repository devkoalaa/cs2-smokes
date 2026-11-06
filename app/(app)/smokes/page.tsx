import type { Metadata } from "next"
import { PageHeader } from "@/components/kit"
import { MapGrid } from "@/components/map-grid"

export const metadata: Metadata = {
  title: "Smokes por mapa",
  description: "Smokes, flashes e molotovs de cada mapa do CS2, com vídeo e a posição exata no radar.",
  alternates: { canonical: "/smokes" },
}

export default function SmokesPage() {
  return <>
    <PageHeader title="Smokes por mapa" subtitle="Escolha um mapa para ver smokes, flashes e molotovs com vídeo e posição no radar." />
    <MapGrid />
  </>
}
