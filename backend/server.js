import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import complaintRoutes from './routes/complaints.js'
import feedbackRoutes from './routes/feedback.js'
import notificationRoutes from './routes/notifications.js'

dotenv.config()

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/complaints', complaintRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/notifications', notificationRoutes)

let connected = false
async function connectDB() {
  if (!connected) {
    await mongoose.connect(process.env.MONGO_URI)
    connected = true
  }
}

app.use(async (req, res, next) => {
  try { await connectDB(); next() } catch (err) { res.status(500).json({ error: 'DB connection failed' }) }
})

// Local dev
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => console.log(`Server running on port ${process.env.PORT || 8000}`))
  })
}

export default app
