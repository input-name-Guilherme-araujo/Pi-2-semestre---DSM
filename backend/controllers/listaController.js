import pool from "../config/database.js"

export const addToLista = async (req, res) => {
  try {
    const { animacao_id, status } = req.body
    const usuario_id = req.user.id

    console.log("Adicionando à lista:", { usuario_id, animacao_id, status }) // Debug

    // Validar se os dados obrigatórios estão presentes
    if (!animacao_id || !status) {
      return res.status(400).json({ 
        error: "animacao_id e status são obrigatórios" 
      })
    }

    // Validar se o status é válido conforme o ENUM do banco
    const statusValidos = ['assistido', 'desejado', 'assistindo', 'pausado', 'abandonado']
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ 
        error: "Status inválido. Use: " + statusValidos.join(', ')
      })
    }

    // Verificar se a animação existe
    const [animacaoExists] = await pool.execute(
      "SELECT id FROM animacoes WHERE id = ?",
      [animacao_id]
    )

    if (animacaoExists.length === 0) {
      return res.status(404).json({ error: "Animação não encontrada" })
    }

    const [result] = await pool.execute(
      `INSERT INTO lista_pessoal (usuario_id, animacao_id, status) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE status = ?, updated_at = CURRENT_TIMESTAMP`,
      [usuario_id, animacao_id, status, status]
    )

    console.log("Resultado da inserção:", result) // Debug

    res.json({ 
      message: "Animação adicionada à lista com sucesso",
      id: result.insertId || null
    })
  } catch (error) {
    console.error("Erro ao adicionar à lista:", error)
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: error.message 
    })
  }
}

export const removeFromLista = async (req, res) => {
  try {
    const { animacao_id } = req.params
    const usuario_id = req.user.id

    console.log("Removendo da lista:", { usuario_id, animacao_id }) // Debug

    const [result] = await pool.execute(
      "DELETE FROM lista_pessoal WHERE usuario_id = ? AND animacao_id = ?", 
      [usuario_id, animacao_id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item não encontrado na lista" })
    }

    res.json({ message: "Animação removida da lista com sucesso" })
  } catch (error) {
    console.error("Erro ao remover da lista:", error)
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: error.message 
    })
  }
}

export const getMinhaLista = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const usuario_id = req.user.id
    const limitInt = parseInt(limit, 10)
    const pageInt = parseInt(page, 10)
    const offset = (pageInt - 1) * limitInt

    console.log("Buscando lista para usuário:", usuario_id, { status, page, limit }) // Debug

    let query = `
      SELECT lp.*, a.titulo, a.poster_url, a.nota_media, a.total_avaliacoes,
             a.ano_lancamento, a.episodios, a.status as anime_status
      FROM lista_pessoal lp
      JOIN animacoes a ON lp.animacao_id = a.id
      WHERE lp.usuario_id = ?
    `
    const params = [usuario_id]

    if (status && status !== '') {
      query += " AND lp.status = ?"
      params.push(status)
    }

    query += ` ORDER BY lp.updated_at DESC LIMIT ${limitInt} OFFSET ${offset}`

    const [lista] = await pool.execute(query, params)

    // Buscar contagem total
    let countQuery = "SELECT COUNT(*) as total FROM lista_pessoal WHERE usuario_id = ?"
    let countParams = [usuario_id]
    
    if (status && status !== '') {
      countQuery += " AND status = ?"
      countParams.push(status)
    }

    const [countResult] = await pool.execute(countQuery, countParams)

    console.log("Lista encontrada:", lista.length, "itens") // Debug

    res.json({
      lista,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limitInt),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar lista:", error)
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: error.message 
    })
  }
}
