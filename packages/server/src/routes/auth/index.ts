import express from 'express'
import authController from '../../controllers/auth'

const router = express.Router()

// POST /api/v1/auth/register
router.post('/register', authController.register)

// POST /api/v1/auth/login
router.post('/login', authController.login)

// GET /api/v1/auth/me
router.get('/me', authController.me)

export default router