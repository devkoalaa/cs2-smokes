'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginPrompt } from '@/components/hub-ui';
import { useAuth } from '@/contexts/AuthContext';

// /perfil leva ao perfil de quem está logado.
export default function MyProfile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (user?.steamId) router.replace(`/perfil/${user.steamId}`); }, [user?.steamId, router]);
  return <>{!isLoading && !isAuthenticated ? <LoginPrompt text="Entre com a Steam para ver seu perfil." /> : <p role="status">Abrindo seu perfil…</p>}</>;
}
