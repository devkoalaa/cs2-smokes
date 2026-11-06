"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { MapCard } from "@/components/map-card"
import { MapGridSkeleton } from "@/components/loading-skeleton"
import { Alert } from "@/components/hub-ui"
import { useMaps } from "@/hooks/useMaps"

/** Grade de mapas. Com `limit`, mostra os mais populares sem os filtros (prévia da página inicial). */
export function MapGrid({ limit }: { limit?: number }) {
  const { maps, loading, error } = useMaps()
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState(limit ? "smokes" : "name")

  const list = useMemo(() => {
    const term = search.trim().toLowerCase()
    const filtered = (maps ?? []).filter(m => !term || (m.displayName || m.name).toLowerCase().includes(term) || m.description?.toLowerCase().includes(term))
    const sorted = filtered.sort((a, b) => sort === "smokes" ? (b.smokesCount ?? 0) - (a.smokesCount ?? 0) : (a.displayName || a.name).localeCompare(b.displayName || b.name))
    return limit ? sorted.slice(0, limit) : sorted
  }, [maps, search, sort, limit])

  if (loading) return <MapGridSkeleton />
  if (error) return <Alert>Não foi possível carregar os mapas. Tente de novo em instantes.</Alert>

  return (
    <div className="space-y-4">
      {!limit && <div className="flex flex-wrap gap-2">
        <label className="flex min-w-60 flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar mapa" aria-label="Buscar mapa" className="w-full bg-transparent outline-none placeholder:text-muted-foreground" />
        </label>
        <select aria-label="Ordenar mapas" value={sort} onChange={e => setSort(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
          <option value="name">Nome</option><option value="smokes">Mais granadas</option>
        </select>
      </div>}
      {list.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((m, i) => <MapCard key={m.id} map={m} i={i} />)}</div>
        : <p className="py-10 text-center text-sm text-muted-foreground">Nenhum mapa com esse nome.</p>}
    </div>
  )
}
