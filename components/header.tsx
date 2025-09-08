"use client"

import { SteamLoginButton } from "@/components/auth/SteamLoginButton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/AuthContext"
import { Github, LogOut, Map, Menu, Cloudy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function Header() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

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
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-card-foreground hover:text-primary-foreground hover:bg-primary">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]" showCloseButton={false}>
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="flex items-center justify-between gap-4 px-9">
                    {isAuthenticated && (
                      <div className="text-xl font-semibold text-card-foreground">{user?.username}</div>
                    )}
                    <Avatar className="h-16 w-16">
                      {isAuthenticated && user?.avatarUrl ? (
                        <AvatarImage src={user.avatarUrl} alt={user.username} />
                      ) : (
                        <AvatarFallback>?</AvatarFallback>
                      )}
                    </Avatar>
                  </div>

                  <div className="border-t border-border mx-4"></div>

                  {navigation.map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      onClick={() => {
                        router.push(item.href)
                        setIsOpen(false)
                      }}
                      className="justify-center w-full text-card-foreground hover:text-primary-foreground hover:bg-primary "
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
                    className="justify-center w-full text-card-foreground hover:text-primary-foreground hover:bg-primary"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                  <div className="pt-2 w-full flex justify-center">
                    {isAuthenticated ? (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </Button>
                    ) : (
                      <SteamLoginButton />
                    )}
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
