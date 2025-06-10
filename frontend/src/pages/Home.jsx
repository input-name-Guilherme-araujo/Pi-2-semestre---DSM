"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { TrendingUp, Calendar, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimeCard } from "@/components/AnimeCard"
import { BannerCarrossel } from "@/components/BannerCarrossel"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { animacaoAPI } from "@/lib/api"

export const Home = () => {
  const [featuredAnimes, setFeaturedAnimes] = useState([])
  const [recentAnimes, setRecentAnimes] = useState([])
  const [topRatedAnimes, setTopRatedAnimes] = useState([])
  const [bannerAnimes, setBannerAnimes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featured, recent, topRated, banner] = await Promise.all([
          animacaoAPI.getAll({ limit: 6, status: "Em exibição" }),
          animacaoAPI.getAll({ limit: 6 }),
          animacaoAPI.getAll({ limit: 6, orderBy: "nota_media" }),
          animacaoAPI.getAll({ limit: 5, orderBy: "nota_media" }),
        ])

        setFeaturedAnimes(featured.data.animacoes || [])
        setRecentAnimes(recent.data.animacoes || [])
        setTopRatedAnimes(topRated.data.animacoes || [])
        setBannerAnimes(banner.data.animacoes || [])
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <section>
        <BannerCarrossel animes={bannerAnimes} />
      </section>

      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 md:p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Bem-vindo ao <span className="text-primary">Animalist</span>
          </h2>
          <p className="text-muted-foreground mb-6">
            Sua plataforma definitiva para descobrir, avaliar e organizar suas animações favoritas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/explorar">
              <Button size="lg" className="w-full sm:w-auto">
                Explorar Animações
              </Button>
            </Link>
            <Link to="/registro">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Em Exibição</h2>
          </div>
          <Link to="/explorar?status=Em exibição">
            <Button variant="ghost">Ver Todos</Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredAnimes.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Adicionados Recentemente</h2>
          </div>
          <Link to="/explorar">
            <Button variant="ghost">Ver Todos</Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recentAnimes.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Mais Bem Avaliados</h2>
          </div>
          <Link to="/explorar?orderBy=nota_media">
            <Button variant="ghost">Ver Todos</Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {topRatedAnimes.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>

      <section className="bg-muted/50 rounded-lg p-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Junte-se à Comunidade</h2>
          <p className="text-muted-foreground mb-6">
            Conecte-se com outros fãs de anime, compartilhe suas opiniões e descubra recomendações personalizadas
            baseadas no seu gosto.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Avalie & Comente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Compartilhe suas opiniões e ajude outros fãs a descobrir grandes animações.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organize sua Lista</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Mantenha controle do que assistiu, está assistindo e quer assistir.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Descubra Novidades</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Receba recomendações personalizadas baseadas no seu histórico.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
