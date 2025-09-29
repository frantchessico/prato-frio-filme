"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { Menu, LogOut, User } from "lucide-react"

export function MovieHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()

  const navItems = [
    { href: "#inicio", label: "Início" },
    { href: "#sinopse", label: "Sinopse" },
    { href: "#elenco", label: "Elenco" },
    { href: "#trailer", label: "Trailer" },
    { href: "#assistir", label: "Assistir Agora" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-serif font-bold" style={{ color: "#D4312C" }}>
            PRATO FRIO
          </h1>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* User Menu - Desktop */}
        {isAuthenticated && user ? (
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 text-white bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">
                {user.firstName} {user.lastName}
              </span>
            </div>
            <Button
              onClick={logout}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 border border-white/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        ) : null}

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6 text-white" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-black border-gray-800">
            <nav className="flex flex-col space-y-4 mt-8">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-lg font-medium text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              
              {/* User Menu - Mobile */}
              {isAuthenticated && user && (
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-3 mb-4 p-3 bg-black/40 backdrop-blur-sm rounded-lg border border-white/20">
                    <User className="h-5 w-5 text-white" />
                    <span className="text-white font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      logout()
                      setIsOpen(false)
                    }}
                    variant="ghost"
                    className="w-full justify-start text-lg font-medium text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sair da Conta
                  </Button>
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
