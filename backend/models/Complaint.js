import mongoose from 'mongoose'

const statusHistorySchema = new mongoose.Schema({
  stage: String,
  time: String,
  note: String,
}, { _id: false })

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  category: String,
  subcategory: String,
  title: String,
  description: String,
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  isSafety: { type: Boolean, default: false },
  isAnonymous: { type: Boolean, default: false },
  status: { type: String, default: 'Submitted' },
  statusHistory: [statusHistorySchema],
  assignedTo: { type: String, default: null },
  votes: { type: Number, default: 0 },
}, { timestamps: true })

complaintSchema.pre('save', async function (next) {
  if (!this.complaintId) {
    const count = await mongoose.model('Complaint').countDocuments()
    this.complaintId = `CMP-${String(count + 1).padStart(3, '0')}`
  }
  next()
})

export default mongoose.model('Complaint', complaintSchema)
