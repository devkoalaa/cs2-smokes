import { Suspense } from 'react';
import { SteamCallback } from '@/components/auth/SteamCallback';
import { LoadingOverlay } from '@/components/ui/loading-overlay';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingOverlay show={true} message="Carregando..." />}>
      <SteamCallback />
    </Suspense>
  );
}
