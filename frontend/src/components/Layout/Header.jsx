"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, User, LogOut, Menu, X, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-xl">AnimaList</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/explorar" className="text-sm font-medium hover:text-primary transition-colors">
              Explorar
            </Link>
            <Link to="/lancamentos" className="text-sm font-medium hover:text-primary transition-colors">
              Lançamentos
            </Link>
            {isAuthenticated && (
              <Link to="/minha-lista" className="text-sm font-medium hover:text-primary transition-colors">
                Minha Lista
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/minhas-avaliacoes" className="text-sm font-medium hover:text-primary transition-colors">
                Minhas Avaliações
              </Link>
            )}
            {/* ADICIONAR: Link do Dashboard para admins */}
            {isAuthenticated && isAdmin && isAdmin() && (
              <Link to="/admin/dashboard" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                <Settings className="h-4 w-4" />
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar animações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </form>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/perfil">
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link to="/registro">
                <Button>Criar Conta</Button>
              </Link>
            </div>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar animações..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            <nav className="flex flex-col space-y-2">
              <Link
                to="/explorar"
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Explorar
              </Link>
              <Link
                to="/lancamentos"
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Lançamentos
              </Link>
              {isAuthenticated && (
                <Link
                  to="/minha-lista"
                  className="text-sm font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Minha Lista
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  to="/minhas-avaliacoes"
                  className="text-sm font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Minhas Avaliações
                </Link>
              )}
              {/* ADICIONAR: Link do Dashboard no menu mobile */}
              {isAuthenticated && isAdmin && isAdmin() && (
                <Link
                  to="/admin/dashboard"
                  className="text-sm font-medium hover:text-primary transition-colors py-2 flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Dashboard Admin
                </Link>
              )}
            </nav>

            {isAuthenticated ? (
              <div className="flex flex-col gap-2 pt-4 border-t">
                <Link to="/perfil" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Meu Perfil
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-4 border-t">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Entrar
                  </Button>
                </Link>
                <Link to="/registro" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Criar Conta</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
