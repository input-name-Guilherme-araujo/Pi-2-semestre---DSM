import pool from "../config/database.js"

export const getDashboardStats = async (req, res) => {
  try {
    // Buscar total de animações
    const [animacoesCount] = await pool.execute(
      "SELECT COUNT(*) as total FROM animacoes"
    )

    // Buscar total de usuários ativos
    const [usuariosCount] = await pool.execute(
      "SELECT COUNT(*) as total FROM usuarios WHERE ativo = TRUE"
    )

    // ✅ CORRIGIDO: Buscar total de avaliações sem JOIN
    const [avaliacoesCount] = await pool.execute(
      "SELECT COUNT(*) as total FROM avaliacoes"
    )

    // Buscar comentários pendentes
    const [comentariosPendentes] = await pool.execute(
      `SELECT COUNT(*) as total FROM avaliacoes 
       WHERE comentario IS NOT NULL AND comentario != '' 
       AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    )

    // Buscar crescimento mensal de animações
    const [animacoesMes] = await pool.execute(
      `SELECT COUNT(*) as total FROM animacoes 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`
    )

    // Buscar crescimento mensal de usuários
    const [usuariosMes] = await pool.execute(
      `SELECT COUNT(*) as total FROM usuarios 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH) AND ativo = TRUE`
    )

    // Buscar crescimento mensal de avaliações
    const [avaliacoesMes] = await pool.execute(
      `SELECT COUNT(*) as total FROM avaliacoes 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`
    )

    // Buscar animações mais bem avaliadas
    const [topAnimacoes] = await pool.execute(
      `SELECT a.id, a.titulo, a.nota_media, a.total_avaliacoes, a.poster_url
       FROM animacoes a
       WHERE a.total_avaliacoes > 0
       ORDER BY a.nota_media DESC, a.total_avaliacoes DESC
       LIMIT 5`
    )

    // ✅ CORRIGIDO: Buscar usuários mais ativos usando subconsulta
    const [usuariosAtivos] = await pool.execute(
      `SELECT u.nome, u.email, u.created_at,
              (SELECT COUNT(*) FROM avaliacoes av WHERE av.usuario_id = u.id) as total_avaliacoes
       FROM usuarios u
       WHERE u.ativo = TRUE
       ORDER BY total_avaliacoes DESC
       LIMIT 5`
    )

    // Buscar distribuição por gênero
    const [generoStats] = await pool.execute(
      `SELECT g.nome, g.cor, COUNT(ag.animacao_id) as total
       FROM generos g
       LEFT JOIN animacao_generos ag ON g.id = ag.genero_id
       GROUP BY g.id, g.nome, g.cor
       ORDER BY total DESC
       LIMIT 8`
    )

    // Buscar últimas atividades
    const [ultimasAvaliacoes] = await pool.execute(
      `SELECT a.*, u.nome as usuario_nome, an.titulo as anime_titulo
       FROM avaliacoes a
       JOIN usuarios u ON a.usuario_id = u.id
       JOIN animacoes an ON a.animacao_id = an.id
       ORDER BY a.created_at DESC
       LIMIT 10`
    )

    res.json({
      totals: {
        animacoes: animacoesCount[0].total,
        usuarios: usuariosCount[0].total,
        avaliacoes: avaliacoesCount[0].total,
        comentariosPendentes: comentariosPendentes[0].total,
      },
      crescimento: {
        animacoesMes: animacoesMes[0].total,
        usuariosMes: usuariosMes[0].total,
        avaliacoesMes: avaliacoesMes[0].total,
      },
      topAnimacoes,
      usuariosAtivos,
      generoStats,
      ultimasAvaliacoes,
    })
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

export const getUsuariosRecentes = async (req, res) => {
  try {
    const { limit = 10 } = req.query

    // ✅ CORRIGIDO: Usar subconsultas para evitar duplicação
    const [usuarios] = await pool.execute(
      `SELECT u.id, u.nome, u.email, u.avatar_url, u.created_at,
              r.nome as role,
              (SELECT COUNT(*) FROM avaliacoes av WHERE av.usuario_id = u.id) as total_avaliacoes,
              (SELECT COUNT(*) FROM lista_pessoal lp WHERE lp.usuario_id = u.id) as total_lista
       FROM usuarios u
       JOIN roles r ON u.role_id = r.id
       WHERE u.ativo = TRUE
       ORDER BY u.created_at DESC
       LIMIT ${parseInt(limit)}`,
      []
    )

    res.json(usuarios)
  } catch (error) {
    console.error("Erro ao buscar usuários recentes:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

export const getRecentAnimacoes = async (req, res) => {
  try {
    const { limit = 10 } = req.query
    
    // ✅ CORRIGIDO: Usar subconsulta para contar avaliações
    const [animacoes] = await pool.execute(
      `SELECT a.*, 
              GROUP_CONCAT(DISTINCT g.nome) as generos,
              (SELECT COUNT(*) FROM avaliacoes av WHERE av.animacao_id = a.id) as total_avaliacoes_real
       FROM animacoes a
       LEFT JOIN animacao_generos ag ON a.id = ag.animacao_id
       LEFT JOIN generos g ON ag.genero_id = g.id
       GROUP BY a.id
       ORDER BY a.created_at DESC
       LIMIT ${parseInt(limit)}`,
      []
    )

    // Formatar gêneros como array
    animacoes.forEach(anime => {
      if (anime.generos) {
        anime.generos = anime.generos.split(',').map(g => g.trim())
      } else {
        anime.generos = []
      }
    })

    res.json(animacoes)
  } catch (error) {
    console.error("Erro ao buscar animações recentes:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}