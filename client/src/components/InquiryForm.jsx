import { useState } from 'react'
import api, { errorMessage } from '../api'

const EMPTY = { name: '', email: '', phone: '', message: '', preferredContact: 'Phone' }

export default function InquiryForm({ property }) {
  const [form, setForm] = useState({ ...EMPTY, message: `Hi, I am interested in "${property.title}". Please share more details.` })
  const [status, setStatus] = useState({ type: '', text: '' })
  const [sending, setSending] = useState(false)

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSending(true)
    setStatus({ type: '', text: '' })
    try {
      const { data } = await api.post('/inquiries', { ...form, property: property._id })
      setStatus({ type: 'success', text: data.message })
      setForm({ ...EMPTY, message: '' })
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) })
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="card form inquiry-form" onSubmit={submit}>
      <h3>Interested? Send an inquiry</h3>
      <p className="muted small">The broker will get back to you within 24 hours.</p>

      <label>Full name<input name="name" value={form.name} onChange={update} required minLength={2} /></label>
      <label>Email<input type="email" name="email" value={form.email} onChange={update} required /></label>
      <label>Phone<input type="tel" name="phone" value={form.phone} onChange={update} required pattern="[+]?[\d\s\-]{10,15}" placeholder="10-digit mobile number" /></label>
      <label>
        Preferred contact
        <select name="preferredContact" value={form.preferredContact} onChange={update}>
          <option>Phone</option>
          <option>WhatsApp</option>
          <option>Email</option>
        </select>
      </label>
      <label>Message<textarea name="message" rows={4} value={form.message} onChange={update} required minLength={5} /></label>

      {status.text && <p className={`alert alert-${status.type}`} role="status">{status.text}</p>}
      <button className="btn btn-primary btn-block" disabled={sending}>{sending ? 'Sending…' : 'Submit Inquiry'}</button>
    </form>
  )
}
