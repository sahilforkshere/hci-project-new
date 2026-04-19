import mongoose from 'mongoose'

const feedbackSchema = new mongoose.Schema({
  feedbackId: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: String,
  targetName: String,
  rating: { type: Number, min: 1, max: 5 },
  aspects: [String],
  comment: String,
  isAnonymous: { type: Boolean, default: false },
}, { timestamps: true })

feedbackSchema.pre('save', async function (next) {
  if (!this.feedbackId) {
    const count = await mongoose.model('Feedback').countDocuments()
    this.feedbackId = `FB-${String(count + 1).padStart(3, '0')}`
  }
  next()
})

export default mongoose.model('Feedback', feedbackSchema)
