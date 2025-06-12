import pool from "../config/database.js"

export const getAnimacoes = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      genero, 
      status, 
      ano_min, // ✅ NOVO PARÂMETRO PARA ANO MÍNIMO
      orderBy,
      order = "DESC"
    } = req.query
    
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);

    let query = `
      SELECT a.*,
             GROUP_CONCAT(DISTINCT g.id) as genero_ids,
             GROUP_CONCAT(DISTINCT g.nome) as generos
      FROM animacoes a
      LEFT JOIN animacao_generos ag ON a.id = ag.animacao_id
      LEFT JOIN generos g ON ag.genero_id = g.id
      WHERE 1=1
    `
    const params = []

    if (search) {
      query += " AND (a.titulo LIKE ? OR a.titulo_original LIKE ?)"
      params.push(`%${search}%`, `%${search}%`)
    }

    if (genero) {
      query += " AND g.id = ?"
      params.push(genero)
    }

    // ✅ FILTRO POR STATUS - SUPORTE A MÚLTIPLOS STATUS
    if (status) {
      if (status.includes(',')) {
        // Se contém vírgula, é uma lista de status
        const statusList = status.split(',').map(s => s.trim())
        const placeholders = statusList.map(() => '?').join(',')
        query += ` AND a.status IN (${placeholders})`
        params.push(...statusList)
      } else {
        // Status único
        query += " AND a.status = ?"
        params.push(status)
      }
    }

    // ✅ FILTRO POR ANO MÍNIMO (PARA FINALIZADOS 2025+)
    if (ano_min) {
      query += " AND a.ano_lancamento >= ?"
      params.push(parseInt(ano_min))
    }

    query += " GROUP BY a.id"

    if (orderBy) {
      query += ` ORDER BY a.${orderBy} ${order}`
    } else {
      query += " ORDER BY a.created_at DESC"
    }

    query += ` LIMIT ${limitInt} OFFSET ${(pageInt - 1) * limitInt}`

    console.log("Executando query de busca de animações...")

    const [animacoes] = await pool.execute(query, params)

    animacoes.forEach(anime => {
      if (anime.generos) {
        anime.generos = anime.generos.split(',').map(g => g.trim());
      } else {
        anime.generos = [];
      }
      
      if (anime.genero_ids) {
        anime.genero_ids = anime.genero_ids.split(',').map(id => parseInt(id));
      } else {
        anime.genero_ids = [];
      }
    });

    // ✅ QUERY DE CONTAGEM - ATUALIZADA PARA INCLUIR ano_min
    let countQuery = `
      SELECT COUNT(DISTINCT a.id) as total 
      FROM animacoes a
      LEFT JOIN animacao_generos ag ON a.id = ag.animacao_id
      LEFT JOIN generos g ON ag.genero_id = g.id
      WHERE 1=1
    `;
    
    const countParams = []

    if (search) {
      countQuery += " AND (a.titulo LIKE ? OR a.titulo_original LIKE ?)"
      countParams.push(`%${search}%`, `%${search}%`)
    }

    if (genero) {
      countQuery += " AND g.id = ?"
      countParams.push(genero)
    }

    if (status) {
      if (status.includes(',')) {
        const statusList = status.split(',').map(s => s.trim())
        const placeholders = statusList.map(() => '?').join(',')
        countQuery += ` AND a.status IN (${placeholders})`
        countParams.push(...statusList)
      } else {
        countQuery += " AND a.status = ?"
        countParams.push(status)
      }
    }

    // ✅ FILTRO POR ANO MÍNIMO NA CONTAGEM TAMBÉM
    if (ano_min) {
      countQuery += " AND a.ano_lancamento >= ?"
      countParams.push(parseInt(ano_min))
    }

    const [countResult] = await pool.execute(countQuery, countParams)

    res.json({
      animacoes,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limitInt),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar animações:", error)
    res.status(500).json({ error: "Erro interno do servidor", details: error.message })
  }
}

