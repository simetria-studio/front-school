import { Link } from 'react-router-dom'
import logo3 from '../assets/logo3.png'
import { iconCoin, iconXp } from '../assets/imgs'
import { useAuth } from '../hooks/useAuth'
import { formatNumberPt, getGameStats } from '../lib/gameStats'
import './GameSchoolHeader.css'

export default function GameSchoolHeader() {
  const { user } = useAuth()
  const { coins, xp } = getGameStats(user)

  return (
    <header className="gs-home-topbar">
      <div className="gs-home-stat gs-home-stat--left">
        <img src={iconCoin} alt="" width={32} height={32} />
        <span className="gs-home-stat-val">{formatNumberPt(coins)}</span>
      </div>
      <Link to="/" className="gs-home-logo-link" aria-label="Início">
        <img className="gs-home-logo-img" src={logo3} alt="Game School" />
      </Link>
      <div className="gs-home-stat gs-home-stat--right">
        <span className="gs-home-stat-val gs-home-stat-val--xp">
          {formatNumberPt(xp)}
        </span>
        <img src={iconXp} alt="" width={32} height={32} />
        <Link to="/conta" className="gs-home-menu-btn" aria-label="Conta e menu">
          ☰
        </Link>
      </div>
    </header>
  )
}
