"use client"

import { useState, useEffect } from "react"
import { Users, Film, Star, MessageCircle, Plus, TrendingUp, Award, UserCheck, Activity, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { useAuth } from "@/contexts/AuthContext"
import { statsAPI } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { NovaAnimacaoModal } from "@/components/NovaAnimacaoModal"
import { GerenciarAnimacoesModal } from "@/components/GerenciarAnimacoesModal"

export const AdminDashboard = () => {
  const { isAdmin } = useAuth()
  const [stats, setStats] = useState({
    totals: {
      animacoes: 0,
      usuarios: 0,
      avaliacoes: 0,
      comentariosPendentes: 0,
    },
    crescimento: {
      animacoesMes: 0,
      usuariosMes: 0,
      avaliacoesMes: 0,
    },
    topAnimacoes: [],
    usuariosAtivos: [],
    generoStats: [],
    ultimasAvaliacoes: [],
  })
  const [recentAnimacoes, setRecentAnimacoes] = useState([])
  const [usuariosRecentes, setUsuariosRecentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNovaAnimacaoModal, setShowNovaAnimacaoModal] = useState(false)
  const [showGerenciarAnimacoesModal, setShowGerenciarAnimacoesModal] = useState(false)

  useEffect(() => {
    if (isAdmin && isAdmin()) {
      fetchDashboardData()
    }
  }, [isAdmin])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Buscar todas as estatísticas em paralelo
      const [statsResponse, animacoesResponse, usuariosResponse] = await Promise.all([
        statsAPI.getDashboard(),
        statsAPI.getRecentAnimacoes({ limit: 8 }),
        statsAPI.getUsuariosRecentes({ limit: 8 }),
      ])

      setStats(statsResponse.data)
      setRecentAnimacoes(animacoesResponse.data)
      setUsuariosRecentes(usuariosResponse.data)
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnimacaoCreated = () => {
    fetchDashboardData() // Recarregar estatísticas
  }

  const handleAnimacaoUpdated = () => {
    fetchDashboardData() // Recarregar estatísticas
  }

  if (!isAdmin || !isAdmin()) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
        <p className="text-muted-foreground">Você não tem permissão para acessar esta área.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Gerencie a plataforma AnimaList</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            className="gap-2"
            onClick={() => setShowGerenciarAnimacoesModal(true)}
          >
            <Settings className="h-4 w-4" />
            Gerenciar Animações
          </Button>
          <Button 
            className="gap-2"
            onClick={() => setShowNovaAnimacaoModal(true)}
          >
            <Plus className="h-4 w-4" />
            Nova Animação
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Animações</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totals.animacoes}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.crescimento.animacoesMes} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totals.usuarios}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.crescimento.usuariosMes} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totals.avaliacoes}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.crescimento.avaliacoesMes} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliações Recentes</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totals.comentariosPendentes}</div>
            <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção Principal com Dados Detalhados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Animações Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              Animações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAnimacoes.slice(0, 5).map((anime) => (
                <div key={anime.id} className="flex items-center gap-4">
                  <img
                    src={anime.poster_url || "/placeholder.svg?height=60&width=40"}
                    alt={anime.titulo}
                    className="w-10 h-14 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-1">{anime.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {anime.ano_lancamento} • {anime.episodios} eps
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ⭐ {anime.nota_media || 'N/A'} ({anime.total_avaliacoes || 0} avaliações)
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {anime.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usuários Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Usuários Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usuariosRecentes.slice(0, 5).map((usuario) => (
                <div key={usuario.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {usuario.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-1">{usuario.nome}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{usuario.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(usuario.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={usuario.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                      {usuario.role}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {usuario.total_avaliacoes} avaliações
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Animações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Mais Bem Avaliadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topAnimacoes.map((anime, index) => (
                <div key={anime.id} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold">{index + 1}</span>
                  </div>
                  <img
                    src={anime.poster_url || "/placeholder.svg?height=40&width=30"}
                    alt={anime.titulo}
                    className="w-6 h-8 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-1">{anime.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      ⭐ {anime.nota_media} ({anime.total_avaliacoes} avaliações)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por Gênero */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Distribuição por Gênero
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.generoStats.map((genero) => (
              <div key={genero.nome} className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold text-primary">{genero.total}</div>
                <div className="text-sm text-muted-foreground">{genero.nome}</div>
                <div 
                  className="w-4 h-4 rounded-full mx-auto mt-2" 
                  style={{ backgroundColor: genero.cor || '#6366f1' }}
                ></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Últimas Atividades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Últimas Avaliações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.ultimasAvaliacoes.slice(0, 5).map((avaliacao) => (
              <div key={avaliacao.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {avaliacao.usuario_nome} avaliou "{avaliacao.anime_titulo}"
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(avaliacao.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{avaliacao.nota}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            className="justify-start gap-2"
            onClick={() => setShowGerenciarAnimacoesModal(true)}
          >
            <Settings className="h-4 w-4" />
            Gerenciar Animações
          </Button>
          <Button variant="outline" className="justify-start gap-2">
            <MessageCircle className="h-4 w-4" />
            Moderar Comentários
          </Button>
          <Button variant="outline" className="justify-start gap-2">
            <Users className="h-4 w-4" />
            Gerenciar Usuários
          </Button>
          <Button variant="outline" className="justify-start gap-2">
            <TrendingUp className="h-4 w-4" />
            Ver Relatórios
          </Button>
        </CardContent>
      </Card>

      {/* Modais */}
      <NovaAnimacaoModal
        isOpen={showNovaAnimacaoModal}
        onClose={() => setShowNovaAnimacaoModal(false)}
        onSuccess={handleAnimacaoCreated}
      />

      <GerenciarAnimacoesModal
        isOpen={showGerenciarAnimacoesModal}
        onClose={() => setShowGerenciarAnimacoesModal(false)}
        onSuccess={handleAnimacaoUpdated}
      />
    </div>
  )
}
