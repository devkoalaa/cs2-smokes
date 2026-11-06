'use client';

import { useState } from 'react';
import { Check, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { ImageUpload } from '@/components/image-upload';
import { Alert } from '@/components/hub-ui';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ART_MAPS, artBackground, mapName } from '@/lib/match';
import { Banner, groupsApi, mediaUrl } from '@/lib/services/tracking.service';

/**
 * Escolha do banner do perfil: automático (mapa mais jogado), um dos mapas com arte
 * oficial, ou uma imagem enviada (que vale por cima do mapa escolhido).
 */
export function BannerEditor({ banner, favorite, onChanged }: { banner: Banner; favorite: string; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const selected = banner.url ? 'image' : banner.map ?? 'auto';

  async function choose(key: string) {
    if (busy || key === selected) return;
    setBusy(key); setError('');
    try {
      if (banner.url) await groupsApi.removeBanner();
      await groupsApi.bannerMap(key === 'auto' ? null : key);
      onChanged();
    } catch (e) { setError((e as Error).message); } finally { setBusy(null); }
  }
  async function removeImage() {
    setBusy('image'); setError('');
    try { await groupsApi.removeBanner(); onChanged(); } catch (e) { setError((e as Error).message); } finally { setBusy(null); }
  }

  // Primeira letra de cada palavra (\b do regex quebra em letra acentuada).
  const title = (name: string) => name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const tile = (key: string, label: string, background: string, sub?: string) =>
    <button key={key} type="button" onClick={() => void choose(key)} aria-pressed={selected === key} disabled={!!busy}
      className={`group relative h-20 overflow-hidden rounded-lg text-left ring-2 transition sm:h-24 ${selected === key ? 'ring-primary' : 'ring-transparent hover:ring-white/30'}`}>
      <span className="absolute inset-0 bg-cover bg-center transition duration-300 group-hover:scale-105" style={{ backgroundImage: background }} />
      <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <span className="absolute bottom-2 left-2.5 right-2.5">
        <span className="block text-sm font-bold text-white">{title(label)}</span>
        {sub && <span className="block text-[11px] text-zinc-300">{sub}</span>}
      </span>
      {(selected === key || busy === key) && <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
        {busy === key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}</span>}
    </button>;

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant="outline" className="bg-surface/80 backdrop-blur"><ImagePlus className="h-4 w-4" />Banner</Button></DialogTrigger>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>Banner do perfil</DialogTitle>
        <DialogDescription>Escolha a arte de um mapa ou envie uma imagem sua.</DialogDescription>
      </DialogHeader>
      {error && <Alert>{error}</Alert>}
      <div className="flex flex-col gap-3 rounded-lg bg-black/20 p-3 ring-1 ring-white/[0.06] sm:flex-row sm:items-center">
        {banner.url && <div className={`relative h-24 w-full shrink-0 overflow-hidden rounded-md sm:h-14 sm:w-32 bg-cover bg-center ring-2 ${selected === 'image' ? 'ring-primary' : 'ring-transparent'}`}
          style={{ backgroundImage: `url("${mediaUrl(banner.url)}")` }} role="img" aria-label="Sua imagem atual" />}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{banner.url ? 'Sua imagem está no banner' : 'Imagem própria'}</p>
          <p className="text-xs text-muted-foreground">JPG, PNG ou WebP até 6 MB. Fica recortada em 1600×640.</p>
        </div>
        <div className="flex gap-2">
          <ImageUpload label="Enviar imagem para o banner" upload={file => groupsApi.uploadBanner(file)} onDone={onChanged} onError={setError}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-70">
            {up => <>{up ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}{banner.url ? 'Trocar' : 'Enviar'}</>}
          </ImageUpload>
          {banner.url && <Button variant="ghost" size="sm" className="h-9" disabled={!!busy} onClick={() => void removeImage()} aria-label="Tirar minha imagem">
            {busy === 'image' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</Button>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {tile('auto', 'Automático', artBackground(favorite, true), `mapa mais jogado (${title(mapName(favorite))})`)}
        {ART_MAPS.map(m => tile(`de_${m}`, mapName(`de_${m}`), artBackground(m, true)))}
      </div>
      {banner.url && <p className="text-xs text-muted-foreground">Com uma imagem sua, ela aparece no lugar do mapa. Escolher um mapa tira a imagem.</p>}
    </DialogContent>
  </Dialog>;
}
