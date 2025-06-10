import express from "express"
import { getGeneros, createGenero } from "../controllers/generoController.js"
import { authenticateToken, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

router.get("/", getGeneros)
router.post("/", authenticateToken, requireAdmin, createGenero)

export default router
