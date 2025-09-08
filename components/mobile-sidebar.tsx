"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { SteamLoginButton } from "@/components/auth/SteamLoginButton"
import { useAuth } from "@/contexts/AuthContext"
import { Github, LogOut, Map, X, Cloudy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const router = useRouter()
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  const navigation = [
    { name: "Mapas", href: "/", icon: Map },
  ]

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.height = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.height = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.height = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleNavigation = (href: string) => {
    router.push(href)
    onClose()
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  return (
    <>
       {/* Backdrop */}
       <div
         className={cn(
           "fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300",
           isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
         )}
         onClick={onClose}
         aria-hidden="true"
       />

       {/* Sidebar */}
       <div
         className={cn(
           "fixed top-0 right-0 w-80 max-w-[85vw] border-l border-border z-[70] transition-transform duration-300 ease-in-out flex flex-col",
           isOpen ? "translate-x-0" : "translate-x-full"
         )}
         style={{
           backgroundColor: 'hsl(var(--sidebar))',
           color: 'hsl(var(--sidebar-foreground))',
           height: '100vh',
           minHeight: '100vh'
         }}
         role="dialog"
         aria-modal="true"
         aria-label="Menu de navegação"
       >
         {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-sidebar">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Cloudy className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-card-foreground" style={{ fontFamily: 'var(--font-new-amsterdam)' }}>
                CS2 Smokes Hub
              </h2>
              <p className="text-xs text-muted-foreground">Menu</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar menu</span>
          </Button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-border bg-sidebar">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20">
              {isAuthenticated && user?.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.username} />
              ) : (
                <AvatarFallback className="text-lg font-semibold">
                  {isAuthenticated && user?.username ? user.username[0].toUpperCase() : "?"}
                </AvatarFallback>
              )}
            </Avatar>
             <div className="flex-1 min-w-0">
               {!mounted || isLoading ? (
                 <>
                   <div className="h-6 bg-muted animate-pulse rounded mb-2"></div>
                   <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                 </>
               ) : isAuthenticated ? (
                 <>
                   <h3 className="text-lg font-semibold text-card-foreground truncate">
                     {user?.username}
                   </h3>
                   <p className="text-sm text-muted-foreground">
                     Perfil Steam
                   </p>
                 </>
               ) : (
                 <>
                   <h3 className="text-lg font-semibold text-card-foreground">
                     Visitante
                   </h3>
                   <p className="text-sm text-muted-foreground">
                     Faça login para personalizar
                   </p>
                 </>
               )}
             </div>
          </div>
        </div>

         {/* Navigation */}
         <div className="flex-1 flex flex-col min-h-0 bg-sidebar">
           <nav className="p-4 space-y-2 flex-1">
             {navigation.map((item) => (
               <Button
                 key={item.name}
                 variant="ghost"
                 onClick={() => handleNavigation(item.href)}
                 className="w-full justify-start h-12 text-card-foreground hover:text-primary-foreground hover:bg-primary transition-colors"
               >
                 <item.icon className="w-5 h-5 mr-3" />
                 <span className="text-base">{item.name}</span>
               </Button>
             ))}

             <Button
               variant="ghost"
               onClick={() => {
                 window.open('https://github.com/devkoalaa', '_blank')
                 onClose()
               }}
               className="w-full justify-start h-12 text-card-foreground hover:text-primary-foreground hover:bg-primary transition-colors"
             >
               <Github className="w-5 h-5 mr-3" />
               <span className="text-base">GitHub</span>
             </Button>
           </nav>

           {/* Footer Actions */}
           <div className="p-4 border-t border-border bg-sidebar flex-shrink-0 pb-24">
             {!mounted || isLoading ? (
               <div className="space-y-3">
                 <div className="h-4 bg-muted animate-pulse rounded mb-3"></div>
                 <div className="h-12 bg-muted animate-pulse rounded"></div>
               </div>
             ) : isAuthenticated ? (
               <Button
                 variant="ghost"
                 onClick={handleLogout}
                 className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
               >
                 <LogOut className="w-5 h-5 mr-3" />
                 <span className="text-base">Sair</span>
               </Button>
             ) : (
               <div className="space-y-3">
                 <p className="text-sm text-muted-foreground text-center mb-3">
                   Entre com sua conta Steam para uma experiência completa
                 </p>
                 <div onClick={onClose} className="flex justify-center">
                   <SteamLoginButton />
                 </div>
               </div>
             )}
           </div>
         </div>
      </div>
    </>
  )
}
