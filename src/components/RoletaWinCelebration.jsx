import { iconCoin, iconXp } from '../assets/imgs'
import { formatNumberPt } from '../lib/gameStats'
import './RoletaWinCelebration.css'

const CONFETTI_COUNT = 28

export default function RoletaWinCelebration({
  open,
  result,
  segment,
  onClose,
}) {
  if (!open || !result) return null

  const prizeTitle =
    result.prizeTitle ??
    String(result.label).split(' · ')[0] ??
    'Prémio'
  const emoji = segment?.emoji ?? null
  const color = segment?.color ?? '#ffca28'

  return (
    <div
      className="gs-roleta-win-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gs-roleta-win-title"
    >
      <div className="gs-roleta-win-confetti" aria-hidden>
        {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
          <span
            key={i}
            className="gs-roleta-win-confetti-piece"
            style={{
              '--left': `${(i * 13.7) % 100}%`,
              '--delay': `${(i * 0.07) % 0.8}s`,
              '--dur': `${1.8 + (i % 5) * 0.25}s`,
              '--hue': `${(i * 47 + 20) % 360}`,
              '--drift': `${((i % 7) - 3) * 18}px`,
            }}
          />
        ))}
      </div>

      <div
        className="gs-roleta-win-card"
        style={{ '--win-color': color }}
      >
        <div className="gs-roleta-win-rays" aria-hidden />
        <div className="gs-roleta-win-stars" aria-hidden>
          <span>★</span>
          <span>★</span>
          <span>★</span>
        </div>

        <p className="gs-roleta-win-kicker">PARABÉNS!</p>
        <h2 id="gs-roleta-win-title" className="gs-roleta-win-title">
          Ganhou
        </h2>

        <div className="gs-roleta-win-prize">
          {segment?.imageUrl ? (
            <img
              src={segment.imageUrl}
              alt=""
              className="gs-roleta-win-prize-img"
            />
          ) : emoji ? (
            <span className="gs-roleta-win-prize-emoji" aria-hidden>
              {emoji}
            </span>
          ) : (
            <span className="gs-roleta-win-prize-star" aria-hidden>
              ★
            </span>
          )}
          <span className="gs-roleta-win-prize-name">{prizeTitle}</span>
        </div>

        {(result.coins > 0 || result.xp > 0) && (
          <div className="gs-roleta-win-rewards">
            {result.coins > 0 ? (
              <span className="gs-roleta-win-pill">
                +{formatNumberPt(result.coins)}
                <img src={iconCoin} alt="" />
              </span>
            ) : null}
            {result.xp > 0 ? (
              <span className="gs-roleta-win-pill gs-roleta-win-pill--xp">
                +{formatNumberPt(result.xp)}
                <img src={iconXp} alt="" />
              </span>
            ) : null}
          </div>
        )}

        <button
          type="button"
          className="gs-btn gs-btn--primary gs-btn--block gs-roleta-win-btn"
          onClick={onClose}
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
