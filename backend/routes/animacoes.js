import express from "express"
import {
  getAnimacoes,
  getAnimacaoById,
  createAnimacao,
  updateAnimacao,
  deleteAnimacao,
} from "../controllers/animacaoController.js"
import { authenticateToken, requireAdmin } from "../middleware/auth.js"
import { validateAnimacao } from "../middleware/validation.js"

const router = express.Router()

router.get("/", getAnimacoes)
router.get("/:id", getAnimacaoById)
router.post("/", authenticateToken, requireAdmin, validateAnimacao, createAnimacao)
router.put("/:id", authenticateToken, requireAdmin, validateAnimacao, updateAnimacao)
router.delete("/:id", authenticateToken, requireAdmin, deleteAnimacao)

export default router