export const getAnimacaoById = async (req, res) => {
  try {
    const { id } = req.params

    const [animacoes] = await pool.execute(
      `SELECT a.*, 
              GROUP_CONCAT(DISTINCT CONCAT(g.id, ':', g.nome, ':', g.cor)) as generos_info
       FROM animacoes a
       LEFT JOIN animacao_generos ag ON a.id = ag.animacao_id
       LEFT JOIN generos g ON ag.genero_id = g.id
       WHERE a.id = ?
       GROUP BY a.id`,
      [id],
    )

    if (animacoes.length === 0) {
      return res.status(404).json({ error: "Animação não encontrada" })
    }

    const animacao = animacoes[0]
    
    animacao.generos = []
    if (animacao.generos_info) {
      animacao.generos = animacao.generos_info.split(",").map((g) => {
        const [id, nome, cor] = g.split(":")
        return { id: Number.parseInt(id), nome, cor }
      });
      delete animacao.generos_info;
    }

    const [avaliacoes] = await pool.execute(
      `SELECT a.*, u.nome as usuario_nome, u.avatar_url
       FROM avaliacoes a
       JOIN usuarios u ON a.usuario_id = u.id
       WHERE a.animacao_id = ?
       ORDER BY a.created_at DESC
       LIMIT 5`,
      [id],
    )

    animacao.avaliacoes_recentes = avaliacoes

    const [statsResult] = await pool.execute(
      `SELECT 
         COUNT(*) as total_avaliacoes,
         IFNULL(AVG(nota), 0) as nota_media,
         COUNT(CASE WHEN nota = 5 THEN 1 END) as nota5,
         COUNT(CASE WHEN nota = 4 THEN 1 END) as nota4,
         COUNT(CASE WHEN nota = 3 THEN 1 END) as nota3,
         COUNT(CASE WHEN nota = 2 THEN 1 END) as nota2,
         COUNT(CASE WHEN nota = 1 THEN 1 END) as nota1
       FROM avaliacoes WHERE animacao_id = ?`,
      [id]
    );

    if (statsResult && statsResult[0]) {
      animacao.total_avaliacoes = statsResult[0].total_avaliacoes
      animacao.nota_media = Number(statsResult[0].nota_media).toFixed(1)
      animacao.stats = {
        distribuicao: {
          5: statsResult[0].nota5,
          4: statsResult[0].nota4,
          3: statsResult[0].nota3,
          2: statsResult[0].nota2,
          1: statsResult[0].nota1,
        }
      }
    }

    res.json(animacao)
  } catch (error) {
    console.error("Erro ao buscar detalhes da animação:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

export const createAnimacao = async (req, res) => {
  try {
    const { generos, ...animacaoData } = req.body

    console.log("Criando animação:", animacaoData, "Gêneros:", generos)

    const [result] = await pool.execute(
      `INSERT INTO animacoes (titulo, titulo_original, sinopse, poster_url, banner_url, 
       ano_lancamento, episodios, status, estudio, diretor) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        animacaoData.titulo,
        animacaoData.titulo_original || null,
        animacaoData.sinopse || null,
        animacaoData.poster_url || null,
        animacaoData.banner_url || null,
        animacaoData.ano_lancamento || null,
        animacaoData.episodios || 1,
        animacaoData.status || "Finalizado",
        animacaoData.estudio || null,
        animacaoData.diretor || null,
      ],
    )

    const animacaoId = result.insertId

    if (generos && Array.isArray(generos) && generos.length > 0) {
      for (const generoId of generos) {
        await pool.execute(
          "INSERT INTO animacao_generos (animacao_id, genero_id) VALUES (?, ?)", 
          [animacaoId, generoId]
        )
      }
    }

    res.status(201).json({
      message: "Animação criada com sucesso",
      id: animacaoId,
    })
  } catch (error) {
    console.error("Erro ao criar animação:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

export const updateAnimacao = async (req, res) => {
  try {
    const { id } = req.params
    const { generos, ...animacaoData } = req.body

    console.log("Atualizando animação:", id, animacaoData, "Gêneros:", generos)

    await pool.execute(
      `UPDATE animacoes SET 
       titulo = ?, titulo_original = ?, sinopse = ?, poster_url = ?, banner_url = ?, 
       ano_lancamento = ?, episodios = ?, status = ?, estudio = ?, diretor = ?, 
       updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        animacaoData.titulo,
        animacaoData.titulo_original || null,
        animacaoData.sinopse || null,
        animacaoData.poster_url || null,
        animacaoData.banner_url || null,
        animacaoData.ano_lancamento || null,
        animacaoData.episodios || 1,
        animacaoData.status || "Finalizado",
        animacaoData.estudio || null,
        animacaoData.diretor || null,
        id,
      ],
    )

    if (generos && Array.isArray(generos)) {
      await pool.execute("DELETE FROM animacao_generos WHERE animacao_id = ?", [id])

      if (generos.length > 0) {
        for (const generoId of generos) {
          await pool.execute(
            "INSERT INTO animacao_generos (animacao_id, genero_id) VALUES (?, ?)", 
            [id, generoId]
          )
        }
      }
    }

    res.json({ message: "Animação atualizada com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar animação:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

export const deleteAnimacao = async (req, res) => {
  try {
    const { id } = req.params

    await pool.execute("DELETE FROM animacoes WHERE id = ?", [id])

    res.json({ message: "Animação removida com sucesso" })
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}
