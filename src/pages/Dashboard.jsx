import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { isAluno } from '../auth/userProfile'
import GameSchoolHeader from '../components/GameSchoolHeader'
import RewardCollectionModal from '../components/RewardCollectionModal'
import { useAuth } from '../hooks/useAuth'
import { usePendingRewardsQuery } from '../hooks/usePendingRewardsQuery'
import { aggregateRewardCollection } from '../lib/notificationRewards'
import { formatNumberPt, getGameStats } from '../lib/gameStats'
import './Dashboard.css'

function StarShape() {
  const points = '100,12 124,78 194,78 138,122 158,192 100,152 42,192 62,122 6,78 76,78'
  return (
    <svg viewBox="0 0 200 200" aria-hidden className="gs-home-star-svg">
      <defs>
        <linearGradient id="gsStarFill" x1="18%" y1="0%" x2="82%" y2="100%">
          <stop offset="0%" stopColor="#d4f1ff" />
          <stop offset="32%" stopColor="#7ec8ff" />
          <stop offset="68%" stopColor="#2196f3" />
          <stop offset="100%" stopColor="#0d47a1" />
        </linearGradient>
        <linearGradient id="gsStarInner" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#e3f2fd" />
          <stop offset="100%" stopColor="#1565c0" />
        </linearGradient>
        <linearGradient id="gsStarShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.72)" />
          <stop offset="38%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <radialGradient id="gsStarSpecular" cx="35%" cy="28%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.75)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id="gsStarGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0d47a1" floodOpacity="0.55" />
          <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#42a5f5" floodOpacity="0.35" />
        </filter>
      </defs>

      <polygon
        className="gs-home-star-depth"
        points={points}
        fill="#021a33"
        transform="translate(3, 10)"
        opacity="0.65"
      />
      <polygon
        points={points}
        fill="#0a3d7a"
        transform="translate(1, 5)"
        opacity="0.85"
      />
      <polygon
        points={points}
        fill="url(#gsStarFill)"
        stroke="#fff"
        strokeWidth="8"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#gsStarGlow)"
      />
      <g transform="translate(100 100) scale(0.74) translate(-100 -100)">
        <polygon
          points={points}
          fill="url(#gsStarInner)"
          opacity="0.55"
        />
      </g>
      <polygon
        points={points}
        fill="url(#gsStarShine)"
        stroke="none"
        opacity="0.8"
      />
      <polygon
        points={points}
        fill="url(#gsStarSpecular)"
        stroke="none"
        opacity="0.55"
      />
      <polygon
        points={points}
        fill="none"
        stroke="#0a3d7a"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <polygon
        points={points}
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        transform="translate(100 100) scale(0.88) translate(-100 -100)"
      />
      <circle cx="100" cy="16" r="4" fill="#fff" opacity="0.95" />
      <circle cx="100" cy="16" r="7" fill="rgba(255,255,255,0.25)" />
    </svg>
  )
}

function StarMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="gs-home-star-mini">
      <defs>
        <linearGradient id="gsStarMiniFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#b3e5fc" />
        </linearGradient>
      </defs>
      <polygon
        points="12,2 15,9 22,9 16.5,13.5 18.5,21 12,16.5 5.5,21 7.5,13.5 2,9 9,9"
        fill="url(#gsStarMiniFill)"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function QuizBubbleIcon() {
  return (
    <svg viewBox="0 0 36 36" aria-hidden className="gs-home-action-icon-svg">
      <circle cx="18" cy="18" r="17" fill="rgba(255,255,255,0.22)" />
      <path
        d="M10 9h16a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-6.5l-5 4.2V24H10a3 3 0 0 1-3-3V12a3 3 0 0 1 3-3z"
        fill="#fff"
      />
      <text
        x="18"
        y="21.5"
        textAnchor="middle"
        fontSize="13"
        fontWeight="800"
        fill="#7b1fa2"
        fontFamily="var(--gs-display), sans-serif"
      >
        ?
      </text>
    </svg>
  )
}

function RoletaWheelIcon() {
  return (
    <svg viewBox="0 0 36 36" aria-hidden className="gs-home-action-icon-svg">
      <circle cx="18" cy="18" r="16" fill="rgba(255,255,255,0.18)" />
      <circle cx="18" cy="18" r="13" fill="#fff" />
      <path
        d="M18 18 L18 5 A13 13 0 0 1 29.3 23 Z"
        fill="#ff8f00"
      />
      <path
        d="M18 18 L29.3 23 A13 13 0 0 1 6.7 23 Z"
        fill="#e53935"
      />
      <path
        d="M18 18 L6.7 23 A13 13 0 0 1 18 5 Z"
        fill="#fdd835"
      />
      <circle cx="18" cy="18" r="4.5" fill="#bf360c" stroke="#fff" strokeWidth="1.5" />
      <circle cx="18" cy="18" r="2" fill="#ffd54f" />
    </svg>
  )
}

