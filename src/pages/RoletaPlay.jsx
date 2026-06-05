import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import {
  fetchRoleta,
  fetchRoletaStatus,
  spinRoleta,
} from '../api/endpoints'
import { useAuth } from '../hooks/useAuth'
import GameSchoolHeader from '../components/GameSchoolHeader'
import RoletaWheel from '../components/RoletaWheel'
import RoletaWinCelebration from '../components/RoletaWinCelebration'
import { formatNumberPt } from '../lib/gameStats'
import {
  findSegmentIndex,
  normalizeGiroResult,
  normalizeRoletaDetail,
  normalizeRoletaStatus,
} from '../lib/roletaDisplay'
import './RoletaPlay.css'

export default function RoletaPlay() {
  const { id } = useParams()
  const { refreshMe } = useAuth()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [spinning, setSpinning] = useState(false)
  const [targetIndex, setTargetIndex] = useState(null)
  const [result, setResult] = useState(null)
  const [showWin, setShowWin] = useState(false)
  const resultRef = useRef(null)

  const roletaQuery = useQuery({
    queryKey: ['roleta', id],
    queryFn: () => fetchRoleta(id),
    enabled: Boolean(id),
  })

  const statusQuery = useQuery({
    queryKey: ['roleta-status', id],
    queryFn: () => fetchRoletaStatus(id),
    enabled: Boolean(id),
  })

  const roleta = useMemo(
    () => normalizeRoletaDetail(roletaQuery.data),
    [roletaQuery.data],
  )

  const status = useMemo(
    () => normalizeRoletaStatus(statusQuery.data),
    [statusQuery.data],
  )

  const paidCost = status.paidCost ?? roleta.paidCost

  const spinMut = useMutation({
    mutationFn: (tipo) => spinRoleta(id, { tipo }),
    onSuccess: async (body) => {
      const idx = findSegmentIndex(roleta.segments, body)
      const parsed = normalizeGiroResult(body)
      resultRef.current = parsed
      setTargetIndex(idx)
      setSpinning(true)
      setResult(parsed)
      queryClient.invalidateQueries({ queryKey: ['roleta-status', id] })
      queryClient.invalidateQueries({ queryKey: ['roleta-giros', id] })
      queryClient.invalidateQueries({ queryKey: ['inventario'] })
      try {
        await refreshMe()
      } catch {
        /* header stats refresh optional */
      }
    },
  })

  function spin(tipo) {
    if (spinning || spinMut.isPending) return
    setError('')
    setResult(null)
    setShowWin(false)
    resultRef.current = null
    spinMut.mutate(tipo, {
      onError: (err) => {
        setError(err instanceof ApiError ? err.message : String(err?.message))
      },
    })
  }

  function handleSpinEnd() {
    setSpinning(false)
    if (resultRef.current) setShowWin(true)
  }

  const wonSegment =
    targetIndex != null ? roleta.segments[targetIndex] : null

  const busy = spinning || spinMut.isPending
  const title = roleta.title || 'Roleta'

  return (
    <div className="gs-roleta-play-page">
      <GameSchoolHeader />

      <div className="gs-roleta-play-body">
        <div className="gs-roleta-play-top">
          <Link to="/roletas" className="gs-roleta-play-back" aria-label="Voltar às roletas">
            ←
          </Link>
          <div className="gs-roleta-play-title-wrap">
            <h1 className="gs-roleta-play-title">{title.toUpperCase()}</h1>
            <p className="gs-roleta-play-subtitle">Gira e ganha prémios</p>
          </div>
        </div>

        <div className="gs-roleta-play-scroll">
          {roletaQuery.isLoading ? (
            <p className="gs-roleta-play-loading">A carregar roleta…</p>
          ) : roletaQuery.isError ? (
            <p className="gs-roleta-play-empty">
              Não foi possível carregar esta roleta.
            </p>
          ) : (
            <>
              {roleta.description ? (
                <p className="gs-roleta-play-desc">{roleta.description}</p>
              ) : null}

              <div className="gs-roleta-play-toolbar">
                {statusQuery.isLoading ? (
                  <span className="gs-roleta-play-badge gs-roleta-play-badge--loading">
                    A verificar…
                  </span>
                ) : status.freeSpinAvailable ? (
                  <span className="gs-roleta-play-badge gs-roleta-play-badge--ok">
                    ✓ Giro grátis
                  </span>
                ) : (
                  <span className="gs-roleta-play-badge gs-roleta-play-badge--muted">
                    Sem giro grátis
                  </span>
                )}

                <div className="gs-roleta-play-links">
                  <Link
                    to={`/roletas/${id}/giros`}
                    className="gs-roleta-play-link"
                  >
                    📜 Hist.
                  </Link>
                  <Link to="/inventario" className="gs-roleta-play-link">
                    🎒 Inv.
                  </Link>
                  <Link to="/presentes" className="gs-roleta-play-link">
                    🎁
                  </Link>
                </div>
              </div>

              <div
                className={`gs-roleta-play-wheel${showWin ? ' gs-roleta-play-wheel--won' : ''}`}
              >
                <RoletaWheel
                  segments={roleta.segments}
                  spinning={spinning}
                  targetIndex={targetIndex}
                  onSpinEnd={handleSpinEnd}
                />
              </div>

              {roleta.segments.length === 0 ? (
                <p className="gs-roleta-play-empty">
                  Esta roleta ainda não tem prémios configurados.
                </p>
              ) : (
                <ul
                  className="gs-roleta-play-premios"
                  aria-label="Prémios da roleta"
                >
                  {roleta.segments.map((seg, i) => (
                    <li
                      key={seg.id ?? `seg-${i}`}
                      className="gs-roleta-play-premio"
                      style={{ '--chip-color': seg.color }}
                    >
                      <span className="gs-roleta-play-premio-dot" aria-hidden />
                      {seg.emoji ? (
                        <span className="gs-roleta-play-premio-emoji" aria-hidden>
                          {seg.emoji}
                        </span>
                      ) : null}
                      {seg.shortLabel ?? seg.label}
                    </li>
                  ))}
                </ul>
              )}

              {error ? (
                <p className="gs-roleta-play-alert" role="alert">
                  {error}
                </p>
              ) : null}

              <RoletaWinCelebration
                open={showWin && Boolean(result)}
                result={result}
                segment={wonSegment}
                onClose={() => setShowWin(false)}
              />

              <div className="gs-roleta-play-actions">
                <button
                  type="button"
                  className="gs-roleta-play-spin gs-roleta-play-spin--free"
                  disabled={busy || !status.freeSpinAvailable}
                  onClick={() => spin('gratis')}
                >
                  {spinMut.isPending && !spinning ? 'A girar…' : 'Giro grátis'}
                  {!status.freeSpinAvailable && !statusQuery.isLoading ? (
                    <span className="gs-roleta-play-spin-sub">
                      Indisponível agora
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  className="gs-roleta-play-spin gs-roleta-play-spin--paid"
                  disabled={busy || status.canSpinPaid === false}
                  onClick={() => spin('pago')}
                >
                  Giro pago
                  {paidCost != null ? (
                    <span className="gs-roleta-play-spin-sub">
                      {formatNumberPt(paidCost)} moedas
                    </span>
                  ) : null}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
