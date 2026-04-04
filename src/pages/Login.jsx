import { BrowserMultiFormatReader } from '@zxing/browser'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoImg from '../assets/logo.png'
import { ApiError } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { parseQrLoginToken } from '../lib/qrToken'

export default function Login() {
  const videoRef = useRef(null)
  const navigate = useNavigate()
  const { loginQr } = useAuth()
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(true)
  const handledRef = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !scanning) return undefined

    const reader = new BrowserMultiFormatReader()
    let controls

    reader
      .decodeFromVideoDevice(undefined, video, (result) => {
        if (!result || handledRef.current) return
        const text = result.getText()
        if (!text?.trim()) return
        const token = parseQrLoginToken(text)
        if (!token) {
          setError('QR inválido: não foi possível ler o token.')
          return
        }
        handledRef.current = true
        setScanning(false)
        setError('')
        loginQr(token)
          .then(() => navigate('/', { replace: true }))
          .catch((err) => {
            handledRef.current = false
            setScanning(true)
            const msg =
              err instanceof ApiError
                ? err.message
                : err?.message || 'Falha no login'
            setError(msg)
          })
      })
      .then((c) => {
        controls = c
      })
      .catch(() => {
        setError(
          'Não foi possível abrir a câmara. Use HTTPS ou localhost e permita o acesso.',
        )
      })

    return () => {
      if (controls && typeof controls.stop === 'function') controls.stop()
    }
  }, [scanning, loginQr, navigate])

  return (
    <div className="gs-public gs-public--scan">
      <div className="gs-public-inner">
        <img
          className="gs-login-logo"
          src={logoImg}
          alt="Game School"
          width={280}
          height={80}
          decoding="async"
        />
        <p className="gs-scan-instruction">
          Aponte o QR Code do crachá para a câmara para iniciar sessão.
        </p>

        <div className="gs-scanner-frame">
          <video ref={videoRef} className="gs-scanner-video" muted playsInline />
          <div className="gs-scanner-overlay" aria-hidden>
            <span className="gs-scanner-line" />
          </div>
        </div>

        {error ? <p className="gs-alert gs-alert--error">{error}</p> : null}
      </div>
    </div>
  )
}

/*
 * ─── MODO TESTE: login por hash / URL (restaurar formulário se precisares) ───
 * Usa parseQrLoginToken de ../lib/qrToken para o texto colado.
 */
