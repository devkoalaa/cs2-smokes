import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/brand';

// Indexa o que é público (início, mapas, privacidade). Partidas, conexão, grupos, perfis e
// convites são privados e também levam noindex nas próprias páginas.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/partidas', '/conexao', '/grupos', '/perfil', '/convite', '/auth', '/offline'] },
    sitemap: `${BRAND.url}/sitemap.xml`,
    host: BRAND.url,
  };
}
