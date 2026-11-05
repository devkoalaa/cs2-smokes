'use client';

import { useEffect } from 'react';

/** Registra o service worker (só em produção, para não atrapalhar o desenvolvimento). */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
  }, []);
  return null;
}
