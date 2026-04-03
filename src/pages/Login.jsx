import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <div className="gs-public">
      <div className="gs-public-inner">
        <div className="gs-brand">
          <span className="gs-brand-mark" aria-hidden />
          <span className="gs-brand-text">GAME SCHOOL</span>
        </div>
        <p className="gs-tagline">
          Inicia sessão ao escanear o QR Code com a câmara do teu dispositivo.
        </p>

        <Link to="/qr" className="gs-btn gs-btn--primary gs-btn--block">
          Escanear QR Code
        </Link>
      </div>
    </div>
  )
}

/*
 * ─── MODO TESTE: login por hash / URL (descomentar o bloco abaixo e substituir o componente acima) ───
 *
 * import { useState } from 'react'
 * import { Link, useNavigate } from 'react-router-dom'
 * import { ApiError } from '../api/client'
 * import { useAuth } from '../hooks/useAuth'
 *
 * function parseQrToken(input) {
 *   const trimmed = input.trim()
 *   if (!trimmed) return ''
 *   const m = trimmed.match(/\/login\/qr\/([^/?#]+)/i)
 *   if (m) return m[1]
 *   return trimmed
 * }
 *
 * export default function Login() {
 *   const navigate = useNavigate()
 *   const { loginQr } = useAuth()
 *   const [hash, setHash] = useState('')
 *   const [error, setError] = useState('')
 *   const [loading, setLoading] = useState(false)
 *
 *   async function handleSubmit(e) {
 *     e.preventDefault()
 *     setError('')
 *     const token = parseQrToken(hash)
 *     if (!token) {
 *       setError('Cole a hash ou o URL do QR.')
 *       return
 *     }
 *     setLoading(true)
 *     try {
 *       await loginQr(token)
 *       navigate('/', { replace: true })
 *     } catch (err) {
 *       const msg =
 *         err instanceof ApiError ? err.message : err?.message || 'Falha no login'
 *       setError(msg)
 *     } finally {
 *       setLoading(false)
 *     }
 *   }
 *
 *   return (
 *     <div className="gs-public">
 *       <div className="gs-public-inner">
 *         <div className="gs-brand">...</div>
 *         <p className="gs-tagline">
 *           <strong>Modo teste:</strong> cole a hash do QR ou o URL completo.
 *         </p>
 *         <form className="gs-form" onSubmit={handleSubmit}>...</form>
 *         <div className="gs-divider">ou</div>
 *         <Link to="/qr" className="gs-btn gs-btn--secondary gs-btn--block">
 *           Escanear QR Code com a câmara
 *         </Link>
 *       </div>
 *     </div>
 *   )
 * }
 */
