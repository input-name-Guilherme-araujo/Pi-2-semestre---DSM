"use client"

import { useState, useEffect } from "react"
import { User, Calendar, Star, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { authAPI, listaAPI } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

export const Perfil = () => {
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({
    totalAvaliacoes: 0,
    totalLista: 0,
    notaMedia: 0,
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile()
      fetchStats()
    }
  }, [isAuthenticated])

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile()
      setProfile(response.data)
    } catch (error) {
      console.error("Erro ao carregar perfil:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [listaResponse, avaliacoesResponse] = await Promise.all([
        listaAPI.getMinha(),
        // Assumindo que temos uma rota para buscar avaliações do usuário
        // avaliacaoAPI.getMinhas()
      ])

      setStats({
        totalLista: listaResponse.data.lista.length,
        totalAvaliacoes: 0, // Seria preenchido com avaliacoesResponse
        notaMedia: 0, // Calculado das avaliações
      })
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p className="text-muted-foreground mb-6">Você precisa estar logado para ver seu perfil.</p>
        <Button onClick={() => navigate("/login")}>Fazer Login</Button>
      </div>
    )
  }

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <User className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">{profile.nome}</h1>
        <p className="text-muted-foreground">{profile.email}</p>
        <Badge variant={profile.role === "admin" ? "default" : "secondary"} className="mt-2">
          {profile.role === "admin" ? "Administrador" : "Usuário"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{stats.totalAvaliacoes}</p>
              <p className="text-sm text-muted-foreground">Total de avaliações</p>
              {stats.notaMedia > 0 && (
                <p className="text-sm mt-2">
                  Nota média: <span className="font-semibold">{stats.notaMedia.toFixed(1)}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Minha Lista
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{stats.totalLista}</p>
              <p className="text-sm text-muted-foreground">Animações na lista</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Membro desde
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-lg font-semibold">{formatDate(profile.created_at)}</p>
              <p className="text-sm text-muted-foreground">Data de cadastro</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nome</label>
              <Input value={profile.nome} disabled />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input value={profile.email} disabled />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Para alterar suas informações, entre em contato com o suporte.
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/minha-lista">Ver Minha Lista</a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/explorar">Explorar Animações</a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/lancamentos">Ver Lançamentos</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferências</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Notificações por email</span>
              <input type="checkbox" className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Perfil público</span>
              <input type="checkbox" className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Recomendações personalizadas</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
