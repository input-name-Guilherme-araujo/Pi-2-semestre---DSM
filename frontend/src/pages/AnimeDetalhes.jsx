"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Star, Calendar, Play, Users, Heart, Bookmark, MessageCircle, Edit, Trash2, Flag, Pause, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { RatingStars } from "@/components/RatingStars"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { useAuth } from "@/contexts/AuthContext"
import { animacaoAPI, avaliacaoAPI, listaAPI } from "@/lib/api"
import { formatDate, formatRating, getStatusColor } from "@/lib/utils"

export const AnimeDetalhes = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [anime, setAnime] = useState(null)
  const [avaliacoes, setAvaliacoes] = useState([])
  const [minhaAvaliacao, setMinhaAvaliacao] = useState(null)
  const [loading, setLoading] = useState(true)
  const [avaliandoLoading, setAvaliandoLoading] = useState(false)
  const [editandoAvaliacao, setEditandoAvaliacao] = useState(false)
  const [novaAvaliacao, setNovaAvaliacao] = useState({
    nota: 0,
    comentario: "",
  })
  const [statusLista, setStatusLista] = useState("")
  const [paginacao, setPaginacao] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  useEffect(() => {
    if (id) {
      fetchAnimeDetalhes()
      fetchAvaliacoes()
      if (isAuthenticated) {
        fetchMinhaAvaliacao()
        fetchStatusLista() // Add this call
      }
    }
  }, [id, isAuthenticated])

  // Add this function to fetch the user's status for this anime
  const fetchStatusLista = async () => {
    try {
      const response = await listaAPI.getMinha()
      const item = response.data.lista.find(
        (item) => item.animacao_id === parseInt(id)
      )
      if (item) {
        setStatusLista(item.status)
      }
    } catch (error) {
      console.error("Erro ao buscar status na lista:", error)
    }
  }

  const fetchAnimeDetalhes = async () => {
    try {
      setLoading(true)
      const response = await animacaoAPI.getById(id)
      console.log("Detalhes da animação:", response.data)
      setAnime(response.data)
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error)
      if (error.response?.status === 404) {
        navigate("/explorar")
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchAvaliacoes = async (page = 1) => {
    try {
      console.log("Buscando avaliações para anime:", id, "página:", page) // Debug
      const response = await avaliacaoAPI.getByAnimacao(id, { 
        page, 
        limit: paginacao.limit 
      })
      
      console.log("Avaliações recebidas:", response.data) // Debug
      
      if (response.data && response.data.avaliacoes) {
        setAvaliacoes(response.data.avaliacoes)
        setPaginacao(response.data.pagination)
      } else {
        console.error("Formato de resposta inválido:", response.data)
        setAvaliacoes([])
        setPaginacao({ page: 1, limit: 10, total: 0, pages: 0 })
      }
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error)
      setAvaliacoes([]) // Garantir que avaliacoes seja um array vazio
    }
  }

  const fetchMinhaAvaliacao = async () => {
    try {
      // ✅ CORRETO: Buscar todas as avaliações e filtrar no frontend
      const response = await avaliacaoAPI.getByAnimacao(id)
      const minhaAval = response.data.avaliacoes.find((av) => av.usuario_id === user?.id)

      if (minhaAval) {
        setMinhaAvaliacao(minhaAval)
        setNovaAvaliacao({
          nota: minhaAval.nota,
          comentario: minhaAval.comentario || "",
        })
      } else {
        // Reset se não encontrar avaliação
        setMinhaAvaliacao(null)
        setNovaAvaliacao({ nota: 0, comentario: "" })
      }
    } catch (error) {
      console.error("Erro ao buscar minha avaliação:", error)
    }
  }

  const handleAvaliar = async () => {
    if (!isAuthenticated || novaAvaliacao.nota === 0) return

    setAvaliandoLoading(true)
    try {
      console.log("Salvando avaliação:", {
        isEdit: !!minhaAvaliacao,
        animacao_id: parseInt(id),
        nota: novaAvaliacao.nota,
        comentario: novaAvaliacao.comentario
      }) // Debug

      if (minhaAvaliacao) {
        // Editar avaliação existente
        console.log("Atualizando avaliação existente, ID:", minhaAvaliacao.id)
        
        await avaliacaoAPI.update(minhaAvaliacao.id, {
          animacao_id: parseInt(id), // ✅ INCLUIR animacao_id
          nota: novaAvaliacao.nota,
          comentario: novaAvaliacao.comentario,
        })
      } else {
        // Criar nova avaliação
        console.log("Criando nova avaliação")
        
        await avaliacaoAPI.create({
          animacao_id: parseInt(id),
          nota: novaAvaliacao.nota,
          comentario: novaAvaliacao.comentario,
        })
      }

      // Atualizar todos os dados
      console.log("Atualizando dados após salvar avaliação")
      await Promise.all([
        fetchAnimeDetalhes(),
        fetchAvaliacoes(),
        fetchMinhaAvaliacao()
      ])

      setEditandoAvaliacao(false)

      // Feedback de sucesso
      const message = minhaAvaliacao ? 
        "Avaliação atualizada com sucesso!" : 
        "Avaliação criada com sucesso!"
      alert(message)
      
    } catch (error) {
      console.error("Erro ao avaliar:", error)
      console.error("Resposta do erro:", error.response?.data)
      console.error("Status do erro:", error.response?.status)
      
      // Tratamento de erro mais detalhado
      let errorMessage = "Erro ao salvar avaliação"
      
      if (error.response?.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error
        } else if (error.response.data.details && error.response.data.details.length > 0) {
          errorMessage = error.response.data.details[0]
        }
      }
      
      alert(errorMessage)
    } finally {
      setAvaliandoLoading(false)
    }
  }

  const handleDeletarAvaliacao = async () => {
    if (!minhaAvaliacao || !confirm("Tem certeza que deseja excluir sua avaliação?")) return

    try {
      await avaliacaoAPI.delete(minhaAvaliacao.id)

      // Resetar estado
      setMinhaAvaliacao(null)
      setNovaAvaliacao({ nota: 0, comentario: "" })

      // Atualizar dados
      await Promise.all([fetchAnimeDetalhes(), fetchAvaliacoes()])

      alert("Avaliação excluída com sucesso!")
    } catch (error) {
      console.error("Erro ao deletar avaliação:", error)
      alert("Erro ao excluir avaliação")
    }
  }

  const handleAddToLista = async (status) => {
    if (!isAuthenticated) return

    try {
      console.log("Adicionando à lista:", { animacao_id: parseInt(id), status }) // Debug
      
      await listaAPI.add({
        animacao_id: parseInt(id), // Garantir que é número
        status,
      })
      
      setStatusLista(status)
      
      // Feedback visual melhorado
      const statusLabels = {
        assistindo: "Assistindo",
        desejado: "Quero Assistir", 
        assistido: "Assistido",
        pausado: "Pausado",
        abandonado: "Abandonado"
      }
      
      alert(`Animação adicionada à lista como "${statusLabels[status]}"`)
      
    } catch (error) {
      console.error("Erro ao adicionar à lista:", error)
      console.error("Detalhes do erro:", error.response?.data)
      
      const errorMessage = error.response?.data?.error || "Erro ao adicionar à lista"
      alert(errorMessage)
    }
  }

  const handleRemoveFromLista = async () => {
    if (!isAuthenticated || !statusLista) return

    if (!confirm("Tem certeza que deseja remover esta animação da sua lista?")) return

    try {
      console.log("Removendo animação da lista, ID:", id) // Debug
      
      // ✅ CORRIGIDO: Passar apenas o ID da animação como parâmetro
      await listaAPI.remove(id) // Não passar objeto, apenas o ID
      
      setStatusLista("")
      alert("Animação removida da lista com sucesso!")
      
    } catch (error) {
      console.error("Erro ao remover da lista:", error)
      console.error("Detalhes do erro:", error.response?.data)
      
      const errorMessage = error.response?.data?.error || "Erro ao remover da lista"
      alert(errorMessage)
    }
  }

  const handleReportarComentario = async (avaliacaoId) => {
    // Funcionalidade futura para reportar comentários inadequados
    alert("Comentário reportado para moderação")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!anime) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Animação não encontrada</h1>
        <p className="text-muted-foreground mb-6">A animação que você procura não existe ou foi removida.</p>
        <Link to="/explorar">
          <Button>Voltar para Explorar</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header com Banner */}
      <div className="relative">
        {anime.banner_url && (
          <div className="absolute inset-0 -z-10">
            <img
              src={anime.banner_url || "/placeholder.svg"}
              alt=""
              className="w-full h-96 object-cover opacity-20"
              onError={(e) => {
                e.target.style.display = "none"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
          {/* Poster */}
          <div className="lg:col-span-1">
            <img
              src={anime.poster_url || "/placeholder.svg?height=600&width=400"}
              alt={anime.titulo}
              className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
              onError={(e) => {
                e.target.src = "/placeholder.svg?height=600&width=400"
              }}
            />
          </div>

          {/* Informações Principais */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{anime.titulo}</h1>
              {anime.titulo_original && anime.titulo_original !== anime.titulo && (
                <p className="text-xl text-muted-foreground mb-4">{anime.titulo_original}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold">{formatRating(anime.nota_media)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({anime.total_avaliacoes} {anime.total_avaliacoes === 1 ? "avaliação" : "avaliações"})
                  </span>
                </div>
                <Badge className={getStatusColor(anime.status)}>{anime.status}</Badge>
                {anime.ano_lancamento && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{anime.ano_lancamento}</span>
                  </div>
                )}
                {anime.episodios && (
                  <div className="flex items-center gap-1">
                    <Play className="h-4 w-4" />
                    <span>
                      {anime.episodios} {anime.episodios === 1 ? "episódio" : "episódios"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {anime.generos && Array.isArray(anime.generos) ? (
                  anime.generos.map((genero, index) => (
                    <Badge 
                      key={genero.id || index} 
                      variant="outline" 
                      style={{ 
                        borderColor: genero.cor || '#888888', 
                        color: genero.cor || '#888888' 
                      }}
                    >
                      {typeof genero === 'object' ? genero.nome : genero}
                    </Badge>
                  ))
                ) : null}
              </div>

              {anime.sinopse && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Sinopse</h3>
                  <p className="text-muted-foreground leading-relaxed">{anime.sinopse}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                {anime.estudio && (
                  <div>
                    <span className="font-medium">Estúdio:</span>
                    <p className="text-muted-foreground">{anime.estudio}</p>
                  </div>
                )}
                {anime.diretor && (
                  <div>
                    <span className="font-medium">Diretor:</span>
                    <p className="text-muted-foreground">{anime.diretor}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ações da Lista */}
            {isAuthenticated && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Adicionar à Minha Lista</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  <Button
                    onClick={() => handleAddToLista("assistindo")}
                    variant={statusLista === "assistindo" ? "default" : "outline"}
                    className="gap-2 text-center flex-col h-auto py-3"
                    size="sm"
                  >
                    <Play className="h-4 w-4" />
                    <span className="text-xs">Assistindo</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleAddToLista("desejado")}
                    variant={statusLista === "desejado" ? "default" : "outline"}
                    className="gap-2 text-center flex-col h-auto py-3"
                    size="sm"
                  >
                    <Heart className="h-4 w-4" />
                    <span className="text-xs">Quero Assistir</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleAddToLista("assistido")}
                    variant={statusLista === "assistido" ? "default" : "outline"}
                    className="gap-2 text-center flex-col h-auto py-3"
                    size="sm"
                  >
                    <Bookmark className="h-4 w-4" />
                    <span className="text-xs">Assistido</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleAddToLista("pausado")}
                    variant={statusLista === "pausado" ? "default" : "outline"}
                    className="gap-2 text-center flex-col h-auto py-3"
                    size="sm"
                  >
                    <Pause className="h-4 w-4" />
                    <span className="text-xs">Pausado</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleAddToLista("abandonado")}
                    variant={statusLista === "abandonado" ? "default" : "outline"}
                    className="gap-2 text-center flex-col h-auto py-3"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                    <span className="text-xs">Abandonado</span>
                  </Button>
                </div>
                
                {statusLista && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Status atual:</span>
                      <Badge variant="outline" className="text-xs">
                        {statusLista === "assistindo" && "Assistindo"}
                        {statusLista === "desejado" && "Quero Assistir"}
                        {statusLista === "assistido" && "Assistido"}
                        {statusLista === "pausado" && "Pausado"}
                        {statusLista === "abandonado" && "Abandonado"}
                      </Badge>
                    </div>
                    <Button
                      onClick={handleRemoveFromLista}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      Remover da Lista
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Seção Principal - Avaliações */}
        <div className="lg:col-span-2 space-y-6">
          {/* Formulário de Avaliação */}
          {isAuthenticated && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{minhaAvaliacao ? "Sua Avaliação" : "Avaliar esta Animação"}</span>
                  {minhaAvaliacao && !editandoAvaliacao && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditandoAvaliacao(true)} className="gap-2">
                        <Edit className="h-3 w-3" />
                        Editar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={handleDeletarAvaliacao} className="gap-2">
                        <Trash2 className="h-3 w-3" />
                        Excluir
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {minhaAvaliacao && !editandoAvaliacao ? (
                  // Exibir avaliação existente
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Sua Nota</label>
                      <RatingStars rating={minhaAvaliacao.nota} readonly size="large" />
                    </div>
                    {minhaAvaliacao.comentario && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Seu Comentário</label>
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm">{minhaAvaliacao.comentario}</p>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Avaliado em {formatDate(minhaAvaliacao.created_at)}
                      {minhaAvaliacao.updated_at !== minhaAvaliacao.created_at &&
                        ` • Editado em ${formatDate(minhaAvaliacao.updated_at)}`}
                    </p>
                  </div>
                ) : (
                  // Formulário de avaliação
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Sua Nota <span className="text-red-500">*</span>
                      </label>
                      <RatingStars
                        rating={novaAvaliacao.nota}
                        onRatingChange={(nota) => setNovaAvaliacao((prev) => ({ ...prev, nota }))}
                        size="large"
                      />
                      {novaAvaliacao.nota > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {novaAvaliacao.nota === 1 && "Muito ruim"}
                          {novaAvaliacao.nota === 2 && "Ruim"}
                          {novaAvaliacao.nota === 3 && "Regular"}
                          {novaAvaliacao.nota === 4 && "Bom"}
                          {novaAvaliacao.nota === 5 && "Excelente"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Comentário (opcional)</label>
                      <Textarea
                        value={novaAvaliacao.comentario}
                        onChange={(e) => setNovaAvaliacao((prev) => ({ ...prev, comentario: e.target.value }))}
                        placeholder="Compartilhe sua opinião sobre esta animação... O que você achou da história, personagens, animação, trilha sonora?"
                        className="min-h-[120px] resize-none"
                        maxLength={1000}
                      />
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-muted-foreground">
                          {novaAvaliacao.comentario.length}/1000 caracteres
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Seja respeitoso e construtivo em seus comentários
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleAvaliar}
                        disabled={novaAvaliacao.nota === 0 || avaliandoLoading}
                        className="flex-1"
                      >
                        {avaliandoLoading ? "Salvando..." : minhaAvaliacao ? "Atualizar Avaliação" : "Enviar Avaliação"}
                      </Button>

                      {editandoAvaliacao && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditandoAvaliacao(false)
                            setNovaAvaliacao({
                              nota: minhaAvaliacao.nota,
                              comentario: minhaAvaliacao.comentario || "",
                            })
                          }}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Lista de Avaliações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Avaliações da Comunidade
                <Badge variant="secondary">{paginacao.total}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {avaliacoes.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Ainda não há avaliações</p>
                  <p className="text-muted-foreground">
                    {isAuthenticated
                      ? "Seja o primeiro a avaliar esta animação!"
                      : "Faça login para avaliar esta animação."}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {avaliacoes
                    .filter((av) => av.usuario_id !== user?.id) // Não mostrar a própria avaliação aqui
                    .map((avaliacao) => (
                      <div key={avaliacao.id} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {avaliacao.avatar_url ? (
                              <img
                                src={avaliacao.avatar_url || "/placeholder.svg"}
                                alt={avaliacao.usuario_nome}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <Users className="h-6 w-6 text-primary" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span className="font-medium text-sm">{avaliacao.usuario_nome}</span>
                              <RatingStars rating={avaliacao.nota} readonly size="small" />
                              <span className="text-xs text-muted-foreground">
                                {formatDate(avaliacao.created_at)}
                                {avaliacao.updated_at !== avaliacao.created_at && " (editado)"}
                              </span>

                              {isAuthenticated && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleReportarComentario(avaliacao.id)}
                                  className="ml-auto gap-1 text-xs"
                                >
                                  <Flag className="h-3 w-3" />
                                  Reportar
                                </Button>
                              )}
                            </div>

                            {avaliacao.comentario && (
                              <div className="bg-muted/50 rounded-lg p-3 mt-2">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{avaliacao.comentario}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Paginação */}
                  {paginacao.pages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={paginacao.page === 1}
                        onClick={() => fetchAvaliacoes(paginacao.page - 1)}
                      >
                        Anterior
                      </Button>
                      <span className="text-sm text-muted-foreground px-3">
                        Página {paginacao.page} de {paginacao.pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={paginacao.page === paginacao.pages}
                        onClick={() => fetchAvaliacoes(paginacao.page + 1)}
                      >
                        Próxima
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Informações e Estatísticas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <Badge className={getStatusColor(anime.status)}>{anime.status}</Badge>
              </div>
              {anime.ano_lancamento && (
                <div className="flex justify-between">
                  <span className="font-medium">Ano:</span>
                  <span>{anime.ano_lancamento}</span>
                </div>
              )}
              {anime.episodios && (
                <div className="flex justify-between">
                  <span className="font-medium">Episódios:</span>
                  <span>{anime.episodios}</span>
                </div>
              )}
              {anime.estudio && (
                <div className="flex justify-between">
                  <span className="font-medium">Estúdio:</span>
                  <span className="text-right">{anime.estudio}</span>
                </div>
              )}
              {anime.diretor && (
                <div className="flex justify-between">
                  <span className="font-medium">Diretor:</span>
                  <span className="text-right">{anime.diretor}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Avaliação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-6 w-6 text-yellow-400 fill-current" />
                  <span className="text-3xl font-bold">{formatRating(anime.nota_media)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {anime.total_avaliacoes} {anime.total_avaliacoes === 1 ? "avaliação" : "avaliações"}
                </p>
              </div>

              {/* Distribuição de notas (mockup) */}
              <div className="space-y-2">
                <div className="text-xs font-medium mb-2">Distribuição de Notas</div>
                {[5, 4, 3, 2, 1].map((nota) => {
                  const count = anime.stats?.distribuicao?.[nota] || 0;
                  const total = anime.total_avaliacoes || 0;
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  
                  return (
                    <div key={nota} className="flex items-center gap-2 text-xs">
                      <span className="w-4">{nota}</span>
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }} 
                        />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/explorar">← Voltar para Explorar</Link>
              </Button>

              {isAuthenticated && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/minha-lista">Ver Minha Lista</Link>
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: anime.titulo,
                      text: `Confira ${anime.titulo} no AnimaList!`,
                      url: window.location.href,
                    })
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                    alert("Link copiado para a área de transferência!")
                  }
                }}
              >
                Compartilhar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
