"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Star, Calendar, Edit, Trash2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RatingStars } from "@/components/RatingStars"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { useAuth } from "@/contexts/AuthContext"
import { avaliacaoAPI } from "@/lib/api"
import { formatDate, formatRating } from "@/lib/utils"

export const MinhasAvaliacoes = () => {
  const { isAuthenticated } = useAuth()
  const [avaliacoes, setAvaliacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    notaMedia: 0,
    maisRecente: null,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  useEffect(() => {
    if (isAuthenticated) {
      fetchMinhasAvaliacoes()
    }
  }, [isAuthenticated, pagination.page])

  const fetchMinhasAvaliacoes = async () => {
    setLoading(true)
    try {
      console.log("Buscando minhas avaliações...") // Debug
      
      const response = await avaliacaoAPI.getMinhas({
        page: pagination.page,
        limit: pagination.limit,
      })

      console.log("Resposta da API:", response.data) // Debug

      const avaliacoesList = response.data.avaliacoes || []
      setAvaliacoes(avaliacoesList)
      setPagination(response.data.pagination || pagination)

      // ✅ CORRIGIDO: Calcular estatísticas com verificação
      if (avaliacoesList.length > 0) {
        const notas = avaliacoesList.map(av => {
          const nota = parseFloat(av.nota)
          console.log("Nota individual:", nota) // Debug
          return isNaN(nota) ? 0 : nota
        })
        
        const somaNotas = notas.reduce((acc, nota) => acc + nota, 0)
        const notaMedia = somaNotas / notas.length

        console.log("Cálculo de média:", { notas, somaNotas, notaMedia }) // Debug

        setStats({
          total: response.data.pagination?.total || avaliacoesList.length,
          notaMedia: isNaN(notaMedia) ? 0 : notaMedia,
          maisRecente: avaliacoesList[0] || null,
        })
      } else {
        setStats({
          total: 0,
          notaMedia: 0,
          maisRecente: null,
        })
      }
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error)
      console.error("Detalhes do erro:", error.response?.data) // Debug
      
      // Definir valores padrão em caso de erro
      setStats({
        total: 0,
        notaMedia: 0,
        maisRecente: null,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletarAvaliacao = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta avaliação?")) return

    try {
      await avaliacaoAPI.delete(id)
      fetchMinhasAvaliacoes()
      alert("Avaliação excluída com sucesso!")
    } catch (error) {
      console.error("Erro ao deletar avaliação:", error)
      alert("Erro ao excluir avaliação")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p className="text-muted-foreground mb-6">Você precisa estar logado para ver suas avaliações.</p>
        <Button asChild>
          <Link to="/login">Fazer Login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Minhas Avaliações</h1>
        <p className="text-muted-foreground">Todas as suas avaliações e comentários sobre animações</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Total de Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Animações avaliadas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Sua Nota Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-6 w-6 text-yellow-400 fill-current" />
                <span className="text-3xl font-bold">{formatRating(stats.notaMedia)}</span>
              </div>
              <RatingStars rating={Math.round(stats.notaMedia)} readonly size="small" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Última Avaliação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              {stats.maisRecente ? (
                <>
                  <p className="font-medium text-sm mb-1">{stats.maisRecente.titulo}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(stats.maisRecente.updated_at)}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma avaliação ainda</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          {avaliacoes.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Você ainda não avaliou nenhuma animação</h3>
              <p className="text-muted-foreground mb-6">
                Comece explorando nosso catálogo e compartilhe suas opiniões!
              </p>
              <Button asChild>
                <Link to="/explorar">Explorar Animações</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Suas Avaliações ({pagination.total})</h2>
              </div>

              <div className="grid gap-6">
                {avaliacoes.map((avaliacao) => (
                  <Card key={avaliacao.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Link to={`/anime/${avaliacao.animacao_id}`} className="flex-shrink-0">
                          <img
                            src={avaliacao.poster_url || "/placeholder.svg?height=120&width=80"}
                            alt={avaliacao.titulo}
                            className="w-20 h-28 object-cover rounded-md"
                          />
                        </Link>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <Link
                                to={`/anime/${avaliacao.animacao_id}`}
                                className="text-lg font-semibold hover:text-primary transition-colors"
                              >
                                {avaliacao.titulo}
                              </Link>
                              {avaliacao.ano_lancamento && (
                                <p className="text-sm text-muted-foreground">{avaliacao.ano_lancamento}</p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" asChild className="gap-2">
                                <Link to={`/anime/${avaliacao.animacao_id}`}>
                                  <Edit className="h-3 w-3" />
                                  Editar
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeletarAvaliacao(avaliacao.id)}
                                className="gap-2"
                              >
                                <Trash2 className="h-3 w-3" />
                                Excluir
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mb-3">
                            <RatingStars rating={avaliacao.nota} readonly size="small" />
                            <span className="text-sm font-medium">{avaliacao.nota}/5</span>
                            <span className="text-xs text-muted-foreground">
                              Avaliado em {formatDate(avaliacao.created_at)}
                              {avaliacao.updated_at !== avaliacao.created_at &&
                                ` • Editado em ${formatDate(avaliacao.updated_at)}`}
                            </span>
                          </div>

                          {avaliacao.comentario && (
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{avaliacao.comentario}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Paginação */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {pagination.page} de {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
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
