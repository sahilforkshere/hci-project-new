import express from 'express'
import Feedback from '../models/Feedback.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authMiddleware, async (req, res) => {
  try {
    const filter = req.user.isAdmin ? {} : { userId: req.user.id }
    const feedback = await Feedback.find(filter).sort({ createdAt: -1 })
    res.json(feedback)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { targetType, targetName, rating, aspects, comment, isAnonymous } = req.body
    const fb = await Feedback.create({ userId: req.user.id, targetType, targetName, rating, aspects, comment, isAnonymous: !!isAnonymous })
    res.json(fb)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
