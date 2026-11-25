import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api, { errorMessage } from '../../api'
import Loader from '../../components/Loader'

export default function AdminLogin() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // null = checking, true = no admin exists yet (show one-time setup), false = normal login
  const [needsSetup, setNeedsSetup] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api
      .get('/auth/setup')
      .then((r) => setNeedsSetup(r.data.needsSetup))
      .catch(() => setNeedsSetup(false))
  }, [])

  if (user) return <Navigate to="/admin" replace />
  if (needsSetup === null) return <Loader />

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (needsSetup && form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    setBusy(true)
    try {
      if (needsSetup) {
        await api.post('/auth/setup', { name: form.name, email: form.email, password: form.password })
      }
      await login(form.email, form.password)
      navigate(location.state?.from || '/admin', { replace: true })
    } catch (err) {
      setError(errorMessage(err))
      // Someone else finished setup first – fall back to the normal login form
      if (err.response?.status === 403) setNeedsSetup(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container section auth-wrap">
      <form className="card form auth-card" onSubmit={submit}>
        {needsSetup ? (
          <>
            <h1 className="h2">Create the broker account</h1>
            <p className="muted small">
              First-time setup: no admin account exists yet. The account you create here manages all listings and
              inquiries. This form disappears once it is created.
            </p>
            <label>
              Your name
              <input name="name" autoComplete="name" value={form.name} onChange={update} required minLength={2} />
            </label>
          </>
        ) : (
          <>
            <h1 className="h2">Broker / Admin Login</h1>
            <p className="muted small">Sign in to manage listings and customer inquiries.</p>
          </>
        )}
        <label>
          Email
          <input type="email" name="email" autoComplete="username" value={form.email} onChange={update} required />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            autoComplete={needsSetup ? 'new-password' : 'current-password'}
            value={form.password}
            onChange={update}
            required
            minLength={needsSetup ? 8 : undefined}
          />
        </label>
        {needsSetup && (
          <label>
            Confirm password
            <input type="password" name="confirm" autoComplete="new-password" value={form.confirm} onChange={update} required />
          </label>
        )}
        {error && <p className="alert alert-error">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Please wait…' : needsSetup ? 'Create account' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
