import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Calendar, Grid, List, TrendingUp, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AnimeCard } from "@/components/AnimeCard"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { animacaoAPI, generoAPI } from "@/lib/api"

// ✅ COMPONENTE SELECT SIMPLES NATIVO
const SimpleSelect = ({ value, onChange, children, className = "" }) => (
  <select
    value={value}
    onChange={onChange}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
  >
    {children}
  </select>
)

export const Lancamentos = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [animacoes, setAnimacoes] = useState([])
  const [generos, setGeneros] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("grid")
  
  // ✅ FILTROS ESPECÍFICOS PARA LANÇAMENTOS
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    genero: searchParams.get("genero") || "",
    status: searchParams.get("status") || "Em exibição", // Status padrão para lançamentos
  })
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  useEffect(() => {
    fetchGeneros()
  }, [])

  useEffect(() => {
    fetchAnimacoes()
  }, [filters, pagination.page])

  const fetchGeneros = async () => {
    try {
      const response = await generoAPI.getAll()
      setGeneros(response.data || [])
    } catch (error) {
      console.error("Erro ao carregar gêneros:", error)
      setGeneros([])
    }
  }

  const fetchAnimacoes = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        orderBy: "ano_lancamento", // ✅ ORDENAR POR ANO DE LANÇAMENTO
        order: "DESC", // ✅ MAIS RECENTES PRIMEIRO
        ...filters,
      }

      // ✅ LÓGICA ESPECIAL PARA STATUS VAZIO (TODOS OS STATUS)
      if (!filters.status || filters.status === "") {
        // Se status vazio, buscar apenas "Em exibição" e "Anunciado"
        params.status = "Em exibição,Anunciado"
      }
      
      // ✅ LÓGICA ESPECIAL PARA STATUS FINALIZADO (2025+)
      if (filters.status === "Finalizado") {
        params.ano_min = 2025
      }

      // ✅ LIMPAR PARÂMETROS VAZIOS (exceto status que já foi tratado)
      Object.keys(params).forEach((key) => {
        if (key !== "status" && key !== "ano_min" && (!params[key] || params[key] === "")) {
          delete params[key]
        }
      })

      console.log("Buscando lançamentos com parâmetros:", params)
      const response = await animacaoAPI.getAll(params)
      
      setAnimacoes(response.data.animacoes || [])
      setPagination((prev) => ({
        ...prev,
        ...response.data.pagination,
      }))
    } catch (error) {
      console.error("Erro ao carregar lançamentos:", error)
      setAnimacoes([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))

    // ✅ ATUALIZAR URL
    const newSearchParams = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== "") {
        newSearchParams.set(k, v)
      }
    })
    setSearchParams(newSearchParams)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // A pesquisa já é atualizada automaticamente pelo useEffect
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      genero: "",
      status: "Em exibição",
    })
    setSearchParams(new URLSearchParams())
  }

  // ✅ OPÇÕES ESPECÍFICAS PARA LANÇAMENTOS - ATUALIZADA DESCRIÇÃO
  const statusOptions = [
    { value: "", label: "Todos os Status" }, // Mostra apenas "Em exibição" e "Anunciado"
    { value: "Em exibição", label: "Em Exibição" },
    { value: "Anunciado", label: "Anunciado" },
    { value: "Finalizado", label: "Finalizado (2025+)" }, // ✅ INDICAR QUE É 2025+
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-80 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Filtros de Lançamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ✅ BARRA DE PESQUISA */}
              <div>
                <label className="text-sm font-medium mb-2 block">Pesquisar</label>
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar animações..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </form>
              </div>

              {/* ✅ STATUS */}
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <SimpleSelect 
                  value={filters.status} 
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SimpleSelect>
              </div>

              {/* ✅ GÊNERO */}
              <div>
                <label className="text-sm font-medium mb-2 block">Gênero</label>
                <SimpleSelect 
                  value={filters.genero} 
                  onChange={(e) => handleFilterChange("genero", e.target.value)}
                >
                  <option value="">Todos os Gêneros</option>
                  {generos.map((genero) => (
                    <option key={genero.id} value={genero.id}>
                      {genero.nome}
                    </option>
                  ))}
                </SimpleSelect>
              </div>

              <Button onClick={clearFilters} variant="outline" className="w-full">
                Limpar Filtros
              </Button>
            </CardContent>
          </Card>

          {/* ✅ CARD DE ESTATÍSTICAS - ATUALIZADO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total encontrado:</span>
                  <span className="font-medium">{pagination.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium">
                    {filters.status === "Finalizado" 
                      ? "Finalizado (2025+)"
                      : filters.status || "Em Exibição + Anunciados"
                    }
                  </span>
                </div>
                {filters.search && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pesquisando por:</span>
                    <span className="font-medium truncate ml-2">"{filters.search}"</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Calendar className="h-8 w-8" />
                Lançamentos de Anime
              </h1>
              <p className="text-muted-foreground">
                Descubra os animes mais recentes baseados no ano de lançamento
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ✅ BADGES DOS FILTROS ATIVOS - ATUALIZADO */}
          {(filters.search || filters.genero || filters.status) && (
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary">Pesquisa: "{filters.search}"</Badge>
              )}
              {filters.status && (
                <Badge variant="secondary">
                  Status: {filters.status === "Finalizado" ? "Finalizado (2025+)" : filters.status}
                </Badge>
              )}
              {!filters.status && (
                <Badge variant="secondary">Status: Em Exibição + Anunciados</Badge>
              )}
              {filters.genero && (
                <Badge variant="secondary">
                  Gênero: {generos.find((g) => g.id == filters.genero)?.nome || `ID: ${filters.genero}`}
                </Badge>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                    : "space-y-4"
                }
              >
                {animacoes.map((anime) => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>

              {animacoes.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {filters.search 
                      ? `Nenhum resultado encontrado para "${filters.search}"`
                      : "Nenhum lançamento encontrado para os filtros selecionados"
                    }
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {filters.search 
                      ? "Tente uma busca diferente ou ajuste os filtros"
                      : "Tente ajustar os filtros de status ou gênero"
                    }
                  </p>
                </div>
              )}

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
            </>
          )}
        </main>
      </div>
    </div>
  )
}