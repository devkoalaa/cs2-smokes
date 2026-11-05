"use client"

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { config } from '@/lib/config';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Button } from '@/components/ui/button';

export function SteamCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { forceUpdate } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando autenticação...');
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    const handleSteamCallback = async () => {
      // Prevent duplicate processing
      if (hasProcessedRef.current) {
        return;
      }

      try {
        hasProcessedRef.current = true;
        
        // Check if we have Steam OpenID parameters in the URL
        const openIdMode = searchParams.get('openid.mode');
        const openIdError = searchParams.get('openid.error');

        if (openIdError) {
          throw new Error(`Steam authentication error: ${openIdError}`);
        }

        if (openIdMode === 'error') {
          throw new Error('Steam authentication failed');
        }

        if (openIdMode === 'id_res') {
          // Steam returned successfully, now we need to get the token from our API
          // We need to pass the OpenID parameters to the backend
          const openIdParams = new URLSearchParams();
          searchParams.forEach((value, key) => {
            if (key.startsWith('openid.')) {
              openIdParams.append(key, value);
            }
          });
          
          const response = await fetch(`${config.apiUrl}/auth/steam/return?${openIdParams.toString()}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            
            const authService = AuthService.getInstance();
            authService.setAuth(data.token, data.user);
            
            // Update the auth context
            forceUpdate();
            
            setStatus('success');
            setMessage('Autenticação realizada com sucesso!');
            
            const target = sessionStorage.getItem('login_return');
            sessionStorage.removeItem('login_return');
            setTimeout(() => {
              router.push(target && /^\/(?![/\\])/.test(target) && !target.startsWith('/auth') ? target : '/');
            }, 2000);
          } else {
            const errorJson = await response.json().catch(() => null);
            const errorMessage = typeof errorJson?.message === 'string' ? errorJson.message : 'O servidor não concluiu o login.';
            throw new Error(`${response.status}: ${errorMessage}`);
          }
        } else {
          throw new Error('Parâmetros de autenticação inválidos');
        }
      } catch (error) {
        setStatus('error');
        setMessage(`Falha na autenticação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    };

    handleSteamCallback();
  }, [searchParams, router]);


  if (status === 'error') return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="max-w-lg rounded-xl border border-border bg-card p-8 space-y-4" role="alert">
        <h1 className="text-2xl font-bold">Não foi possível entrar</h1>
        <p className="text-muted-foreground break-words">{message}</p>
        <Button onClick={() => { window.location.href = AuthService.getInstance().getSteamAuthUrl(); }}>Tentar novamente com Steam</Button>
        <Button variant="outline" onClick={() => router.push('/')}>Voltar ao início</Button>
      </section>
    </main>
  );

  return (
    <LoadingOverlay 
      show={status === 'loading'} 
      message="Autenticando..." 
    />
  );
}
