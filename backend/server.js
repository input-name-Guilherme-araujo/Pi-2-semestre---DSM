import express from "express"
import cors from "cors"
import helmet from "helmet"

import dotenv from "dotenv"
import statsRoutes from "./routes/stats.js"
import authRoutes from "./routes/auth.js"
import animacaoRoutes from "./routes/animacoes.js"
import avaliacaoRoutes from "./routes/avaliacoes.js"
import listaRoutes from "./routes/lista.js"
import generoRoutes from "./routes/generos.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

//  REMOVER TODO O BLOCO DE RATE LIMITING
/*
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: "Muitas requisições, tente novamente em 15 minutos",
  standardHeaders: true,
  legacyHeaders: false,
})
*/

// Middlewares de segurança
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
)

// CORS configurado para desenvolvimento e produção
const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sem origin (mobile apps, etc.)
    if (!origin) return callback(null, true)

    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://animalist-frontend.vercel.app", // Substitua pelo seu domínio
    ]

    if (process.env.NODE_ENV === "development") {
      allowedOrigins.push("http://127.0.0.1:3000", "http://127.0.0.1:5173")
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Não permitido pelo CORS"))
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}

app.use(cors(corsOptions))
// app.use(limiter) // Descomente se quiser usar rate limiting
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Log de requests em desenvolvimento
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`)
    next()
  })
}

// Rotas da API
app.use("/api/auth", authRoutes)
app.use("/api/animacoes", animacaoRoutes)
app.use("/api/avaliacoes", avaliacaoRoutes)
app.use("/api/lista", listaRoutes)
app.use("/api/generos", generoRoutes)
app.use("/api/stats", statsRoutes)
// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    message: "AnimaList API está funcionando!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      animacoes: "/api/animacoes",
      avaliacoes: "/api/avaliacoes",
      lista: "/api/lista",
      generos: "/api/generos",
      health: "/api/health",
    },
  })
})

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error("❌ Erro:", err.stack)

  if (err.message === "Não permitido pelo CORS") {
    return res.status(403).json({ error: "CORS: Origem não permitida" })
  }

  res.status(500).json({
    error: process.env.NODE_ENV === "production" ? "Erro interno do servidor" : err.message,
  })
})

// Middleware para rotas não encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Rota não encontrada",
    path: req.originalUrl,
    method: req.method,
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📍 Ambiente: ${process.env.NODE_ENV || "development"}`)
  console.log(`🔗 URL: http://localhost:${PORT}`)
})

export default app
