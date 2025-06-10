import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import pool from "../config/database.js"

export const register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body

    const [existingUsers] = await pool.execute("SELECT id FROM usuarios WHERE email = ?", [email])

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "Email já cadastrado" })
    }

    const hashedPassword = await bcrypt.hash(senha, Number.parseInt(process.env.BCRYPT_ROUNDS))

    const [result] = await pool.execute("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)", [
      nome,
      email,
      hashedPassword,
    ])

    const token = jwt.sign({ userId: result.insertId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })

    res.status(201).json({
      message: "Usuário criado com sucesso",
      token,
      user: {
        id: result.insertId,
        nome,
        email,
        role: "user",
      },
    })
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body

    const [users] = await pool.execute(
      "SELECT u.*, r.nome as role FROM usuarios u JOIN roles r ON u.role_id = r.id WHERE u.email = ? AND u.ativo = TRUE",
      [email],
    )

    if (users.length === 0) {
      return res.status(401).json({ error: "Credenciais inválidas" })
    }

    const user = users[0]
    const isValidPassword = await bcrypt.compare(senha, user.senha)

    if (!isValidPassword) {
      return res.status(401).json({ error: "Credenciais inválidas" })
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

    res.json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    })
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

export const getProfile = async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT u.id, u.nome, u.email, u.avatar_url, r.nome as role FROM usuarios u JOIN roles r ON u.role_id = r.id WHERE u.id = ?",
      [req.user.id],
    )

    res.json(users[0])
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}
