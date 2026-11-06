// Esqueletos no formato de cada tela: quem espera já vê onde cada coisa vai aparecer,
// e o conteúdo entra no lugar sem empurrar nada.

const Bone = ({ className = '' }: { className?: string }) => <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`} />;

function Shell({ label, children }: { label: string; children: React.ReactNode }) {
  return <div role="status" aria-label={label} aria-busy className="space-y-5">{children}<span className="sr-only">{label}</span></div>;
}

/** Banner com arte: avatar/título embaixo, como o ArtHero. */
function Hero({ height = 'h-60 md:h-80', avatar = false }: { height?: string; avatar?: boolean }) {
  return <div className={`relative overflow-hidden rounded-xl bg-card ring-1 ring-white/[0.06] ${height}`}>
    <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.05] to-transparent" />
    <div className="absolute inset-x-4 bottom-4 flex items-end gap-4">
      {avatar && <Bone className="h-16 w-16 shrink-0 md:h-20 md:w-20" />}
      <div className="flex-1 space-y-3"><Bone className="h-4 w-40" /><Bone className="h-10 w-2/3 max-w-sm" /><Bone className="h-4 w-1/2 max-w-xs" /></div>
    </div>
  </div>;
}

const Tiles = ({ n = 6 }: { n?: number }) =>
  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{Array.from({ length: n }, (_, i) =>
    <div key={i} className="space-y-2.5 rounded-xl bg-card p-4 ring-1 ring-white/[0.06]"><Bone className="h-3 w-16" /><Bone className="h-7 w-20" /><Bone className="h-3 w-24" /></div>)}</div>;

/** Card de partida (arte em cima, corpo embaixo), como o MatchArtCard. */
export const CardsSkeleton = ({ n = 3 }: { n?: number }) =>
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: n }, (_, i) =>
    <div key={i} className="overflow-hidden rounded-xl bg-card ring-1 ring-white/[0.06]">
      <div className="h-32 animate-pulse bg-white/[0.05] sm:h-36" />
      <div className="space-y-3 p-3.5"><div className="flex justify-between"><Bone className="h-5 w-20 rounded-full" /><Bone className="h-4 w-24" /></div>
        <Bone className="h-5 w-32" /><Bone className="h-9 w-full" /></div>
    </div>)}</div>;

const Rows = ({ n = 5 }: { n?: number }) =>
  <div className="overflow-hidden rounded-xl bg-card ring-1 ring-white/[0.06]">
    <div className="flex items-center justify-between border-b border-border p-4"><Bone className="h-5 w-28" /><Bone className="h-8 w-32" /></div>
    {Array.from({ length: n }, (_, i) => <div key={i} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0">
      <Bone className="h-10 w-10 shrink-0" /><div className="flex-1 space-y-2"><Bone className="h-4 w-36" /><Bone className="h-3 w-56 max-w-full" /></div></div>)}
  </div>;

export const MatchSkeleton = () => <Shell label="Carregando a partida">
  <Hero />
  <div className="flex gap-2"><Bone className="h-9 w-36" /><Bone className="h-9 w-52" /></div>
  <Rows n={5} />
</Shell>;

export const ProfileSkeleton = () => <Shell label="Carregando o perfil">
  <Hero height="h-52 md:h-64" avatar />
  <Tiles />
  <CardsSkeleton />
</Shell>;

export const GroupSkeleton = () => <Shell label="Carregando o grupo">
  <div className="flex items-center gap-4"><Bone className="h-16 w-16 md:h-20 md:w-20" /><div className="flex-1 space-y-3"><Bone className="h-10 w-64 max-w-full" /><Bone className="h-4 w-40" /></div></div>
  <Rows n={3} />
  <CardsSkeleton />
</Shell>;

export const GroupsSkeleton = () => <Shell label="Carregando os grupos">
  <div className="grid gap-3 sm:grid-cols-2">{[0, 1].map(i => <div key={i} className="flex items-center gap-4 rounded-xl bg-card p-4 ring-1 ring-white/[0.06]">
    <Bone className="h-12 w-12" /><div className="flex-1 space-y-2"><Bone className="h-4 w-32" /><Bone className="h-3 w-20" /></div></div>)}</div>
</Shell>;

export const MatchesSkeleton = () => <Shell label="Carregando as partidas">
  <div className="flex flex-wrap gap-2">{['w-36', 'w-44', 'w-40', 'w-48'].map(w => <Bone key={w} className={`h-9 ${w}`} />)}</div>
  <Hero height="h-56 md:h-72" />
  <Tiles />
  <CardsSkeleton n={6} />
</Shell>;
