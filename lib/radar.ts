// Converte coordenadas do jogo para pixels dos radares de /public/images/maps
// (1024×1024, as visões gerais oficiais). pos_x/pos_y/scale vêm dos arquivos
// de overview de cada mapa (radares de Vertigo e Anubis do repositório MurkyYT/cs2-map-icons);
// conferidos com mortes reais em Mirage, Nuke, Inferno e Ancient.
export interface Radar { image: string; x: number; y: number; scale: number; lower?: { image: string; belowZ: number } }

export const RADARS: Record<string, Radar> = {
  de_mirage: { image: '/images/maps/map_mirage.webp', x: -3230, y: 1713, scale: 5 },
  de_inferno: { image: '/images/maps/map_inferno.webp', x: -2087, y: 3870, scale: 4.9 },
  de_ancient: { image: '/images/maps/map_ancient.webp', x: -2953, y: 2164, scale: 5 },
  de_nuke: { image: '/images/maps/map_nuke.webp', x: -3453, y: 2887, scale: 7, lower: { image: '/images/maps/map_nuke_lower.webp', belowZ: -495 } },
  de_dust2: { image: '/images/maps/map_dust2.webp', x: -2476, y: 3239, scale: 4.4 },
  de_overpass: { image: '/images/maps/map_overpass.webp', x: -4831, y: 1781, scale: 5.2 },
  de_train: { image: '/images/maps/map_train.webp', x: -2308, y: 2078, scale: 4.082077 },
  de_vertigo: { image: '/images/maps/map_vertigo.webp', x: -3168, y: 1762, scale: 4, lower: { image: '/images/maps/map_vertigo_lower.webp', belowZ: 11700 } },
  de_anubis: { image: '/images/maps/map_anubis.webp', x: -2796, y: 3328, scale: 5.22 },
};

export const toRadar = (radar: Radar, [x, y]: number[]) => ({ x: (x - radar.x) / radar.scale, y: (radar.y - y) / radar.scale });
export const isLower = (radar: Radar, pos: number[]) => !!radar.lower && pos[2] < radar.lower.belowZ;

const WEAPONS: Record<string, string> = {
  ak47: 'AK-47', m4a1: 'M4A4', m4a1_silencer: 'M4A1-S', awp: 'AWP', deagle: 'Desert Eagle', usp_silencer: 'USP-S', hkp2000: 'P2000',
  glock: 'Glock-18', p250: 'P250', tec9: 'Tec-9', fiveseven: 'Five-SeveN', cz75a: 'CZ75', elite: 'Dual Berettas', revolver: 'R8',
  galilar: 'Galil AR', famas: 'FAMAS', sg556: 'SG 553', aug: 'AUG', ssg08: 'SSG 08', scar20: 'SCAR-20', g3sg1: 'G3SG1',
  mac10: 'MAC-10', mp9: 'MP9', mp7: 'MP7', mp5sd: 'MP5-SD', ump45: 'UMP-45', p90: 'P90', bizon: 'PP-Bizon',
  nova: 'Nova', xm1014: 'XM1014', mag7: 'MAG-7', sawedoff: 'Sawed-Off', m249: 'M249', negev: 'Negev',
  hegrenade: 'granada', inferno: 'molotov', molotov: 'molotov', incgrenade: 'incendiária', taser: 'Zeus', knife: 'faca', world: 'queda', planted_c4: 'bomba',
};
export const weaponName = (w: string) => WEAPONS[w] ?? (w.startsWith('knife') || w.startsWith('bayonet') ? 'faca' : w.replace(/_/g, ' '));
