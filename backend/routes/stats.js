import express from "express"
import { 
  getDashboardStats, 
  getRecentAnimacoes, 
  getUsuariosRecentes 
} from "../controllers/statsController.js"
import { authenticateToken, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

// Todas as rotas de estatísticas requerem admin
router.get("/dashboard", authenticateToken, requireAdmin, getDashboardStats)
router.get("/animacoes/recentes", authenticateToken, requireAdmin, getRecentAnimacoes)
router.get("/usuarios/recentes", authenticateToken, requireAdmin, getUsuariosRecentes)

export default router