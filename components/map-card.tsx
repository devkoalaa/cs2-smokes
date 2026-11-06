import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Pill } from "@/components/kit"
import { artBackground } from "@/lib/match"
import { rise } from "@/lib/motion"
import type { Map } from "@/lib/services/maps.service"

/** Card de mapa com a arte oficial: leva à página de granadas do mapa. */
export function MapCard({ map, i = 0 }: { map: Map; i?: number }) {
  const count = map.smokesCount ?? 0
  const name = map.displayName || map.name
  return (
    <Link href={`/map/${map.id}`} style={rise(i)}
      className="group block overflow-hidden rounded-xl bg-card ring-1 ring-white/[0.06] transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 hover:ring-white/15">
      <div className="relative h-40 overflow-hidden">
        <div className={`absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105 ${count ? "" : "grayscale-[40%]"}`} style={{ backgroundImage: artBackground(name, true) }} />
        <div className="absolute inset-x-0 top-0 -bottom-px bg-gradient-to-t from-card from-5% via-card/70 via-30% to-transparent to-80%" />
        <div className="absolute right-3 top-3 flex gap-1.5">
          {!map.isActive && <Pill kind="dark">Fora do pool</Pill>}
          <Pill kind={count ? "primary" : "dark"}>{count ? `${count} granada${count === 1 ? "" : "s"}` : "Sem granadas"}</Pill>
        </div>
      </div>
      <div className="relative -mt-0.5 space-y-2 bg-card p-4 pt-1.5">
        <p className="text-xl font-bold">{name}</p>
        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{map.description || "Smokes, flashes e molotovs deste mapa."}</p>
        <span className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-rose-950/40 transition group-hover:brightness-110">
          {count ? "Ver granadas" : "Adicionar a primeira"}<ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
