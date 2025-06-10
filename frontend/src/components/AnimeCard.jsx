"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Star, Heart, Bookmark, Play } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatRating, getStatusColor } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { listaAPI } from "@/lib/api"

export const AnimeCard = ({ anime, showActions = true }) => {
  const [isInList, setIsInList] = useState(false)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Verificar se anime existe e tem ID
  if (!anime || !anime.id) {
    return null
  }

  const handleAddToList = async (status, e) => {
    e.preventDefault() // Evitar navegação ao clicar nos botões de ação
    e.stopPropagation()
    
    if (!isAuthenticated) return

    setLoading(true)
    try {
      await listaAPI.add({
        animacao_id: anime.id,
        status,
      })
      setIsInList(true)
    } catch (error) {
      console.error("Erro ao adicionar à lista:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = () => {
    console.log("Navegando para anime:", anime.id) // Debug
    navigate(`/anime/${anime.id}`)
  }

  const generos =
    typeof anime.generos === "string" ? anime.generos.split(",").slice(0, 2) : anime.generos?.slice(0, 2) || []

  return (
    <Card 
      className="anime-card group cursor-pointer" 
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={anime.poster_url || "/placeholder.svg?height=400&width=300"}
          alt={anime.titulo}
          className="anime-card-image"
          onError={(e) => {
            e.target.src = "/placeholder.svg?height=400&width=300"
          }}
        />

        <div className="anime-card-overlay">
          <div className="anime-card-content">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{anime.titulo}</h3>

            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{formatRating(anime.nota_media)}</span>
              </div>
              <span className="text-xs text-gray-300">
                ({anime.total_avaliacoes || 0} avaliações)
              </span>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {generos.map((genero, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {typeof genero === "object" ? genero.nome : genero}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Button 
                size="sm" 
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/anime/${anime.id}`)
                }}
              >
                <Play className="h-3 w-3" />
                Ver Detalhes
              </Button>

              {showActions && isAuthenticated && (
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-white hover:text-red-400"
                    onClick={(e) => handleAddToList("desejado", e)}
                    disabled={loading}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-white hover:text-blue-400"
                    onClick={(e) => handleAddToList("assistido", e)}
                    disabled={loading}
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute top-2 right-2">
          <Badge className={getStatusColor(anime.status)}>{anime.status}</Badge>
        </div>

        {anime.ano_lancamento && (
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="bg-black/50 text-white border-white/20">
              {anime.ano_lancamento}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  )
}
