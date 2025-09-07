"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Map, Menu, Target, Github } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { SteamLoginButton } from "@/components/auth/SteamLoginButton"

export function Header() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: "Mapas", href: "/", icon: Map },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/') }>
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg transition-transform duration-150 group-hover:scale-105">
              <Target className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-card-foreground">CS2 Smokes Hub</h1>
              <p className="text-sm text-muted-foreground">Em busca da perfeitinha</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={() => window.open('https://github.com/devkoalaa', '_blank')}
              className="text-card-foreground hover:text-primary-foreground hover:bg-primary transition-transform duration-150 hover:scale-105"
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
                className="text-card-foreground hover:text-primary-foreground hover:bg-primary transition-transform duration-150 hover:scale-105"
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </Button>
            ))}
            <SteamLoginButton />
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-card-foreground hover:text-primary-foreground hover:bg-primary">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      onClick={() => {
                        router.push(item.href)
                        setIsOpen(false)
                      }}
                      className="justify-start text-card-foreground hover:text-primary-foreground hover:bg-primary transition-transform duration-150 hover:scale-105"
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      window.open('https://github.com/devkoalaa', '_blank')
                      setIsOpen(false)
                    }}
                    className="justify-start text-card-foreground hover:text-primary-foreground hover:bg-primary"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                  <div className="pt-4">
                    <SteamLoginButton />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
