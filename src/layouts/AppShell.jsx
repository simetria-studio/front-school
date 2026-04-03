import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  navAtitudes,
  navInicio,
  navLoja,
  navMissoes,
  navRanking,
} from '../assets/imgs'
import { useLojaBadgeCount } from '../hooks/useLojaBadgeCount'
import { useMissoesBadgeCount } from '../hooks/useMissoesBadgeCount'
import './AppShell.css'

const tabs = [
  {
    to: '/',
    end: true,
    label: 'Início',
    img: navInicio,
    color: '#546e7a',
    badge: null,
  },
  {
    to: '/atitudes',
    label: 'Atitudes',
    img: navAtitudes,
    color: '#e53935',
    badge: null,
  },
  {
    to: '/ranking',
    label: 'Ranking',
    img: navRanking,
    color: '#1565c0',
    badge: null,
  },
  {
    to: '/missoes',
    label: 'Missões',
    img: navMissoes,
    color: '#f57c00',
    badge: 'missoes',
  },
  {
    to: '/loja',
    label: 'Loja',
    img: navLoja,
    color: '#43a047',
    badge: 'loja',
  },
]

export default function AppShell() {
  const { pathname } = useLocation()
  const { data: missoesBadge = 0 } = useMissoesBadgeCount()
  const { data: lojaBadge = 0 } = useLojaBadgeCount()

  const isFlush =
    pathname === '/' ||
    pathname === '' ||
    pathname === '/atitudes' ||
    pathname === '/ranking' ||
    pathname === '/missoes' ||
    pathname === '/loja'

  return (
    <div className="gs-shell">
      <main
        className={`gs-shell-main${isFlush ? ' gs-shell-main--home' : ''}`}
      >
        <Outlet />
      </main>
      <nav className="gs-dock" aria-label="Principal">
        {tabs.map(({ to, end, label, img, color, badge }) => {
          const count =
            badge === 'missoes'
              ? missoesBadge
              : badge === 'loja'
                ? lojaBadge
                : 0
          const showBadge = typeof count === 'number' && count > 0

          return (
            <NavLink
              key={to + String(end)}
              to={to}
              end={end}
              className={({ isActive }) =>
                `gs-dock-item${isActive ? ' gs-dock-item--active' : ''}`
              }
              style={{ '--dock-color': color }}
            >
              <span className="gs-dock-circle-wrap">
                <span className="gs-dock-circle" aria-hidden>
                  <img src={img} alt="" width={36} height={36} />
                </span>
                {showBadge ? (
                  <span className="gs-dock-badge" aria-label={`Novas: ${count}`}>
                    {count > 9 ? '9+' : count}
                  </span>
                ) : null}
              </span>
              <span className="gs-dock-label">{label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
