"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Search, Filter, Grid, List } from "lucide-react"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimeCard } from "@/components/AnimeCard"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { animacaoAPI, generoAPI } from "@/lib/api"

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
      const response = await generoAPI.getAll()
      setGeneros(response.data)
    } catch (error) {
      console.error("Erro ao carregar gêneros:", error)
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

      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key]
      })

      const response = await animacaoAPI.getAll(params)
      setAnimacoes(response.data.animacoes)
      setPagination((prev) => ({
        ...prev,
        ...response.data.pagination,
      }))
    } catch (error) {
      console.error("Erro ao carregar animações:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))

    const newSearchParams = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newSearchParams.set(k, v)
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

              <div>
                <label className="text-sm font-medium mb-2 block">Gênero</label>
                <Select value={filters.genero} onChange={(e) => handleFilterChange("genero", e.target.value)}>
                  <option value="">Todos os Gêneros</option>
                  {generos.map((genero) => (
                    <option key={genero.id} value={genero.id}>
                      {genero.nome}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)}>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Ordenar por</label>
                <Select value={filters.orderBy} onChange={(e) => handleFilterChange("orderBy", e.target.value)}>
                  {orderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              <Button onClick={clearFilters} variant="outline" className="w-full">
                Limpar Filtros
              </Button>
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

          {Object.values(filters).some(Boolean) && (
            <div className="flex flex-wrap gap-2">
              {filters.search && <Badge variant="secondary">Busca: {filters.search}</Badge>}
              {filters.genero && (
                <Badge variant="secondary">Gênero: {generos.find((g) => g.id == filters.genero)?.nome}</Badge>
              )}
              {filters.status && <Badge variant="secondary">Status: {filters.status}</Badge>}
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
