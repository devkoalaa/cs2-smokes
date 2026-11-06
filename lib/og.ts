import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BRAND } from './brand';

// Arquivos de public/ lidos no servidor para as imagens geradas (miniatura e tabela do time).
export const asset = (...path: string[]) => readFile(join(process.cwd(), 'public', ...path));
export const resultColors: Record<string, string> = { Vitória: BRAND.win, Derrota: BRAND.loss, Empate: BRAND.draw };
export const background = BRAND.gradient;

export async function loadFonts() {
  // "Display" = Geist Black, a mesma dos títulos do site.
  const [display, regular, semibold] = await Promise.all([asset('fonts', 'Geist-Black.ttf'), asset('fonts', 'Geist-Regular.ttf'), asset('fonts', 'Geist-SemiBold.ttf')]);
  return [{ name: 'Display', data: display, weight: 400 as const }, { name: 'Geist', data: regular, weight: 400 as const }, { name: 'Geist', data: semibold, weight: 600 as const }];
}

/** Arte oficial do mapa (1200×630, JPG) como data URL, para fundo das imagens geradas. */
export async function mapArtData(map: string | null | undefined) {
  const name = String(map ?? '').toLowerCase().replace(/^de_/, '').replace(/[^a-z0-9]/g, '');
  return asset('images', 'maps', 'og', `art-${name}.jpg`).then(b => `data:image/jpeg;base64,${b.toString('base64')}`).catch(() => null);
}

/** Tamanho do título em Geist Black para caber na largura (nomes longos encolhem). */
export const titleSize = (text: string, max: number, width = 1040) => Math.min(max, Math.floor(width / Math.max(1, text.length) / 0.62));
