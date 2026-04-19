import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from './models/User.js'

dotenv.config()

await mongoose.connect(process.env.MONGO_URI)

const adminExists = await User.findOne({ email: 'admin@iiitm.ac.in' })
if (!adminExists) {
  await User.create({
    name: 'Admin',
    email: 'admin@iiitm.ac.in',
    password: await bcrypt.hash('admin123', 10),
    rollNo: 'ADMIN',
    department: 'Administration',
    year: '-',
    isAdmin: true,
  })
  console.log('Admin user created')
} else {
  console.log('Admin already exists')
}

await mongoose.disconnect()
