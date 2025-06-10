import pool from "../config/database.js"

export const createAvaliacao = async (req, res) => {
  try {
    const { animacao_id, nota, comentario } = req.body
    const usuario_id = req.user.id

    const [existing] = await pool.execute("SELECT id FROM avaliacoes WHERE usuario_id = ? AND animacao_id = ?", [
      usuario_id,
      animacao_id,
    ])

    if (existing.length > 0) {
      return res.status(400).json({ error: "Você já avaliou esta animação" })
    }

    await pool.execute("INSERT INTO avaliacoes (usuario_id, animacao_id, nota, comentario) VALUES (?, ?, ?, ?)", [
      usuario_id,
      animacao_id,
      nota,
      comentario || null,
    ])

    await updateNotaMedia(animacao_id)

    res.status(201).json({ message: "Avaliação criada com sucesso" })
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

export const updateAvaliacao = async (req, res) => {
  try {
    const { id } = req.params
    const { nota, comentario } = req.body
    const usuario_id = req.user.id

    const [avaliacoes] = await pool.execute("SELECT animacao_id FROM avaliacoes WHERE id = ? AND usuario_id = ?", [
      id,
      usuario_id,
    ])

    if (avaliacoes.length === 0) {
      return res.status(404).json({ error: "Avaliação não encontrada" })
    }

    await pool.execute("UPDATE avaliacoes SET nota = ?, comentario = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
      nota,
      comentario || null,
      id,
    ])

    await updateNotaMedia(avaliacoes[0].animacao_id)

    res.json({ message: "Avaliação atualizada com sucesso" })
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

export const deleteAvaliacao = async (req, res) => {
  try {
    const { id } = req.params
    const usuario_id = req.user.id

    const [avaliacoes] = await pool.execute("SELECT animacao_id FROM avaliacoes WHERE id = ? AND usuario_id = ?", [
      id,
      usuario_id,
    ])

    if (avaliacoes.length === 0) {
      return res.status(404).json({ error: "Avaliação não encontrada" })
    }

    await pool.execute("DELETE FROM avaliacoes WHERE id = ?", [id])
    await updateNotaMedia(avaliacoes[0].animacao_id)

    res.json({ message: "Avaliação removida com sucesso" })
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

export const getAvaliacoesByAnimacao = async (req, res) => {
  try {
    const { animacao_id } = req.params
    const { page = 1, limit = 10 } = req.query
    const limitInt = parseInt(limit, 10)
    const pageInt = parseInt(page, 10)
    const offset = (pageInt - 1) * limitInt

    const [avaliacoes] = await pool.execute(
      `SELECT a.*, u.nome as usuario_nome, u.avatar_url
       FROM avaliacoes a
       JOIN usuarios u ON a.usuario_id = u.id
       WHERE a.animacao_id = ?
       ORDER BY a.created_at DESC
       LIMIT ${limitInt} OFFSET ${offset}`,
      [animacao_id],
    )

    const [countResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM avaliacoes WHERE animacao_id = ?",
      [animacao_id]
    )

    res.json({
      avaliacoes,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limitInt),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

const updateNotaMedia = async (animacao_id) => {
  try {
    console.log("Atualizando nota média para animação:", animacao_id) // Debug
    
    const [result] = await pool.execute(
      "SELECT AVG(nota) as media, COUNT(*) as total FROM avaliacoes WHERE animacao_id = ?",
      [animacao_id],
    )

    const media = result[0].media || 0
    const total = result[0].total || 0

    console.log("Dados calculados:", { media, total }) // Debug

    // ✅ CORRIGIDO: Garantir que é número e não string
    const notaMedia = media ? parseFloat(media) : 0

    await pool.execute(
      "UPDATE animacoes SET nota_media = ?, total_avaliacoes = ? WHERE id = ?", 
      [notaMedia, total, animacao_id]
    )

    console.log("Nota média atualizada:", notaMedia) // Debug
    
  } catch (error) {
    console.error("Erro ao atualizar nota média:", error)
  }
}

export const getMinhasAvaliacoes = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const usuario_id = req.user.id
    const offset = (page - 1) * limit

    const [avaliacoes] = await pool.execute(
      `SELECT a.*, 
              an.titulo, an.poster_url, an.nota_media, an.total_avaliacoes,
              GROUP_CONCAT(DISTINCT g.nome) as generos
       FROM avaliacoes a
       JOIN animacoes an ON a.animacao_id = an.id
       LEFT JOIN animacao_generos ag ON an.id = ag.animacao_id
       LEFT JOIN generos g ON ag.genero_id = g.id
       WHERE a.usuario_id = ?
       GROUP BY a.id
       ORDER BY a.created_at DESC
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      [usuario_id]
    )

    // Formatar gêneros como array
    avaliacoes.forEach(avaliacao => {
      if (avaliacao.generos) {
        avaliacao.generos = avaliacao.generos.split(',').map(g => g.trim())
      } else {
        avaliacao.generos = []
      }
    })

    const [countResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM avaliacoes WHERE usuario_id = ?",
      [usuario_id]
    )

    res.json({
      avaliacoes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar minhas avaliações:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}