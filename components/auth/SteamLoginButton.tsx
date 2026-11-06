"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, UserRound, Crosshair } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function SteamLoginButton() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted || isLoading) {
    return (
      <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
    );
  }

  if (isAuthenticated && user) {
    // modal={false}: abrir o menu não trava a rolagem nem esconde a barra (o layout pulava).
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 cursor-pointer rounded-lg p-0">
            <Avatar className="h-9 w-9 rounded-lg">
              <AvatarImage src={user.avatarUrl} alt={user.username} />
              <AvatarFallback>
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end" forceMount>
          <div className="flex items-center gap-3 p-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatarUrl} alt={user.username} />
              <AvatarFallback>
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="font-semibold text-sm">{user.username}</p>
              <p className="text-xs text-muted-foreground">Conta Steam</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={`/perfil/${user.steamId}`}><UserRound className="mr-2 h-4 w-4" />Meu perfil</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/conexao"><Crosshair className="mr-2 h-4 w-4" />Conexão Steam</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout} className="text-loss focus:text-loss focus:bg-loss/10">
            <LogOut className="mr-2 h-4 w-4 text-loss" />
            Sair da conta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button onClick={login} className="gap-2 bg-white text-black shadow-lg hover:bg-zinc-200">
      <Image src="/images/steam-icon.svg" alt="" width={20} height={20} className="invert" />
      Entrar com Steam
    </Button>
  );
}
