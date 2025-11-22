"use client"

import { SteamLoginButton } from "@/components/auth/SteamLoginButton"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useMobileSidebar } from "@/contexts/MobileSidebarContext"
import { Github, Map, Menu, Cloudy } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export function Header() {
  const router = useRouter()
  const { toggleSidebar, setIsOpen } = useMobileSidebar()
  const { isAuthenticated } = useAuth()

  const navigation = [
    { name: "Mapas", href: "/", icon: Map },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 select-none">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => router.push('/')}
            whileHover="hover"
          >
            <div className="relative">
              <motion.div 
                className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg relative z-10"
                variants={{
                  hover: { 
                    scale: 1.05,
                    rotate: [0, -10, 10, -5, 5, 0],
                    transition: { duration: 0.5 }
                  }
                }}
              >
                <Cloudy className="w-6 h-6 text-primary-foreground" />
              </motion.div>
              <motion.div
                className="absolute inset-0 bg-primary/50 rounded-lg blur-md"
                variants={{
                  hover: { 
                    opacity: [0, 0.5, 0],
                    scale: [1, 1.2, 1.1],
                    transition: { duration: 1, repeat: Infinity }
                  }
                }}
                initial={{ opacity: 0 }}
              />
            </div>
            <div>
              <motion.h1 
                className="text-3xl font-bold text-card-foreground" 
                style={{ fontFamily: 'var(--font-new-amsterdam)' }}
                variants={{
                  hover: { x: 2 }
                }}
              >
                CS2 Smokes Hub
              </motion.h1>
              <p className="text-sm text-muted-foreground">Arsenal Comunitário</p>
            </div>
          </motion.div>

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
