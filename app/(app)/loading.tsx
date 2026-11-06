// Carregamento entre telas: blocos no formato do conteúdo, dentro da casca do app.
export default function Loading() {
  return <div role="status" aria-label="Carregando" className="space-y-5">
    <div className="h-9 w-56 animate-pulse rounded-lg bg-card" />
    <div className="h-64 animate-pulse rounded-xl bg-card md:h-80" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map(i => <div key={i} className="h-72 animate-pulse rounded-xl bg-card" />)}</div>
  </div>;
}
