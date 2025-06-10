// frontend/src/components/BannerCarrossel.jsx
"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, Play, Star, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatRating, getStatusColor } from "@/lib/utils"

export const BannerCarrossel = ({ animes = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play do carrossel
  useEffect(() => {
    if (!isAutoPlaying || animes.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === animes.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000) // Muda a cada 5 segundos

    return () => clearInterval(interval)
  }, [animes.length, isAutoPlaying])

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? animes.length - 1 : currentIndex - 1)
    setIsAutoPlaying(false) // Pausa auto-play quando usuário interage
  }

  const goToNext = () => {
    setCurrentIndex(currentIndex === animes.length - 1 ? 0 : currentIndex + 1)
    setIsAutoPlaying(false) // Pausa auto-play quando usuário interage
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  if (!animes || animes.length === 0) {
    return null
  }

  const currentAnime = animes[currentIndex]

  return (
    <div className="relative w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden group">
      {/* Background com imagem do anime */}
      <div className="absolute inset-0">
        <img
          src={currentAnime.banner_url || currentAnime.poster_url || "/placeholder.svg"}
          alt={currentAnime.titulo}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "/placeholder.svg"
          }}
        />
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Controles de navegação */}
      {animes.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Conteúdo do banner */}
      <div className="absolute inset-0 flex items-center z-10">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-2xl text-white">
            {/* Badges de status e ano */}
            <div className="flex items-center gap-3 mb-4">
              <Badge className={getStatusColor(currentAnime.status)}>
                {currentAnime.status}
              </Badge>
              {currentAnime.ano_lancamento && (
                <Badge variant="outline" className="bg-black/30 text-white border-white/30">
                  <Calendar className="h-3 w-3 mr-1" />
                  {currentAnime.ano_lancamento}
                </Badge>
              )}
              {currentAnime.nota_media && (
                <Badge variant="outline" className="bg-black/30 text-white border-white/30">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {formatRating(currentAnime.nota_media)}
                </Badge>
              )}
            </div>

            {/* Título */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              {currentAnime.titulo}
            </h1>

            {/* Título original (se diferente) */}
            {currentAnime.titulo_original && currentAnime.titulo_original !== currentAnime.titulo && (
              <p className="text-lg md:text-xl text-gray-300 mb-4">
                {currentAnime.titulo_original}
              </p>
            )}

            {/* Sinopse (limitada) */}
            {currentAnime.sinopse && (
              <p className="text-base md:text-lg text-gray-200 mb-6 line-clamp-3 max-w-xl">
                {currentAnime.sinopse.length > 200 
                  ? `${currentAnime.sinopse.substring(0, 200)}...` 
                  : currentAnime.sinopse}
              </p>
            )}

            {/* Gêneros */}
            {currentAnime.generos && Array.isArray(currentAnime.generos) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {currentAnime.generos.slice(0, 4).map((genero, index) => (
                  <Badge 
                    key={genero.id || index} 
                    variant="secondary" 
                    className="bg-white/20 text-white hover:bg-white/30"
                  >
                    {typeof genero === 'object' ? genero.nome : genero}
                  </Badge>
                ))}
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={`/anime/${currentAnime.id}`}>
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  <Play className="h-5 w-5" />
                  Ver Detalhes
                </Button>
              </Link>
              <Link to="/explorar">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  Explorar Mais
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores de slide */}
      {animes.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex space-x-2">
            {animes.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white scale-110' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Indicador de auto-play */}
      {animes.length > 1 && isAutoPlaying && (
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="outline" className="bg-black/30 text-white border-white/30 text-xs">
            Auto-play ativo
          </Badge>
        </div>
      )}
    </div>
  )
}