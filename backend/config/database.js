import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "Animalist",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  charset: "utf8mb4",
}

// Para produção no Vercel, pode ser necessário SSL
if (process.env.NODE_ENV === "production") {
  config.ssl = {
    rejectUnauthorized: false,
  }
}

const pool = mysql.createPool(config)

// Testar conexão
const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log("✅ Conectado ao banco de dados MySQL")
    connection.release()
  } catch (error) {
    console.error("❌ Erro ao conectar com o banco de dados:", error.message)
  }
}

testConnection()

export default pool
