"use client"

import { useAuth } from '@/contexts/AuthContext';
import { LoadingOverlay } from '@/components/ui/loading-overlay';

export function AuthLoading() {
  const { isLoading } = useAuth();

  return <LoadingOverlay show={isLoading} message="Carregando..." />;
}
