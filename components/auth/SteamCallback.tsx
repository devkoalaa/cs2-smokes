"use client"

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { config } from '@/lib/config';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingOverlay } from '@/components/ui/loading-overlay';

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
            
            // Redirect to home page after 2 seconds
            setTimeout(() => {
              router.push('/');
            }, 2000);
          } else {
            const errorText = await response.text();
            
            // Try to parse error as JSON
            let errorMessage = errorText;
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.message || errorText;
            } catch (e) {
              // Not JSON, use text as is
            }
            
            throw new Error(`Falha na autenticação: ${response.status} - ${errorMessage}`);
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


  return (
    <LoadingOverlay 
      show={status === 'loading'} 
      message="Autenticando..." 
    />
  );
}
