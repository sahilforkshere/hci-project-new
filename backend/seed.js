import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from './models/User.js'

dotenv.config()

await mongoose.connect(process.env.MONGO_URI)

const users = [
  { name: 'Admin', email: 'admin@iiitm.ac.in', password: 'admin123', rollNo: 'ADMIN', department: 'Administration', year: '-', isAdmin: true },
  { name: 'Sahil Pal', email: 'sahil@iiitm.ac.in', password: 'student123', rollNo: '2023IMT-069', department: 'CSE', year: '3rd', isAdmin: false },
  { name: 'Rohit Singh', email: 'rohit@iiitm.ac.in', password: 'student123', rollNo: '2023IMT-045', department: 'CSE', year: '3rd', isAdmin: false },
  { name: 'Aman Gupta', email: 'aman@iiitm.ac.in', password: 'student123', rollNo: '2023IMT-012', department: 'CSE', year: '3rd', isAdmin: false },
]

for (const u of users) {
  const exists = await User.findOne({ email: u.email })
  if (!exists) {
    await User.create({ ...u, password: await bcrypt.hash(u.password, 10) })
    console.log(`Created: ${u.email}`)
  } else {
    console.log(`Already exists: ${u.email}`)
  }
}

await mongoose.disconnect()
console.log('Done.')
