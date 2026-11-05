import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BRAND } from './brand';

// Arquivos de public/ lidos no servidor para as imagens geradas (miniatura e tabela do time).
export const asset = (...path: string[]) => readFile(join(process.cwd(), 'public', ...path));
export const resultColors: Record<string, string> = { Vitória: BRAND.win, Derrota: BRAND.loss, Empate: BRAND.draw };
export const background = BRAND.gradient;

export async function loadFonts() {
  const [display, regular, semibold] = await Promise.all([asset('fonts', 'NewAmsterdam-Regular.ttf'), asset('fonts', 'Geist-Regular.ttf'), asset('fonts', 'Geist-SemiBold.ttf')]);
  return [{ name: 'Display', data: display, weight: 400 as const }, { name: 'Geist', data: regular, weight: 400 as const }, { name: 'Geist', data: semibold, weight: 600 as const }];
}
