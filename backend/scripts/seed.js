import pool from "../config/database.js"
import bcrypt from "bcryptjs"

const seedData = async () => {
  try {
    console.log("🌱 Iniciando seed do banco de dados...")

    // Criar usuário admin
    const hashedPassword = await bcrypt.hash("admin123", 12)
    await pool.execute("INSERT IGNORE INTO usuarios (nome, email, senha, role_id) VALUES (?, ?, ?, ?)", [
      "Administrador",
      "admin@animalist.com",
      hashedPassword,
      1,
    ])

    // Adicionar mais animações de exemplo
    const animacoes = [
      {
        titulo: "One Piece",
        titulo_original: "One Piece",
        sinopse: "Monkey D. Luffy explora o Grand Line com sua tripulação pirata em busca do tesouro One Piece.",
        poster_url: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
        ano_lancamento: 1999,
        episodios: 1000,
        status: "Em exibição",
        estudio: "Toei Animation",
        diretor: "Eiichiro Oda",
        generos: [1, 3, 8], // Ação, Comédia, Slice of Life
      },
      {
        titulo: "Naruto",
        titulo_original: "Naruto",
        sinopse: "Um jovem ninja busca reconhecimento e sonha em se tornar o Hokage de sua vila.",
        poster_url: "https://cdn.myanimelist.net/images/anime/13/17405.jpg",
        ano_lancamento: 2002,
        episodios: 720,
        status: "Finalizado",
        estudio: "Studio Pierrot",
        diretor: "Masashi Kishimoto",
        generos: [1, 4, 8], // Ação, Drama, Slice of Life
      },
      {
        titulo: "Spirited Away",
        titulo_original: "Sen to Chihiro no Kamikakushi",
        sinopse: "Uma menina deve trabalhar em uma casa de banho para espíritos para salvar seus pais.",
        poster_url: "https://cdn.myanimelist.net/images/anime/6/79597.jpg",
        ano_lancamento: 2001,
        episodios: 1,
        status: "Finalizado",
        estudio: "Studio Ghibli",
        diretor: "Hayao Miyazaki",
        generos: [5, 4, 8], // Fantasia, Drama, Slice of Life
      },
      {
        titulo: "Death Note",
        titulo_original: "Death Note",
        sinopse:
          "Um estudante encontra um caderno sobrenatural que pode matar qualquer pessoa cujo nome seja escrito nele.",
        poster_url: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
        ano_lancamento: 2006,
        episodios: 37,
        status: "Finalizado",
        estudio: "Madhouse",
        diretor: "Tetsuro Araki",
        generos: [4, 7, 6], // Drama, Terror, Ficção Científica
      },
      {
        titulo: "My Hero Academia",
        titulo_original: "Boku no Hero Academia",
        sinopse: "Em um mundo onde quase todos têm superpoderes, um garoto sem poderes sonha em ser um herói.",
        poster_url: "https://cdn.myanimelist.net/images/anime/10/78745.jpg",
        ano_lancamento: 2016,
        episodios: 138,
        status: "Em exibição",
        estudio: "Studio Bones",
        diretor: "Kenji Nagasaki",
        generos: [1, 4, 8], // Ação, Drama, Slice of Life
      },
    ]

    for (const anime of animacoes) {
      const { generos, ...animeData } = anime

      // Verificar se a animação já existe
      const [existing] = await pool.execute("SELECT id FROM animacoes WHERE titulo = ?", [anime.titulo])

      if (existing.length === 0) {
        const [result] = await pool.execute(
          `INSERT INTO animacoes (titulo, titulo_original, sinopse, poster_url, 
           ano_lancamento, episodios, status, estudio, diretor) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            animeData.titulo,
            animeData.titulo_original,
            animeData.sinopse,
            animeData.poster_url,
            animeData.ano_lancamento,
            animeData.episodios,
            animeData.status,
            animeData.estudio,
            animeData.diretor,
          ],
        )

        const animacaoId = result.insertId

        // Adicionar gêneros
        for (const generoId of generos) {
          await pool.execute("INSERT IGNORE INTO animacao_generos (animacao_id, genero_id) VALUES (?, ?)", [
            animacaoId,
            generoId,
          ])
        }

        console.log(`✅ Animação "${anime.titulo}" adicionada`)
      }
    }

    console.log("🎉 Seed concluído com sucesso!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Erro durante o seed:", error)
    process.exit(1)
  }
}

seedData()
