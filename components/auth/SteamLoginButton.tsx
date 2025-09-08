"use client"

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full cursor-pointer hidden md:flex">
            <Avatar className="h-10 w-10">
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
              <p className="text-xs text-muted-foreground">Usuário Steam</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50">
            <LogOut className="mr-2 h-4 w-4 text-red-600" />
            Sair da conta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button onClick={login} className="bg-[#171a21] hover:bg-[#2a475e] text-white">
      <User className="mr-2 h-4 w-4" />
      Entrar com Steam
    </Button>
  );
}
