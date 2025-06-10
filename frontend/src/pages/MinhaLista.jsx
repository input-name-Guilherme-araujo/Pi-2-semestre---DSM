"use client"

import { useState, useEffect } from "react"
import { Bookmark, Heart, Play, Pause, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimeCard } from "@/components/AnimeCard"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { useAuth } from "@/contexts/AuthContext"
import { listaAPI } from "@/lib/api"
import { getListStatusColor } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

export const MinhaLista = () => {
  const { isAuthenticated } = useAuth()
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState("")
  const [error, setError] = useState("")
  const [stats, setStats] = useState({
    assistido: 0,
    desejado: 0,
    assistindo: 0,
    pausado: 0,
    abandonado: 0,
  })
  const [paginacao, setPaginacao] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      fetchMinhaLista()
    }
  }, [isAuthenticated, filtroStatus])

  const fetchMinhaLista = async (page = 1) => {
    setLoading(true)
    setError("")
    try {
      console.log("Buscando lista com filtro:", filtroStatus, "página:", page) // Debug

      const params = {
        page,
        limit: paginacao.limit,
      }

      if (filtroStatus && filtroStatus !== "") {
        params.status = filtroStatus
      }

      console.log("Parâmetros da requisição:", params) // Debug

      const response = await listaAPI.getMinha(params)

      console.log("Resposta da API:", response.data) // Debug

      if (response.data && Array.isArray(response.data.lista)) {
        setLista(response.data.lista)
        setPaginacao(response.data.pagination || paginacao)

        // Calcular estatísticas apenas se não houver filtro
        if (!filtroStatus || filtroStatus === "") {
          const newStats = response.data.lista.reduce(
            (acc, item) => {
              acc[item.status] = (acc[item.status] || 0) + 1
              return acc
            },
            {
              assistido: 0,
              desejado: 0,
              assistindo: 0,
              pausado: 0,
              abandonado: 0,
            }
          )
          console.log("Estatísticas calculadas:", newStats) // Debug
          setStats(newStats)
        }
      } else {
        console.error("Formato de resposta inesperado:", response.data)
        setLista([])
        setError("Formato de dados inválido recebido do servidor")
      }
    } catch (error) {
      console.error("Erro ao carregar lista:", error)
      console.error("Detalhes do erro:", error.response?.data)

      setError(
        error.response?.data?.error ||
          "Erro ao carregar sua lista. Tente novamente."
      )
      setLista([])
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromLista = async (animacaoId) => {
    try {
      console.log("Removendo animação da lista:", animacaoId) // Debug

      await listaAPI.remove(animacaoId)

      // Recarregar a lista completa para atualizar estatísticas
      await fetchMinhaLista(paginacao.page)

      console.log("Animação removida com sucesso") // Debug
    } catch (error) {
      console.error("Erro ao remover da lista:", error)
      setError("Erro ao remover animação da lista")
    }
  }

  const handlePageChange = (newPage) => {
    fetchMinhaLista(newPage)
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p className="text-muted-foreground mb-6">
          Você precisa estar logado para ver sua lista pessoal.
        </p>
        <Button onClick={() => navigate("/login")}>Fazer Login</Button>
      </div>
    )
  }

  const statusOptions = [
    {
      value: "",
      label: "Todos",
      icon: null,
      count: Object.values(stats).reduce((a, b) => a + b, 0),
    },
    {
      value: "assistido",
      label: "Assistido",
      icon: Bookmark,
      count: stats.assistido || 0,
    },
    {
      value: "desejado",
      label: "Quero Assistir",
      icon: Heart,
      count: stats.desejado || 0,
    },
    {
      value: "assistindo",
      label: "Assistindo",
      icon: Play,
      count: stats.assistindo || 0,
    },
    { value: "pausado", label: "Pausado", icon: Pause, count: stats.pausado || 0 },
    {
      value: "abandonado",
      label: "Abandonado",
      icon: X,
      count: stats.abandonado || 0,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Minha Lista</h1>
        <p className="text-muted-foreground">
          Organize e acompanhe suas animações favoritas
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statusOptions.map((option) => {
          const Icon = option.icon
          return (
            <Card
              key={option.value}
              className={`cursor-pointer transition-colors ${
                filtroStatus === option.value ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setFiltroStatus(option.value)}
            >
              <CardContent className="p-4 text-center">
                {Icon && <Icon className="h-6 w-6 mx-auto mb-2 text-primary" />}
                <p className="font-medium text-sm">{option.label}</p>
                <p className="text-2xl font-bold text-primary">{option.count}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Conteúdo principal */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          {lista.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">
                {filtroStatus ? "Nenhuma animação encontrada" : "Sua lista está vazia"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {filtroStatus
                  ? `Você não tem animações com status "${statusOptions.find(
                      (s) => s.value === filtroStatus
                    )?.label}"`
                  : "Comece adicionando algumas animações à sua lista!"}
              </p>
              <Button onClick={() => navigate("/explorar")}>
                Explorar Animações
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {filtroStatus
                    ? statusOptions.find((s) => s.value === filtroStatus)?.label
                    : "Todas as Animações"}{" "}
                  ({paginacao.total || lista.length})
                </h2>
                {filtroStatus && (
                  <Button variant="outline" onClick={() => setFiltroStatus("")}>
                    Ver Todas
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {lista.map((item) => (
                  <div key={item.id} className="relative group">
                    <AnimeCard
                      anime={{
                        id: item.animacao_id,
                        titulo: item.titulo,
                        poster_url: item.poster_url,
                        nota_media: item.nota_media,
                        total_avaliacoes: item.total_avaliacoes,
                      }}
                      showActions={false}
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className={getListStatusColor(item.status)}>
                        {statusOptions.find((s) => s.value === item.status)?.label}
                      </Badge>
                    </div>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveFromLista(item.animacao_id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {paginacao.pages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={paginacao.page <= 1}
                    onClick={() => handlePageChange(paginacao.page - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-4">
                    Página {paginacao.page} de {paginacao.pages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={paginacao.page >= paginacao.pages}
                    onClick={() => handlePageChange(paginacao.page + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
