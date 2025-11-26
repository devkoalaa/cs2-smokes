"use client"

import { MapCard } from "@/components/map-card"
import { Button } from "@/components/ui/button"
import { useMaps } from "@/hooks/useMaps"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface OtherMapsProps {
  currentMapId: number
}

export function OtherMaps({ currentMapId }: OtherMapsProps) {
  const router = useRouter()
  const { maps, loading } = useMaps()
  const [hoveredMapId, setHoveredMapId] = useState<number | null>(null)

  if (loading || !maps) {
    return null
  }

  const otherMaps = maps
    .filter(map => map.id !== currentMapId)
    .slice(0, 3)

  if (otherMaps.length === 0) {
    return null
  }

  return (
    <div className="space-y-6 mt-12">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Confira outros mapas</h2>
        <Button variant="ghost" onClick={() => router.push('/')}>
          Ver todos
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {otherMaps.map((map) => (
          <div key={map.id} className="h-80">
            <MapCard
              map={map}
              isHovered={hoveredMapId === map.id}
              onMouseEnter={() => setHoveredMapId(map.id)}
              onMouseLeave={() => setHoveredMapId(null)}
              onClick={() => router.push(`/map/${map.id}`)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
