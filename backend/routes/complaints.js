import express from 'express'
import Complaint from '../models/Complaint.js'
import Notification from '../models/Notification.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authMiddleware, async (req, res) => {
  try {
    const filter = req.user.isAdmin ? {} : { userId: req.user.id }
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 })
    res.json(complaints)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { category, subcategory, title, description, priority, isSafety, isAnonymous } = req.body
    const ts = new Date().toISOString()
    const complaint = await Complaint.create({
      userId: req.user.id,
      userName: isAnonymous ? 'Anonymous' : req.body.userName,
      category, subcategory, title, description, priority,
      isSafety: !!isSafety, isAnonymous: !!isAnonymous,
      status: 'Submitted',
      statusHistory: [{ stage: 'Submitted', time: ts, note: isSafety ? 'Safety complaint received — expedited handling.' : 'Complaint received and logged.' }],
    })
    await Notification.create({ userId: req.user.id, message: `Complaint ${complaint.complaintId} submitted successfully.`, type: 'success' })
    res.json(complaint)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { newStatus, note, assignedTo } = req.body
    const ts = new Date().toISOString()
    const complaint = await Complaint.findOneAndUpdate(
      { complaintId: req.params.id },
      {
        status: newStatus,
        $push: { statusHistory: { stage: newStatus, time: ts, note } },
        ...(assignedTo && { assignedTo }),
      },
      { new: true }
    )
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' })
    await Notification.create({
      userId: complaint.userId,
      message: `Complaint ${complaint.complaintId} updated to "${newStatus}". ${note}`,
      type: newStatus === 'Resolved' ? 'resolved' : 'update',
    })
    res.json(complaint)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/escalate', authMiddleware, async (req, res) => {
  try {
    const ts = new Date().toISOString()
    const complaint = await Complaint.findOneAndUpdate(
      { complaintId: req.params.id, userId: req.user.id },
      {
        priority: 'Critical',
        $push: { statusHistory: { stage: 'Escalated', time: ts, note: 'Escalated to higher authority by student.' } },
      },
      { new: true }
    )
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' })
    await Notification.create({ userId: req.user.id, message: `Complaint ${complaint.complaintId} has been escalated.`, type: 'update' })
    res.json(complaint)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/vote', authMiddleware, async (req, res) => {
  try {
    const complaint = await Complaint.findOneAndUpdate(
      { complaintId: req.params.id },
      { $inc: { votes: 1 } },
      { new: true }
    )
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' })
    res.json(complaint)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
