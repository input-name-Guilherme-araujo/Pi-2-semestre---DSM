import express from "express"
import { register, login, getProfile } from "../controllers/authController.js"
import { validateUser, validateLogin } from "../middleware/validation.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

router.post("/register", validateUser, register)
router.post("/login", validateLogin, login)
router.get("/profile", authenticateToken, getProfile)

export default router
