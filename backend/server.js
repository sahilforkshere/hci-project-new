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

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(process.env.PORT || 8000, () => console.log(`Server running on port ${process.env.PORT || 5000}`))
  })
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1) })
