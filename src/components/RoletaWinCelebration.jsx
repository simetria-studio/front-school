import { iconCoin, iconXp } from '../assets/imgs'
import { formatNumberPt } from '../lib/gameStats'
import { inventarioTipoLabel } from '../lib/inventarioDisplay'
import { getRevealPrizeMeta } from '../lib/roletaDisplay'
import './RoletaWinCelebration.css'

const CONFETTI_COUNT = 28

function LootIcon({ item }) {
  if (item.imageUrl) {
    return (
      <img
        src={item.imageUrl}
        alt=""
        className="gs-roleta-win-loot-img"
      />
    )
  }

  return (
    <span className="gs-roleta-win-loot-emoji" aria-hidden>
      {item.emoji || '🎁'}
    </span>
  )
}

function LootMeta({ item }) {
  if (item.tipoKey === 'coins' && item.coins > 0) {
    return (
      <span className="gs-roleta-win-loot-meta">
        +{formatNumberPt(item.coins)}
        <img src={iconCoin} alt="" />
      </span>
    )
  }

  if (item.tipoKey === 'xp' && item.xp > 0) {
    return (
      <span className="gs-roleta-win-loot-meta gs-roleta-win-loot-meta--xp">
        +{formatNumberPt(item.xp)}
        <img src={iconXp} alt="" />
      </span>
    )
  }

  if (item.coins > 0) {
    return (
      <span className="gs-roleta-win-loot-meta">
        +{formatNumberPt(item.coins)}
        <img src={iconCoin} alt="" />
      </span>
    )
  }

  if (item.xp > 0) {
    return (
      <span className="gs-roleta-win-loot-meta gs-roleta-win-loot-meta--xp">
        +{formatNumberPt(item.xp)}
        <img src={iconXp} alt="" />
      </span>
    )
  }

  return null
}

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
  const reveal = getRevealPrizeMeta(segment, result)
  const loot = result.premiosNormalized ?? []
  const showRevealContents = Boolean(reveal)
  const showTopRewards =
    !showRevealContents && (result.coins > 0 || result.xp > 0)
  const showBonusRewards =
    showRevealContents && (result.coins > 0 || result.xp > 0)
  const displayTitle =
    result.isRandomItem && result.wonItemTitle && !showRevealContents
      ? result.wonItemTitle
      : prizeTitle

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

        {showRevealContents ? (
          <div
            className={`gs-roleta-win-chest${
              reveal.kind === 'item_aleatorio'
                ? ' gs-roleta-win-chest--random'
                : ''
            }`}
          >
            <div className="gs-roleta-win-chest-head">
              {segment?.imageUrl ? (
                <img
                  src={segment.imageUrl}
                  alt=""
                  className="gs-roleta-win-chest-icon"
                />
              ) : (
                <span className="gs-roleta-win-chest-icon-emoji" aria-hidden>
                  {reveal.iconEmoji || emoji || '🎁'}
                </span>
              )}
              <span className="gs-roleta-win-chest-name">{reveal.title}</span>
            </div>

            <p className="gs-roleta-win-chest-sub">{reveal.subtitle}</p>

            <ul className="gs-roleta-win-loot">
              {loot.map((item, index) => (
                <li
                  key={`${item.titulo}-${index}`}
                  className="gs-roleta-win-loot-item"
                  style={{ animationDelay: `${0.15 + index * 0.08}s` }}
                >
                  <LootIcon item={item} />
                  <div className="gs-roleta-win-loot-info">
                    <span className="gs-roleta-win-loot-name">
                      {item.titulo}
                      {item.quantidade > 1 ? ` ×${item.quantidade}` : ''}
                    </span>
                    {item.tipo && item.tipoKey !== 'coins' && item.tipoKey !== 'xp' ? (
                      <span className="gs-roleta-win-loot-type">
                        {inventarioTipoLabel(item.tipo)}
                        {item.raridade ? ` · ${item.raridade}` : ''}
                      </span>
                    ) : null}
                  </div>
                  <LootMeta item={item} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
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
            <span className="gs-roleta-win-prize-name">{displayTitle}</span>
          </div>
        )}

        {showTopRewards || showBonusRewards ? (
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
        ) : null}

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
