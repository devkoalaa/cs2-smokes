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
// Largura de cada caractere da Geist Black em maiúsculas (fração do tamanho da fonte,
// medida no próprio Geist-Black.ttf com fontTools). Os títulos das imagens são em caixa alta.
const GLYPHS: Record<string, number> = {
  A: 0.771, B: 0.718, C: 0.755, D: 0.73, E: 0.634, F: 0.614, G: 0.764, H: 0.727, I: 0.32, J: 0.647, K: 0.721, L: 0.595, M: 0.94,
  N: 0.755, O: 0.8, P: 0.686, Q: 0.793, R: 0.714, S: 0.709, T: 0.631, U: 0.713, V: 0.772, W: 1.061, X: 0.742, Y: 0.668, Z: 0.627,
  0: 0.713, 1: 0.492, 2: 0.676, 3: 0.674, 4: 0.684, 5: 0.701, 6: 0.649, 7: 0.558, 8: 0.704, 9: 0.656, ' ': 0.214, '.': 0.26, '-': 0.416, ':': 0.32,
};
const textWidth = (text: string) => [...text.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')]
  .reduce((sum, c) => sum + (GLYPHS[c] ?? 0.75), 0);

/** Maior tamanho (até max) em que o título cabe numa linha de `width` pixels, com folga de 3%. */
export const titleSize = (text: string, max: number, width = 1040) => Math.min(max, Math.floor(width * 0.97 / Math.max(1, textWidth(text))));
