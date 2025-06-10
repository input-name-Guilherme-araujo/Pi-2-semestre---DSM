import pool from "../config/database.js"

export const getGeneros = async (req, res) => {
  try {
    const [generos] = await pool.execute("SELECT * FROM generos ORDER BY nome")

    res.json(generos)
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

export const createGenero = async (req, res) => {
  try {
    const { nome, descricao, cor } = req.body

    const [result] = await pool.execute("INSERT INTO generos (nome, descricao, cor) VALUES (?, ?, ?)", [
      nome,
      descricao || null,
      cor || "#6366f1",
    ])

    res.status(201).json({
      message: "Gênero criado com sucesso",
      id: result.insertId,
    })
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Gênero já existe" })
    }
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}
