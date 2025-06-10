import pool from "../config/database.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const runMigrations = async () => {
  try {
    console.log("🔄 Executando migrações do banco de dados...")

    // Ler o arquivo schema.sql
    const schemaPath = path.join(__dirname, "../database/schema.sql")
    const schema = fs.readFileSync(schemaPath, "utf8")

    // Dividir em comandos individuais
    const commands = schema
      .split(";")
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0)

    // Executar cada comando
    for (const command of commands) {
      if (command.toLowerCase().includes("create") || command.toLowerCase().includes("insert")) {
        await pool.execute(command)
        console.log(`✅ Executado: ${command.substring(0, 50)}...`)
      }
    }

    console.log("🎉 Migrações concluídas com sucesso!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Erro durante as migrações:", error)
    process.exit(1)
  }
}

runMigrations()
