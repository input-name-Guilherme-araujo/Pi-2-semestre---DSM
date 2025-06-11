// frontend/src/components/GerenciarAnimacoesModal.jsx
"use client"

import { useState, useEffect } from "react"
import { Search, Edit, Trash2, Plus, X, Save, Settings, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { animacaoAPI, generoAPI } from "@/lib/api"
import { formatDate } from "@/lib/utils"

// ✅ COMPONENTE SELECT SIMPLES
const SimpleSelect = ({ value, onValueChange, placeholder, options, className }) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
)

// Modal com scroll forçado
const SimpleModal = ({ isOpen, onClose, title, children, maxWidth = "max-w-6xl" }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div 
        className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-lg ${maxWidth} w-full mx-4 flex flex-col`}
        style={{ 
          maxHeight: '95vh',
          height: '95vh'
        }}
      >
        {/* Header fixo */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Conteúdo com scroll */}
        <div 
          className="flex-1 overflow-hidden"
          style={{ minHeight: 0 }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export const GerenciarAnimacoesModal = ({ isOpen, onClose, onSuccess }) => {
  const [animacoes, setAnimacoes] = useState([])
  const [generos, setGeneros] = useState([])
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedAnime, setSelectedAnime] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  // ✅ REMOVIDO DURACAO_EPISODIO DO FORMDATA
  const [formData, setFormData] = useState({
    titulo: "",
    titulo_original: "",
    sinopse: "",
    poster_url: "",
    banner_url: "",
    ano_lancamento: "",
    episodios: "",
    status: "",
    estudio: "",
    diretor: "",
    generos: [],
  })

  // ✅ ADICIONAR ESTADO PARA ERROS
  const [formErrors, setFormErrors] = useState({})

  const statusOptions = [
    "Em exibição",
    "Finalizado", 
    "Cancelado",
    "Anunciado"  // ✅ Correto conforme schema
  ]

  // ✅ ESTILOS DE SCROLL INLINE
  const scrollContainerStyle = {
    height: '100%',
    overflowY: 'auto',
    paddingRight: '8px',
    scrollbarWidth: 'thin',
    scrollbarColor: '#cbd5e1 #f1f5f9'
  }

  const scrollWebkitStyle = `
    .scroll-container::-webkit-scrollbar {
      width: 8px;
    }
    .scroll-container::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }
    .scroll-container::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    .scroll-container::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `

  useEffect(() => {
    // Adicionar estilos webkit
    if (typeof document !== 'undefined') {
      const style = document.createElement('style')
      style.textContent = scrollWebkitStyle
      document.head.appendChild(style)
      return () => {
        if (document.head.contains(style)) {
          document.head.removeChild(style)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchAnimacoes()
      fetchGeneros()
    }
  }, [isOpen, pagination.page, searchTerm])

  const fetchAnimacoes = async () => {
    try {
      setLoading(true)
      const response = await animacaoAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
      })

      setAnimacoes(response.data.animacoes || [])
      setPagination(response.data.pagination || pagination)
    } catch (error) {
      console.error("Erro ao buscar animações:", error)
      alert("Erro ao carregar animações")
    } finally {
      setLoading(false)
    }
  }

  const fetchGeneros = async () => {
    try {
      const response = await generoAPI.getAll()
      setGeneros(response.data || [])
    } catch (error) {
      console.error("Erro ao buscar gêneros:", error)
    }
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // ✅ FUNÇÃO EDIT MELHORADA
  const handleEdit = (anime) => {
    console.log("Dados do anime para edição:", anime)
    
    setSelectedAnime(anime)
    setFormData({
      titulo: anime.titulo || "",
      titulo_original: anime.titulo_original || "",
      sinopse: anime.sinopse || "",
      poster_url: anime.poster_url || "",
      banner_url: anime.banner_url || "",
      ano_lancamento: anime.ano_lancamento ? String(anime.ano_lancamento) : "",
      episodios: anime.episodios ? String(anime.episodios) : "",
      status: anime.status || "",
      estudio: anime.estudio || "",
      diretor: anime.diretor || "",
      generos: anime.genero_ids || anime.generos_ids || [],
    })
    setEditMode(true)
  }

  // ✅ FUNÇÃO CREATE CORRIGIDA
  const handleCreate = () => {
    setSelectedAnime(null)
    setFormData({
      titulo: "",
      titulo_original: "",
      sinopse: "",
      poster_url: "",
      banner_url: "",
      ano_lancamento: String(new Date().getFullYear()),
      episodios: "1",
      status: "Finalizado", // ✅ Status válido
      estudio: "",
      diretor: "",
      generos: [],
    })
    setEditMode(true)
  }

  // ✅ FUNÇÃO SAVE MELHORADA COM VALIDAÇÃO E DEBUG
  const handleSave = async () => {
    try {
      setLoading(true)

      // Validações básicas
      if (!formData.titulo.trim()) {
        alert("Título é obrigatório")
        return
      }

      // ✅ VALIDAR GÊNEROS
      if (!formData.generos || formData.generos.length === 0) {
        alert("Selecione pelo menos um gênero")
        return
      }

      if (formData.ano_lancamento && (formData.ano_lancamento < 1900 || formData.ano_lancamento > new Date().getFullYear() + 5)) {
        alert("Ano de lançamento deve estar entre 1900 e " + (new Date().getFullYear() + 5))
        return
      }

      if (formData.episodios && formData.episodios < 1) {
        alert("Número de episódios deve ser maior que 0")
        return
      }

      // ✅ PREPARAR DADOS - GARANTIR QUE STATUS SEJA VÁLIDO
      const dataToSend = {
        titulo: formData.titulo.trim(),
        titulo_original: formData.titulo_original?.trim() || null,
        sinopse: formData.sinopse?.trim() || null,
        poster_url: formData.poster_url?.trim() || null,
        banner_url: formData.banner_url?.trim() || null,
        ano_lancamento: formData.ano_lancamento ? parseInt(formData.ano_lancamento) : null,
        episodios: formData.episodios ? parseInt(formData.episodios) : null,
        status: formData.status || "Finalizado", // ✅ GARANTIR QUE TENHA VALOR
        estudio: formData.estudio?.trim() || null,
        diretor: formData.diretor?.trim() || null,
        generos: Array.isArray(formData.generos) ? formData.generos.filter(id => id) : []
      }

      // ✅ VALIDAR NOVAMENTE GÊNEROS ANTES DE ENVIAR
      if (dataToSend.generos.length === 0) {
        alert("Selecione pelo menos um gênero")
        return
      }

      // ✅ DEBUG: Log dos dados que serão enviados
      console.log("Dados que serão enviados:", dataToSend)

      if (selectedAnime) {
        console.log("Atualizando animação ID:", selectedAnime.id)
        const response = await animacaoAPI.update(selectedAnime.id, dataToSend)
        console.log("Resposta da atualização:", response)
        alert("Animação atualizada com sucesso!")
      } else {
        console.log("Criando nova animação")
        const response = await animacaoAPI.create(dataToSend)
        console.log("Resposta da criação:", response)
        alert("Animação criada com sucesso!")
      }

      setEditMode(false)
      setSelectedAnime(null)
      fetchAnimacoes()
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Erro completo:", error)
      console.error("Status:", error.response?.status)
      console.error("Data:", error.response?.data)
    
      let errorMessage = "Erro ao salvar animação"
    
      if (error.response) {
        const status = error.response.status
        const data = error.response.data
        
        switch (status) {
          case 400:
            errorMessage = data?.error || "Dados inválidos"
            break
          case 401:
            errorMessage = "Não autorizado. Faça login novamente."
            break
          case 403:
            errorMessage = "Você não tem permissão para esta operação"
            break
          default:
            errorMessage = data?.error || `Erro ${status}`
        }
      } else if (error.request) {
        errorMessage = "Servidor não está respondendo. Verifique sua conexão."
      } else {
        errorMessage = error.message || "Erro inesperado"
      }
    
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (anime) => {
    if (!confirm(`Tem certeza que deseja excluir "${anime.titulo}"?\n\nEsta ação removerá:\n- A animação\n- Todas as avaliações\n- Todas as listas dos usuários\n\nEsta ação não pode ser desfeita.`)) {
      return
    }

    try {
      setLoading(true)
      await animacaoAPI.delete(anime.id)
      alert("Animação excluída com sucesso!")
      fetchAnimacoes()
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Erro ao excluir animação:", error)
      const errorMessage = error.response?.data?.error || "Erro ao excluir animação"
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // ✅ FUNÇÃO PARA VALIDAR CAMPO
  const validateField = (field, value) => {
    const errors = { ...formErrors }
    
    switch (field) {
      case 'titulo':
        if (!value.trim()) {
          errors.titulo = "Título é obrigatório"
        } else {
          delete errors.titulo
        }
        break
      case 'ano_lancamento':
        if (value && (parseInt(value) < 1900 || parseInt(value) > new Date().getFullYear() + 5)) {
          errors.ano_lancamento = "Ano deve estar entre 1900 e " + (new Date().getFullYear() + 5)
        } else {
          delete errors.ano_lancamento
        }
        break
      case 'episodios':
        if (value && parseInt(value) < 1) {
          errors.episodios = "Número de episódios deve ser maior que 0"
        } else {
          delete errors.episodios
        }
        break
    }
    
    setFormErrors(errors)
  }

  // ✅ ATUALIZAR HANDLE INPUT CHANGE
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Validar campo em tempo real
    validateField(field, value)
  }

  const handleGeneroToggle = (generoId) => {
    setFormData(prev => ({
      ...prev,
      generos: prev.generos.includes(generoId)
        ? prev.generos.filter(id => id !== generoId)
        : [...prev.generos, generoId]
    }))
  }

  const cancelEdit = () => {
    setEditMode(false)
    setSelectedAnime(null)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Em exibição': return 'border-green-500 text-green-700 bg-green-50'
      case 'Finalizado': return 'border-blue-500 text-blue-700 bg-blue-50'
      case 'Cancelado': return 'border-red-500 text-red-700 bg-red-50'
      case 'Pausado': return 'border-yellow-500 text-yellow-700 bg-yellow-50'
      case 'Em breve': return 'border-purple-500 text-purple-700 bg-purple-50'
      default: return 'border-gray-500 text-gray-700'
    }
  }

  return (
    <SimpleModal 
      isOpen={isOpen} 
      onClose={onClose}
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {editMode && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={cancelEdit}
                className="gap-1 mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            )}
            <Settings className="h-5 w-5" />
            <span>Gerenciar Animações</span>
          </div>
          <div className="flex gap-2">
            {!editMode && (
              <Button onClick={handleCreate} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Animação
              </Button>
            )}
          </div>
        </div>
      }
      maxWidth="max-w-7xl"
    >
      {/* ✅ CONTAINER PRINCIPAL COM SCROLL FORÇADO */}
      <div 
        style={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Cabeçalho fixo */}
        <div className="p-6 border-b flex-shrink-0">
          {editMode && (
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={cancelEdit}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar à Lista
              </Button>
              <div className="h-4 w-px bg-border"></div>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {editMode 
              ? (selectedAnime ? `Editando: ${selectedAnime.titulo}` : "Criando nova animação")
              : "Gerencie todas as animações da plataforma"
            }
          </p>
        </div>

        {/* ✅ ÁREA DE CONTEÚDO COM SCROLL */}
        <div 
          className="flex-1 scroll-container"
          style={scrollContainerStyle}
        >
          <div className="p-6">
            {editMode ? (
              /* FORMULÁRIO */
              <div className="space-y-6">
                {/* ✅ GRID ATUALIZADO - REMOVIDO DURACAO_EPISODIO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => handleInputChange("titulo", e.target.value)}
                      placeholder="Nome da animação"
                      required
                      className={formErrors.titulo ? "border-red-500" : ""}
                    />
                    {formErrors.titulo && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.titulo}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="titulo_original">Título Original</Label>
                    <Input
                      id="titulo_original"
                      value={formData.titulo_original}
                      onChange={(e) => handleInputChange("titulo_original", e.target.value)}
                      placeholder="Título em japonês/original"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ano_lancamento">Ano de Lançamento</Label>
                    <Input
                      id="ano_lancamento"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 5}
                      value={formData.ano_lancamento}
                      onChange={(e) => handleInputChange("ano_lancamento", e.target.value)}
                      placeholder="2024"
                    />
                    {formErrors.ano_lancamento && (
                      <p className="text-sm text-red-500 mt-1">
                        {formErrors.ano_lancamento}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="episodios">Número de Episódios</Label>
                    <Input
                      id="episodios"
                      type="number"
                      min="1"
                      value={formData.episodios}
                      onChange={(e) => handleInputChange("episodios", e.target.value)}
                      placeholder="12"
                    />
                    {formErrors.episodios && (
                      <p className="text-sm text-red-500 mt-1">
                        {formErrors.episodios}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <SimpleSelect
                      value={formData.status}
                      onValueChange={(value) => handleInputChange("status", value)}
                      placeholder="Selecione o status"
                      options={statusOptions}
                    />
                  </div>

                  <div>
                    <Label htmlFor="estudio">Estúdio</Label>
                    <Input
                      id="estudio"
                      value={formData.estudio}
                      onChange={(e) => handleInputChange("estudio", e.target.value)}
                      placeholder="Nome do estúdio"
                    />
                  </div>

                  <div>
                    <Label htmlFor="diretor">Diretor</Label>
                    <Input
                      id="diretor"
                      value={formData.diretor}
                      onChange={(e) => handleInputChange("diretor", e.target.value)}
                      placeholder="Nome do diretor"
                    />
                  </div>

                  {/* ✅ CAMPO VAZIO PARA MANTER GRID SIMÉTRICO */}
                  <div></div>
                </div>

                {/* URLs */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="poster_url">URL do Poster</Label>
                    <Input
                      id="poster_url"
                      value={formData.poster_url}
                      onChange={(e) => handleInputChange("poster_url", e.target.value)}
                      placeholder="https://exemplo.com/poster.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="banner_url">URL do Banner</Label>
                    <Input
                      id="banner_url"
                      value={formData.banner_url}
                      onChange={(e) => handleInputChange("banner_url", e.target.value)}
                      placeholder="https://exemplo.com/banner.jpg"
                    />
                  </div>
                </div>

                {/* Preview das Imagens */}
                {(formData.poster_url || formData.banner_url) && (
                  <div>
                    <Label>Preview das Imagens</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {formData.poster_url && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Poster</p>
                          <img
                            src={formData.poster_url}
                            alt="Preview do poster"
                            className="w-full h-48 object-cover rounded border hover:scale-105 transition-transform"
                            onError={(e) => { e.target.style.display = "none" }}
                          />
                        </div>
                      )}
                      {formData.banner_url && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Banner</p>
                          <img
                            src={formData.banner_url}
                            alt="Preview do banner"
                            className="w-full h-48 object-cover rounded border hover:scale-105 transition-transform"
                            onError={(e) => { e.target.style.display = "none" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sinopse */}
                <div>
                  <Label htmlFor="sinopse">Sinopse</Label>
                  <Textarea
                    id="sinopse"
                    value={formData.sinopse}
                    onChange={(e) => handleInputChange("sinopse", e.target.value)}
                    placeholder="Descrição da animação..."
                    className="min-h-[100px]"
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.sinopse.length}/1000 caracteres
                  </p>
                </div>

                {/* Gêneros */}
                <div>
                  <Label>Gêneros</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {generos.map((genero) => (
                      <div
                        key={genero.id}
                        className={`p-3 border rounded cursor-pointer transition-all text-center hover:scale-105 ${
                          formData.generos.includes(genero.id)
                            ? 'bg-primary text-primary-foreground border-primary shadow-md'
                            : 'hover:bg-muted hover:shadow-sm'
                        }`}
                        onClick={() => handleGeneroToggle(genero.id)}
                      >
                        <span className="text-sm font-medium">{genero.nome}</span>
                      </div>
                    ))}
                  </div>
                  {formData.generos.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.generos.map(generoId => {
                        const genero = generos.find(g => g.id === generoId)
                        return genero ? (
                          <Badge key={generoId} variant="secondary" className="text-xs">
                            {genero.nome}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  )}
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white dark:bg-gray-800">
                  <Button 
                    onClick={handleSave} 
                    disabled={loading || !formData.titulo} 
                    className="gap-2"
                  >
                    {loading ? <LoadingSpinner size="small" /> : <Save className="h-4 w-4" />}
                    {selectedAnime ? "Atualizar" : "Criar"}
                  </Button>
                  <Button variant="outline" onClick={cancelEdit} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              /* LISTA */
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Pesquisar animações..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="large" />
                  </div>
                ) : animacoes.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Nenhuma animação encontrada</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {animacoes.map((anime) => (
                      <Card key={anime.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div 
                              className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleEdit(anime)}
                            >
                              <img
                                src={anime.poster_url || "/placeholder.svg?height=80&width=60"}
                                alt={anime.titulo}
                                className="w-16 h-24 object-cover rounded border"
                                onError={(e) => {
                                  e.target.src = "/placeholder.svg?height=80&width=60"
                                }}
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h3 
                                    className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => handleEdit(anime)}
                                    style={{
                                      overflow: 'hidden',
                                      display: '-webkit-box',
                                      WebkitBoxOrient: 'vertical',
                                      WebkitLineClamp: 1,
                                    }}
                                  >
                                    {anime.titulo}
                                  </h3>
                                  {anime.titulo_original && anime.titulo_original !== anime.titulo && (
                                    <p 
                                      className="text-sm text-muted-foreground mb-2"
                                      style={{
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        WebkitBoxOrient: 'vertical',
                                        WebkitLineClamp: 1,
                                      }}
                                    >
                                      {anime.titulo_original}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getStatusBadgeClass(anime.status)}`}
                                    >
                                      {anime.status}
                                    </Badge>
                                    {anime.ano_lancamento && (
                                      <Badge variant="secondary" className="text-xs">
                                        {anime.ano_lancamento}
                                      </Badge>
                                    )}
                                    {anime.episodios && (
                                      <Badge variant="secondary" className="text-xs">
                                        {anime.episodios} eps
                                      </Badge>
                                    )}
                                    {anime.nota_media > 0 && (
                                      <Badge variant="secondary" className="text-xs">
                                        ⭐ {parseFloat(anime.nota_media).toFixed(1)}
                                      </Badge>
                                    )}
                                  </div>

                                  {anime.generos && anime.generos.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {anime.generos.slice(0, 3).map((genero, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {genero}
                                        </Badge>
                                      ))}
                                      {anime.generos.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{anime.generos.length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-col gap-2 ml-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(anime)}
                                    className="gap-1 w-full"
                                  >
                                    <Edit className="h-3 w-3" />
                                    Editar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(anime)}
                                    className="gap-1 w-full"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Excluir
                                  </Button>
                                </div>
                              </div>
                              
                              {anime.sinopse && (
                                <p 
                                  className="text-sm text-muted-foreground"
                                  style={{
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: 2,
                                  }}
                                >
                                  {anime.sinopse}
                                </p>
                              )}

                              <div className="grid grid-cols-2 gap-4 mt-3 text-xs text-muted-foreground">
                                {anime.estudio && (
                                  <div>
                                    <span className="font-medium">Estúdio:</span> {anime.estudio}
                                  </div>
                                )}
                                {anime.diretor && (
                                  <div>
                                    <span className="font-medium">Diretor:</span> {anime.diretor}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Paginação */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-muted-foreground">
                      Página {pagination.page} de {pagination.pages} ({pagination.total} total)
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page === pagination.pages}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </SimpleModal>
  )
}