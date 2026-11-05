// Marca do CS2 Hub num lugar só: cores fixas (para imagens geradas, onde não há CSS)
// e o desenho do símbolo. Trocar a logo = trocar MARK_PATHS (viewBox 24×24, traço).
export const BRAND = {
  name: 'CS2 Hub',
  description: 'Smokes por mapa e o seu histórico de partidas de CS2, com placar completo, mapa de abates e ranking com os amigos.',
  tagline: 'Smokes por mapa e histórico de partidas de CS2.',
  url: 'https://cs2.devkoala.com',
  primary: '#a855f7', // --primary
  background: '#0a0a0a', // --background
  foreground: '#fafafa',
  muted: '#a1a1aa',
  win: '#34d399', // --win
  loss: '#f87171', // --loss
  draw: '#fcd34d', // --draw
  gradient: 'linear-gradient(135deg, #09090b 0%, #120c1c 55%, #24123d 100%)',
} as const;

export const MARK_PATHS = [
  'M17.5 12a1 1 0 1 1 0 9H9.006a7 7 0 1 1 6.702-9z',
  'M21.832 9A3 3 0 0 0 19 7h-2.207a5.5 5.5 0 0 0-10.72.61',
];
