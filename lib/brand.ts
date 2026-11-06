// Marca do CS2 Hub num lugar só: cores fixas (para imagens geradas, onde não há CSS)
// e o desenho do símbolo. Trocar a logo = trocar MARK.
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

// Símbolo: hexágono com mira e ponto central (originais em public/brand/). viewBox recortado
// em volta do desenho, para ele preencher o espaço que recebe; traço e ponto na cor do texto.
export const MARK = {
  viewBox: '176 176 672 672',
  strokeWidth: 48,
  paths: [
    'M280 448 V393 Q280 378 293 371 L500 251 Q512 244 524 251 L731 371 Q744 378 744 393 V448 M744 576 V631 Q744 646 731 653 L524 773 Q512 780 500 773 L293 653 Q280 646 280 631 V576',
    'M232 512 H355 M669 512 H792 M512 213 V338 M512 686 V811',
  ],
  dot: { cx: 512, cy: 512, r: 46 },
};
