import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../hooks/useAuth'

/** Aceita a hash sozinha ou URL completa tipo .../login/qr/{hash} */
function parseQrToken(input) {
  const trimmed = input.trim()
  if (!trimmed) return ''
  const m = trimmed.match(/\/login\/qr\/([^/?#]+)/i)
  if (m) return m[1]
  return trimmed
}

export default function Login() {
  const navigate = useNavigate()
  const { loginQr } = useAuth()
  const [hash, setHash] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const token = parseQrToken(hash)
    if (!token) {
      setError('Cole a hash ou o URL do QR.')
      return
    }
    setLoading(true)
    try {
      await loginQr(token)
      navigate('/', { replace: true })
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : err?.message || 'Falha no login'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gs-public">
      <div className="gs-public-inner">
        <div className="gs-brand">
          <span className="gs-brand-mark" aria-hidden />
          <span className="gs-brand-text">GAME SCHOOL</span>
        </div>
        <p className="gs-tagline">
          <strong>Modo teste:</strong> cole a hash do QR ou o URL completo
          (ex.: <code className="gs-code-inline">…/login/qr/…</code>).
        </p>

        <form className="gs-form" onSubmit={handleSubmit}>
          {error ? <p className="gs-alert gs-alert--error">{error}</p> : null}
          <label className="gs-label">
            Hash / URL do QR
            <textarea
              className="gs-input gs-textarea"
              name="qr_hash"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              placeholder="8j2myG9H… ou http://localhost:8000/login/qr/8j2myG9H…"
              rows={3}
              autoComplete="off"
            />
          </label>
          <button
            type="submit"
            className="gs-btn gs-btn--primary gs-btn--block"
            disabled={loading}
          >
            {loading ? 'A entrar…' : 'Entrar com hash'}
          </button>
        </form>

        <div className="gs-divider">ou</div>

        <Link to="/qr" className="gs-btn gs-btn--secondary gs-btn--block">
          Escanear QR Code com a câmara
        </Link>
      </div>
    </div>
  )
}
