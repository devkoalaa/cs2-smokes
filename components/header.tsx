"use client"

import { SteamLoginButton } from "@/components/auth/SteamLoginButton"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useMobileSidebar } from "@/contexts/MobileSidebarContext"
import { Github, Map, Menu, Cloudy } from "lucide-react"
import { useRouter } from "next/navigation"

export function Header() {
  const router = useRouter()
  const { toggleSidebar, setIsOpen } = useMobileSidebar()
  const { isAuthenticated } = useAuth()

  const navigation = [
    { name: "Mapas", href: "/", icon: Map },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg transition-transform duration-150 group-hover:scale-105">
              <Cloudy className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-card-foreground" style={{ fontFamily: 'var(--font-new-amsterdam)' }}>CS2 Smokes Hub</h1>
              <p className="text-sm text-muted-foreground">Arsenal Comunitário</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={() => window.open('https://github.com/devkoalaa', '_blank')}
              className="text-card-foreground hover:text-primary-foreground hover:bg-primary "
              title="GitHub"
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                onClick={() => {
                  router.push(item.href)
                  setIsOpen(false)
                }}
                className="text-card-foreground hover:text-primary-foreground hover:bg-primary "
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </Button>
            ))}
            <SteamLoginButton />
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="text-card-foreground hover:text-primary-foreground hover:bg-primary transition-colors"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
