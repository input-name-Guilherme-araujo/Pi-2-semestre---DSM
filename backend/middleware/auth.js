import jwt from "jsonwebtoken"
import pool from "../config/database.js"

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Token de acesso requerido" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const [users] = await pool.execute(
      "SELECT u.*, r.nome as role FROM usuarios u JOIN roles r ON u.role_id = r.id WHERE u.id = ? AND u.ativo = TRUE",
      [decoded.userId],
    )

    if (users.length === 0) {
      return res.status(401).json({ error: "Usuário não encontrado ou inativo" })
    }

    req.user = users[0]
    next()
  } catch (error) {
    return res.status(403).json({ error: "Token inválido" })
  }
}

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Acesso negado. Apenas administradores." })
  }
  next()
}
