import { BrowserMultiFormatReader } from '@zxing/browser'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoImg from '../assets/logo.png'
import { ApiError } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { parseQrLoginToken } from '../lib/qrToken'

const CAMERA_PREF_KEY = 'gs_qr_camera_facing'

function readCameraFacing() {
  try {
    const raw = localStorage.getItem(CAMERA_PREF_KEY)
    if (raw === 'user' || raw === 'environment') return raw
  } catch {
    /* ignore */
  }
  return 'user'
}

function saveCameraFacing(facing) {
  try {
    localStorage.setItem(CAMERA_PREF_KEY, facing)
  } catch {
    /* ignore */
  }
}

function isFrontLabel(label = '') {
  return /front|frontal|user|facing|facetime|webcam/i.test(label)
}

function isBackLabel(label = '') {
  return /back|rear|traseir|environment|world/i.test(label)
}

async function pickDeviceId(facing) {
  if (!navigator.mediaDevices?.enumerateDevices) return undefined
  const devices = await navigator.mediaDevices.enumerateDevices()
  const cameras = devices.filter((d) => d.kind === 'videoinput' && d.deviceId)
  if (!cameras.length) return undefined

  if (facing === 'user') {
    return (
      cameras.find((d) => isFrontLabel(d.label))?.deviceId ||
      cameras.find((d) => !isBackLabel(d.label))?.deviceId ||
      cameras[0]?.deviceId
    )
  }

  return (
    cameras.find((d) => isBackLabel(d.label))?.deviceId ||
    cameras.find((d) => !isFrontLabel(d.label))?.deviceId ||
    cameras[cameras.length - 1]?.deviceId
  )
}

export default function Login() {
  const videoRef = useRef(null)
  const navigate = useNavigate()
  const { loginQr } = useAuth()
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(true)
  const [facing, setFacing] = useState(readCameraFacing)
  const handledRef = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !scanning) return undefined

    const reader = new BrowserMultiFormatReader()
    let controls
    let cancelled = false

    ;(async () => {
      try {
        // Pedir permissão primeiro para os labels das câmaras aparecerem.
        const warm = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing } },
          audio: false,
        })
        warm.getTracks().forEach((t) => t.stop())

        const deviceId = await pickDeviceId(facing)
        const constraints = deviceId
          ? { video: { deviceId: { exact: deviceId } } }
          : { video: { facingMode: { ideal: facing } } }

        if (cancelled) return

        controls = await reader.decodeFromConstraints(
          constraints,
          video,
          (result) => {
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
          },
        )
      } catch {
        if (cancelled) return
        setError(
          'Não foi possível abrir a câmara. Use HTTPS ou localhost e permita o acesso.',
        )
      }
    })()

    return () => {
      cancelled = true
      if (controls && typeof controls.stop === 'function') controls.stop()
    }
  }, [scanning, facing, loginQr, navigate])

  function toggleCamera() {
    const next = facing === 'user' ? 'environment' : 'user'
    saveCameraFacing(next)
    handledRef.current = false
    setError('')
    setFacing(next)
    setScanning(true)
  }

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
          <video
            ref={videoRef}
            className={`gs-scanner-video${facing === 'user' ? ' is-front' : ''}`}
            muted
            playsInline
          />
          <div className="gs-scanner-overlay" aria-hidden>
            <span className="gs-scanner-line" />
          </div>
        </div>

        <button
          type="button"
          className="gs-btn gs-btn--secondary gs-btn--block gs-scanner-switch"
          onClick={toggleCamera}
        >
          {facing === 'user' ? 'Usar câmara traseira' : 'Usar câmara frontal'}
        </button>

        {error ? <p className="gs-alert gs-alert--error">{error}</p> : null}
      </div>
    </div>
  )
}

/*
 * ─── MODO TESTE: login por hash / URL (restaurar formulário se precisares) ───
 * Usa parseQrLoginToken de ../lib/qrToken para o texto colado.
 */
