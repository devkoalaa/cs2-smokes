'use client'

import Link from 'next/link'
import { ArrowRight, Map as MapIcon } from 'lucide-react'
import { Pill } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { rise } from '@/lib/motion'

// Destaque da página inicial: arte dos mapas ao fundo e a proposta do site.
// Quem já entrou vai direto às partidas; quem não entrou, para o login Steam.
export function HomeHero() {
  const { user, isAuthenticated, login } = useAuth()
  return (
    <section className="relative overflow-hidden rounded-2xl ring-1 ring-white/[0.06]">
      <div aria-hidden className="absolute inset-0 grid grid-cols-3 opacity-45">
        {['mirage', 'nuke', 'ancient'].map(m => <div key={m} className="bg-cover bg-center" style={{ backgroundImage: `url(/images/maps/art/${m}.webp)` }} />)}
      </div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background" />
      <div aria-hidden className="absolute -top-40 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
      <div className="relative px-5 py-14 text-center md:py-24">
        <div style={rise(0)}><Pill kind="highlight">Beta aberto · vagas limitadas</Pill></div>
        <h1 className="mx-auto mt-5 max-w-3xl font-display text-5xl leading-[1.02] md:text-7xl" style={rise(1)}>
          Suas partidas de CS2, <span className="text-primary">explicadas.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-300" style={rise(2)}>
          {isAuthenticated ? `Bem-vindo de volta${user?.username ? `, ${user.username}` : ''}. Seu histórico, o mapa de abates e o ranking do grupo estão te esperando.`
            : 'Placar completo, mapa de abates e ranking com os amigos, importados direto da Steam. Sem instalar nada.'}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3" style={rise(3)}>
          {isAuthenticated
            ? <Button asChild size="lg" className="shadow-lg shadow-rose-950/50"><Link href="/partidas">Ver minhas partidas<ArrowRight className="h-4 w-4" /></Link></Button>
            : <Button size="lg" onClick={login} className="shadow-lg shadow-rose-950/50">Entrar com Steam<ArrowRight className="h-4 w-4" /></Button>}
          <Button asChild size="lg" variant="outline"><Link href="/smokes"><MapIcon className="h-4 w-4" />Ver smokes</Link></Button>
        </div>
        {!isAuthenticated && <p className="mt-6 text-xs text-muted-foreground" style={rise(4)}>Grátis · não pedimos sua senha · seus dados ficam só com você e o seu grupo</p>}
      </div>
    </section>
  )
}
