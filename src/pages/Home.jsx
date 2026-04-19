import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const FEATURES = [
  'User Registration & Login',
  'Complaint Submission Form',
  'Feedback & Star Rating',
  'Real-Time Status Tracking',
  'Admin Dashboard',
  'Notification System',
  'Anonymous Submission',
  'Search & Filter Option',
]

const TEAM = [
  { name: 'SAHIL PAL', roll: '2023IMT-069' },
  { name: 'AMAN KUMAR', roll: '2023IMT-010' },
  { name: 'VISWAJIT SARAK PATIL', roll: '2023IMT-071' },
  { name: 'ARAVIND VALLIAPPAN SUBRAMANYAM', roll: '2023IMT-017' },
]

const IMPROVEMENTS = [
  { n: '01', title: 'Real-Time Status Tracker', desc: 'Stage-by-stage visibility: Submitted → Assigned → Under Review → Resolved with push notifications.' },
  { n: '02', title: 'Safety-Priority Flag', desc: '24-hour SLA for safety-flagged complaints vs standard 5-day window.' },
  { n: '03', title: 'Genuine Anonymity', desc: 'Identity separated at storage level. Clear UI confirmation during submission.' },
  { n: '04', title: 'Discipline-Specific Categories', desc: 'Two-tier taxonomy for precise routing and actionable analytics.' },
  { n: '05', title: 'Trending Complaints', desc: 'Aggregates similar complaints into institutional signals for representatives.' },
  { n: '06', title: 'Temporal Feedback Release', desc: 'Faculty feedback locked until grades are submitted to prevent retribution.' },
  { n: '07', title: 'Outcome Transparency', desc: 'Semester summaries showing changes made based on student feedback.' },
  { n: '08', title: 'Wellbeing Pathway', desc: '"Share a concern" channel routed to wellness counsellors, not administration.' },
]

export default function Home() {
  const { currentUser } = useApp()

  return (
    <div className="page">
      {/* Hero */}
      <section className="hero-section">
        <div className="container">
          <p className="hero-label">HCI PROJECT · 2026</p>
          <h1 className="hero-title">Student Complaint &amp; Feedback System</h1>
          <p className="hero-subtitle">A User-Centered HCI Design Approach</p>
          <div className="hero-buttons">
            <Link to={currentUser ? '/complaint/new' : '/login'} className="btn btn-white">
              📝 New Complaint
            </Link>
            <Link to={currentUser ? '/dashboard' : '/login'} className="btn btn-hero-outline">
              📊 View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features + Team */}
      <section className="section">
        <div className="container">
          <div className="grid-2">
            <div className="card">
              <h2 className="card-title">🔑 KEY FEATURES</h2>
              <div className="divider" />
              <ul className="feature-list">
                {FEATURES.map(f => (
                  <li key={f} className="feature-item">
                    <span className="check-icon">✅</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h2 className="card-title">👥 TEAM MEMBERS</h2>
              <div className="divider" />
              <ul className="team-list">
                {TEAM.map(m => (
                  <li key={m.roll} className="team-item">
                    <span className="team-icon">👤</span>
                    <div>
                      <p className="team-name">{m.name}</p>
                      <p className="team-roll">Roll No: {m.roll}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interview Insights */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Research-Driven Design</h2>
            <p className="section-subtitle">Based on structured interviews with 6 students across engineering, technology &amp; medical institutions — March 2026.</p>
          </div>
          <div className="interviews-grid">
            {[
              { num: '01', name: 'Soham Patil', info: 'IMT · IIITM Gwalior', quote: '"It felt like shouting into a void."' },
              { num: '02', name: 'Arnav Jagtap', info: 'CSE · IIT Gandhinagar', quote: '"If anonymity is cosmetic, students will distrust it within a month."' },
              { num: '03', name: 'Aditya Kumar', info: 'Chemical Engg · IIT Guwahati', quote: '"Either complaints vanish or resolve three months later with no explanation."' },
              { num: '04', name: 'Pratham Jaishwal', info: 'ECE · IIITM Gwalior', quote: '"The hardest part is convincing students to report at all."' },
              { num: '05', name: 'Shrawan Kolekar', info: 'CSE · COEP Pune', quote: '"Make this feel designed for the person submitting, not receiving."' },
              { num: '06', name: 'Arin Singh', info: 'MBBS · AIIMS Rishikesh', quote: '"A poorly addressed complaint can affect patient care and wellbeing."' },
            ].map(p => (
              <div key={p.num} className="interview-card">
                <span className="interview-num">{p.num}</span>
                <div>
                  <p className="interview-name">{p.name}</p>
                  <p className="interview-info">{p.info}</p>
                  <p className="interview-quote">{p.quote}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Improvements */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Platform Improvements</h2>
            <p className="section-subtitle">10 evidence-based improvements derived from user research.</p>
          </div>
          <div className="improvements-grid">
            {IMPROVEMENTS.map(item => (
              <div key={item.n} className="improvement-card">
                <span className="improvement-num">{item.n}</span>
                <div>
                  <p className="improvement-title">{item.title}</p>
                  <p className="improvement-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!currentUser && (
        <section className="cta-section">
          <div className="container">
            <h2 className="cta-title">Ready to get started?</h2>
            <p className="cta-subtitle">Register with your institute email and file your first complaint in under 90 seconds.</p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-white">Register Now</Link>
              <Link to="/login" className="btn btn-hero-outline">Login</Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>Human Computer Interaction · Dept. of Computer Science &amp; Engineering · 2025–26</p>
          <p className="footer-sub">Academic Use Only · Confidential</p>
        </div>
      </footer>
    </div>
  )
}