function AlbumIcon() {
  return (
    <svg viewBox="0 0 36 36" aria-hidden className="gs-home-action-icon-svg">
      <circle cx="18" cy="18" r="17" fill="rgba(255,255,255,0.18)" />
      <rect x="9" y="8" width="18" height="20" rx="2.5" fill="#fff" />
      <rect x="11" y="10" width="14" height="16" rx="1.5" fill="#fff8e1" />
      <rect x="13" y="12" width="5" height="5" rx="1" fill="#ffb300" />
      <rect x="19.5" y="12" width="5" height="5" rx="1" fill="#ff8f00" opacity="0.55" />
      <rect x="13" y="18.5" width="5" height="5" rx="1" fill="#ff8f00" opacity="0.55" />
      <rect x="19.5" y="18.5" width="5" height="5" rx="1" fill="#ffb300" />
      <path
        d="M9 12h-1.5a1.5 1.5 0 0 0-1.5 1.5v11a1.5 1.5 0 0 0 1.5 1.5H9"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function InventarioIcon() {
  return (
    <svg viewBox="0 0 36 36" aria-hidden className="gs-home-action-icon-svg">
      <circle cx="18" cy="18" r="17" fill="rgba(255,255,255,0.18)" />
      <path
        d="M10 14h16l-1.2 14H11.2L10 14z"
        fill="#fff"
      />
      <path
        d="M13 14V11a5 5 0 0 1 10 0v3"
        fill="none"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect x="14" y="18" width="3" height="3" rx="0.6" fill="#00838f" />
      <rect x="19" y="18" width="3" height="3" rx="0.6" fill="#00838f" />
      <rect x="14" y="23" width="8" height="2.5" rx="0.6" fill="#00acc1" />
    </svg>
  )
}

function HomeActionLink({ to, label, icon, variant, animateClass }) {
  return (
    <Link
      to={to}
      className={`gs-home-action-cta gs-home-action-cta--${variant} gs-home-animate ${animateClass}`}
    >
      <span className="gs-home-action-cta-icon">{icon}</span>
      <span className="gs-home-action-cta-label">{label}</span>
      <span className="gs-home-action-cta-chevron" aria-hidden>
        ›
      </span>
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const notifQuery = usePendingRewardsQuery(user)

  const rawName =
    user?.name ||
    user?.nome ||
    user?.username ||
    user?.email ||
    'Aluno'
  const firstName = String(rawName).trim().split(/\s+/)[0] || 'Aluno'
  const greetName = firstName.toUpperCase()

  const { level, xpCurrent, xpNext } = getGameStats(user)
  const xpPct = Math.min(100, Math.round((xpCurrent / Math.max(xpNext, 1)) * 100))

  const rows = useMemo(
    () =>
      Array.isArray(notifQuery.data?.data) ? notifQuery.data.data : [],
    [notifQuery.data],
  )

  const rewardPayload = useMemo(
    () => aggregateRewardCollection(rows),
    [rows],
  )

  const showRewardModal =
    Boolean(user) &&
    notifQuery.isFetched &&
    rewardPayload.hasPending

  const aluno = isAluno(user)

  return (
    <div className="gs-home">
      <GameSchoolHeader />

      <section className="gs-home-body" aria-label="Progresso">
        <h1 className="gs-home-greet gs-home-animate">
          <span className="gs-home-greet-ola">OLÁ, </span>
          <span className="gs-home-greet-name">{greetName}</span>
        </h1>

        <div className="gs-home-hero gs-home-animate gs-home-animate--2">
          <div className="gs-home-star-wrap">
            <div className="gs-home-star-glow" aria-hidden />
            <StarShape />
            <div className="gs-home-star-inner">
              <StarMiniIcon />
              <div className="gs-home-level">LEVEL {level}</div>
              <div className="gs-home-xpnums">
                {formatNumberPt(xpCurrent)}/{formatNumberPt(xpNext)}
              </div>
              <div
                className="gs-home-xpbar"
                role="progressbar"
                aria-valuenow={xpPct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="gs-home-xpbar-fill"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <nav className="gs-home-actions gs-home-animate gs-home-animate--3" aria-label="Atalhos">
          <HomeActionLink
            to="/quizzes"
            label="QUIZZES"
            icon={<QuizBubbleIcon />}
            variant="quiz"
            animateClass=""
          />
          <div className="gs-home-actions-row">
            <HomeActionLink
              to="/roletas"
              label="ROLETAS"
              icon={<RoletaWheelIcon />}
              variant="roleta"
              animateClass="gs-home-animate--4"
            />
            {aluno ? (
              <HomeActionLink
                to="/inventario"
                label="INVENTÁRIO"
                icon={<InventarioIcon />}
                variant="inventario"
                animateClass="gs-home-animate--4"
              />
            ) : null}
          </div>
          {aluno ? (
            <HomeActionLink
              to="/figurinhas"
              label="ÁLBUM"
              icon={<AlbumIcon />}
              variant="album"
              animateClass="gs-home-animate--4"
            />
          ) : null}
        </nav>
      </section>

      <RewardCollectionModal
        open={showRewardModal}
        payload={rewardPayload}
        onDismiss={() => {}}
      />
    </div>
  )
}
