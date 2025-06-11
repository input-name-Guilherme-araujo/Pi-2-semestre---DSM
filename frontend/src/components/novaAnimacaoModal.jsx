import { useState, useEffect } from "react"
import { X, Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { animacaoAPI, generoAPI } from "@/lib/api"

export const NovaAnimacaoModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    titulo: "",
    titulo_original: "",
    sinopse: "",
    poster_url: "",
    banner_url: "",
    ano_lancamento: new Date().getFullYear(),
    episodios: 1,
    status: "Finalizado",
    estudio: "",
    diretor: "",
    generos: [],
  })
  const [generos, setGeneros] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const statusOptions = [
    "Em exibição",
    "Finalizado", 
    "Cancelado",
    "Anunciado"
  ]

  useEffect(() => {
    if (isOpen) {
      fetchGeneros()
    }
  }, [isOpen])

  const fetchGeneros = async () => {
    try {
      const response = await generoAPI.getAll()
      setGeneros(response.data)
    } catch (error) {
      console.error("Erro ao carregar gêneros:", error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGeneroToggle = (generoId) => {
    setFormData(prev => ({
      ...prev,
      generos: prev.generos.includes(generoId)
        ? prev.generos.filter(id => id !== generoId)
        : [...prev.generos, generoId]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validações básicas
    if (!formData.titulo.trim()) {
      setError("Título é obrigatório")
      setLoading(false)
      return
    }

    if (formData.generos.length === 0) {
      setError("Selecione pelo menos um gênero")
      setLoading(false)
      return
    }

    try {
      const dataToSend = {
        ...formData,
        ano_lancamento: parseInt(formData.ano_lancamento),
        episodios: parseInt(formData.episodios),
        // Limpar campos vazios
        titulo_original: formData.titulo_original || null,
        sinopse: formData.sinopse || null,
        poster_url: formData.poster_url || null,
        banner_url: formData.banner_url || null,
        estudio: formData.estudio || null,
        diretor: formData.diretor || null,
      }

      await animacaoAPI.create(dataToSend)
      
      // Reset form
      setFormData({
        titulo: "",
        titulo_original: "",
        sinopse: "",
        poster_url: "",
        banner_url: "",
        ano_lancamento: new Date().getFullYear(),
        episodios: 1,
        status: "Finalizado",
        estudio: "",
        diretor: "",
        generos: [],
      })

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Erro ao criar animação:", error)
      setError(error.response?.data?.error || "Erro ao criar animação")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold">Nova Animação</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título *</label>
                <Input
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Nome da animação"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Título Original</label>
                <Input
                  name="titulo_original"
                  value={formData.titulo_original}
                  onChange={handleChange}
                  placeholder="Título original (japonês/inglês)"
                />
              </div>
            </div>

            {/* Sinopse */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sinopse</label>
              <textarea
                name="sinopse"
                value={formData.sinopse}
                onChange={handleChange}
                placeholder="Descrição da animação..."
                className="w-full min-h-[100px] p-3 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                {formData.sinopse.length}/1000 caracteres
              </p>
            </div>

            {/* URLs das Imagens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL do Poster</label>
                <Input
                  name="poster_url"
                  value={formData.poster_url}
                  onChange={handleChange}
                  placeholder="https://exemplo.com/poster.jpg"
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">URL do Banner</label>
                <Input
                  name="banner_url"
                  value={formData.banner_url}
                  onChange={handleChange}
                  placeholder="https://exemplo.com/banner.jpg"
                  type="url"
                />
              </div>
            </div>

            {/* Detalhes da Produção */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ano de Lançamento</label>
                <Input
                  name="ano_lancamento"
                  type="number"
                  value={formData.ano_lancamento}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear() + 5}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Episódios</label>
                <Input
                  name="episodios"
                  type="number"
                  value={formData.episodios}
                  onChange={handleChange}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Estúdio e Diretor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Estúdio</label>
                <Input
                  name="estudio"
                  value={formData.estudio}
                  onChange={handleChange}
                  placeholder="Nome do estúdio de animação"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Diretor</label>
                <Input
                  name="diretor"
                  value={formData.diretor}
                  onChange={handleChange}
                  placeholder="Nome do diretor"
                />
              </div>
            </div>

            {/* Gêneros */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Gêneros *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {generos.map(genero => (
                  <div
                    key={genero.id}
                    onClick={() => handleGeneroToggle(genero.id)}
                    className={`p-2 border rounded-md cursor-pointer transition-colors text-center text-sm ${
                      formData.generos.includes(genero.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    {genero.nome}
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

            {/* Prévia das Imagens */}
            {(formData.poster_url || formData.banner_url) && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Prévia das Imagens</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.poster_url && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Poster</p>
                      <img
                        src={formData.poster_url}
                        alt="Prévia do poster"
                        className="w-full h-48 object-cover rounded-md border"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=200&width=150"
                        }}
                      />
                    </div>
                  )}
                  {formData.banner_url && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Banner</p>
                      <img
                        src={formData.banner_url}
                        alt="Prévia do banner"
                        className="w-full h-48 object-cover rounded-md border"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=200&width=400"
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? (
                  "Criando..."
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Criar Animação
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}