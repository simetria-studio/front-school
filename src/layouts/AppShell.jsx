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
    color: '#42a5f5',
    badge: null,
  },
  {
    to: '/atitudes',
    label: 'Atitudes',
    img: navAtitudes,
    color: '#ff5252',
    badge: null,
  },
  {
    to: '/ranking',
    label: 'Ranking',
    img: navRanking,
    color: '#448aff',
    badge: null,
  },
  {
    to: '/missoes',
    label: 'Missões',
    img: navMissoes,
    color: '#ff9100',
    badge: 'missoes',
  },
  {
    to: '/loja',
    label: 'Loja',
    img: navLoja,
    color: '#69f0ae',
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
    pathname === '/loja' ||
    pathname.startsWith('/quizzes') ||
    pathname.startsWith('/roletas') ||
    pathname === '/inventario' ||
    pathname === '/presentes'

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
              style={{ '--dock-color': color, '--dock-glow': color }}
            >
              <span className="gs-dock-circle-wrap">
                <span className="gs-dock-neon" aria-hidden />
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
