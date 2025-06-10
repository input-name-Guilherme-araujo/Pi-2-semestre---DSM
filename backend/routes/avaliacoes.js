import express from "express"
import {
  createAvaliacao,
  updateAvaliacao,
  deleteAvaliacao,
  getAvaliacoesByAnimacao,
  getMinhasAvaliacoes,
} from "../controllers/avaliacaoController.js"
import { authenticateToken } from "../middleware/auth.js"
import { validateAvaliacao } from "../middleware/validation.js"

const router = express.Router()

router.post("/", authenticateToken, validateAvaliacao, createAvaliacao)
router.put("/:id", authenticateToken, validateAvaliacao, updateAvaliacao)
router.delete("/:id", authenticateToken, deleteAvaliacao)
router.get("/animacao/:animacao_id", getAvaliacoesByAnimacao)
router.get("/minhas", authenticateToken, getMinhasAvaliacoes)

export default router
