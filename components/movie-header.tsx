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
    <header 
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10"
      role="banner"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl sm:text-2xl font-serif font-bold" style={{ color: "#D4312C" }}>
            <a 
              href="#inicio" 
              className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black rounded-md px-1"
              aria-label="Prato Frio - Voltar ao início"
            >
              PRATO FRIO
            </a>
          </h1>
        </div>

        <nav 
          className="hidden md:flex items-center space-x-6 lg:space-x-8" 
          role="navigation"
          aria-label="Navegação principal"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black rounded-md px-2 py-1"
              aria-label={`Ir para ${item.label}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* User Menu - Desktop */}
        {isAuthenticated && user ? (
          <div className="hidden md:flex items-center gap-3">
            <div 
              className="flex items-center gap-2 text-white bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20"
              role="status"
              aria-label={`Usuário logado: ${user.firstName} ${user.lastName}`}
            >
              <User className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-medium">
                {user.firstName} {user.lastName}
              </span>
            </div>
            <Button
              onClick={logout}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
              aria-label="Sair da conta"
            >
              <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
              Sair
            </Button>
          </div>
        ) : null}

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="right" 
            className="w-[300px] sm:w-[400px] bg-black border-gray-800"
            aria-label="Menu de navegação"
          >
            <nav className="flex flex-col space-y-4 mt-8" role="navigation" aria-label="Menu de navegação mobile">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-lg font-medium text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black rounded-md px-2 py-1"
                  onClick={() => setIsOpen(false)}
                  aria-label={`Ir para ${item.label}`}
                >
                  {item.label}
                </a>
              ))}
              
              {/* User Menu - Mobile */}
              {isAuthenticated && user && (
                <div className="pt-4 border-t border-gray-700">
                  <div 
                    className="flex items-center gap-3 mb-4 p-3 bg-black/40 backdrop-blur-sm rounded-lg border border-white/20"
                    role="status"
                    aria-label={`Usuário logado: ${user.firstName} ${user.lastName}`}
                  >
                    <User className="h-5 w-5 text-white" aria-hidden="true" />
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
                    className="w-full justify-start text-lg font-medium text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
                    aria-label="Sair da conta"
                  >
                    <LogOut className="h-5 w-5 mr-3" aria-hidden="true" />
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
