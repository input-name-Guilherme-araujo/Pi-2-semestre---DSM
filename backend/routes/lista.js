import express from "express"
import { addToLista, removeFromLista, getMinhaLista } from "../controllers/listaController.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

router.post("/", authenticateToken, addToLista)
router.delete("/:animacao_id", authenticateToken, removeFromLista)
router.get("/minha", authenticateToken, getMinhaLista)

export default router
