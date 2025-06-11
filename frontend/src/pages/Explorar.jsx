"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Search, Filter, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

export const Explorar = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [animacoes, setAnimacoes] = useState([])
  const [generos, setGeneros] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("grid")
  const [filters, setFilters] = useState({
    search: searchParams.get("q") || "",
    genero: searchParams.get("genero") || "",
    status: searchParams.get("status") || "",
    orderBy: searchParams.get("orderBy") || "",
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
      console.log("Buscando gêneros...")
      const response = await generoAPI.getAll()
      console.log("Gêneros recebidos:", response.data)
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
        ...filters,
      }

      // ✅ LIMPAR PARÂMETROS VAZIOS
      Object.keys(params).forEach((key) => {
        if (!params[key] || params[key] === "") {
          delete params[key]
        }
      })

      console.log("Buscando animações com parâmetros:", params)
      const response = await animacaoAPI.getAll(params)
      console.log("Animações recebidas:", response.data)
      
      setAnimacoes(response.data.animacoes || [])
      setPagination((prev) => ({
        ...prev,
        ...response.data.pagination,
      }))
    } catch (error) {
      console.error("Erro ao carregar animações:", error)
      setAnimacoes([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    console.log(`Mudando filtro ${key} para:`, value)
    
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
    handleFilterChange("search", filters.search)
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      genero: "",
      status: "",
      orderBy: "",
    })
    setSearchParams(new URLSearchParams())
  }

  // ✅ STATUS CORRIGIDOS CONFORME BACKEND
  const statusOptions = [
    { value: "", label: "Todos os Status" },
    { value: "Em exibição", label: "Em Exibição" },
    { value: "Finalizado", label: "Finalizado" },
    { value: "Cancelado", label: "Cancelado" },
    { value: "Anunciado", label: "Anunciado" },
  ]

  const orderOptions = [
    { value: "", label: "Mais Recentes" },
    { value: "nota_media", label: "Melhor Avaliados" },
    { value: "titulo", label: "A-Z" },
    { value: "ano_lancamento", label: "Ano de Lançamento" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-80 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar animações..."
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </form>

              {/* ✅ GÊNERO COM SELECT NATIVO */}
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
                {/* ✅ DEBUG INFO */}
                <p className="text-xs text-muted-foreground mt-1">
                  {generos.length} gêneros carregados
                </p>
              </div>

              {/* ✅ STATUS COM SELECT NATIVO */}
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

              {/* ✅ ORDEM COM SELECT NATIVO */}
              <div>
                <label className="text-sm font-medium mb-2 block">Ordenar por</label>
                <SimpleSelect 
                  value={filters.orderBy} 
                  onChange={(e) => handleFilterChange("orderBy", e.target.value)}
                >
                  {orderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SimpleSelect>
              </div>

              <Button onClick={clearFilters} variant="outline" className="w-full">
                Limpar Filtros
              </Button>

              {/* ✅ DEBUG FILTROS ATIVOS */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Filtros ativos:</p>
                <pre className="text-xs">{JSON.stringify(filters, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Explorar Animações</h1>
              <p className="text-muted-foreground">{pagination.total} animações encontradas</p>
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

          {/* ✅ BADGES DOS FILTROS ATIVOS */}
          {Object.values(filters).some(Boolean) && (
            <div className="flex flex-wrap gap-2">
              {filters.search && <Badge variant="secondary">Busca: {filters.search}</Badge>}
              {filters.genero && (
                <Badge variant="secondary">
                  Gênero: {generos.find((g) => g.id == filters.genero)?.nome || `ID: ${filters.genero}`}
                </Badge>
              )}
              {filters.status && <Badge variant="secondary">Status: {filters.status}</Badge>}
              {filters.orderBy && (
                <Badge variant="secondary">
                  Ordem: {orderOptions.find((o) => o.value === filters.orderBy)?.label}
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
                  <p className="text-muted-foreground">Nenhuma animação encontrada</p>
                  {/* ✅ DEBUG INFO */}
                  <p className="text-xs text-muted-foreground mt-2">
                    Filtros aplicados: {JSON.stringify(filters)}
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
