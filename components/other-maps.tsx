"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { MapCard } from "@/components/map-card"
import { useMaps } from "@/hooks/useMaps"

/** Outros mapas (os que têm mais granadas), no fim da página de um mapa. */
export function OtherMaps({ currentMapId }: { currentMapId: number }) {
  const { maps, loading } = useMaps()
  const others = (maps ?? []).filter(m => m.id !== currentMapId).sort((a, b) => (b.smokesCount ?? 0) - (a.smokesCount ?? 0)).slice(0, 3)
  if (loading || !others.length) return null
  return (
    <section className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Outros mapas</h2>
        <Link href="/smokes" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">Ver todos<ChevronRight className="h-4 w-4" /></Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{others.map((m, i) => <MapCard key={m.id} map={m} i={i} />)}</div>
    </section>
  )
}
