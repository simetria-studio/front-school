import { Link } from 'react-router-dom'
import logo3 from '../assets/logo3.png'
import { iconCoin, iconXp } from '../assets/imgs'
import { useAuth } from '../hooks/useAuth'
import { formatNumberPt, getGameStats } from '../lib/gameStats'
import './GameSchoolHeader.css'

function pickAvatar(user) {
  if (!user || typeof user !== 'object') return null
  const sources = [user, user.aluno, user.profile, user.student].filter(
    (s) => s && typeof s === 'object',
  )
  const keys = ['avatar_url', 'avatar', 'foto', 'photo', 'imagem', 'image']
  for (const src of sources) {
    for (const k of keys) {
      const v = src[k]
      if (v && typeof v === 'string') return v
    }
  }
  return null
}

export default function GameSchoolHeader() {
  const { user } = useAuth()
  const { coins, xp } = getGameStats(user)
  const avatarSrc = pickAvatar(user) || logo3

  return (
    <header className="gs-home-topbar">
      <div className="gs-home-stat gs-home-stat--left">
        <span className="gs-home-stat-pill gs-home-stat-pill--coin">
          <img src={iconCoin} alt="" width={32} height={32} />
          <span className="gs-home-stat-val">{formatNumberPt(coins)}</span>
        </span>
      </div>
      <Link to="/" className="gs-home-logo-link" aria-label="Início">
        <span className="gs-home-avatar-ring">
          <img className="gs-home-logo-img" src={avatarSrc} alt="" />
        </span>
      </Link>
      <div className="gs-home-stat gs-home-stat--right">
        <span className="gs-home-stat-pill gs-home-stat-pill--xp">
          <span className="gs-home-stat-val gs-home-stat-val--xp">
            {formatNumberPt(xp)}
          </span>
          <img src={iconXp} alt="" width={32} height={32} />
        </span>
        <Link to="/conta" className="gs-home-menu-btn" aria-label="Conta e menu">
          ☰
        </Link>
      </div>
    </header>
  )
}
