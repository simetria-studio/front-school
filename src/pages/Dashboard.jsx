import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { isAluno } from '../auth/userProfile'
import AvatarViewer3D from '../components/AvatarViewer3D'
import GameSchoolHeader from '../components/GameSchoolHeader'
import RewardCollectionModal from '../components/RewardCollectionModal'
import { useAuth } from '../hooks/useAuth'
import { usePendingRewardsQuery } from '../hooks/usePendingRewardsQuery'
import { aggregateRewardCollection } from '../lib/notificationRewards'
import { ACTION_EVERY_MS } from '../lib/characters3d'
import { formatNumberPt, getGameStats } from '../lib/gameStats'
import './Dashboard.css'

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

function HomeFab({ to, label, icon, variant, className }) {
  return (
    <Link
      to={to}
      className={`gs-home-fab gs-home-fab--${variant} ${className}`.trim()}
      aria-label={label}
    >
      {icon}
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const notifQuery = usePendingRewardsQuery(user)
  const [mood, setMood] = useState('idle')
  const [playToken, setPlayToken] = useState(0)
  const [actionIndex, setActionIndex] = useState(1)

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

  useEffect(() => {
    const id = window.setInterval(() => {
      setPlayToken((n) => n + 1)
      setMood('dancing')
    }, ACTION_EVERY_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="gs-home">
      <GameSchoolHeader />

      <section className="gs-home-body" aria-label="Progresso">
        <h1 className="gs-home-greet gs-home-animate">
          <span className="gs-home-greet-ola">OLÁ, </span>
          <span className="gs-home-greet-name">{greetName}</span>
        </h1>

        <div className="gs-home-hero">
          <div className="gs-home-char-stage">
            <AvatarViewer3D
              characterId="modelo4"
              mood={mood}
              playToken={playToken}
              actionIndex={actionIndex}
              fill
              framed={false}
              enableTouch={false}
              preloadAction
              onActionFinished={() => {
                setMood('idle')
                setActionIndex((i) => i + 1)
              }}
            />
            {aluno ? (
              <HomeFab
                to="/inventario"
                label="Inventário"
                variant="inventario"
                className="gs-home-fab--tl"
                icon={<InventarioIcon />}
              />
            ) : null}
            {aluno ? (
              <HomeFab
                to="/figurinhas"
                label="Álbum"
                variant="album"
                className="gs-home-fab--bl"
                icon={<AlbumIcon />}
              />
            ) : null}
            <HomeFab
              to="/quizzes"
              label="Quizzes"
              variant="quiz"
              className="gs-home-fab--tr"
              icon={
                <span className="gs-home-fab-quiz">
                  QUIZ
                </span>
              }
            />
            <HomeFab
              to="/roletas"
              label="Roletas"
              variant="roleta"
              className="gs-home-fab--br"
              icon={<RoletaWheelIcon />}
            />
          </div>
          <div className="gs-home-level-chip">
            <div className="gs-home-level">LEVEL {level}</div>
            <div
              className="gs-home-xpbar"
              role="progressbar"
              aria-valuenow={xpPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${formatNumberPt(xpCurrent)} de ${formatNumberPt(xpNext)} XP`}
            >
              <div
                className="gs-home-xpbar-fill"
                style={{ width: `${xpPct}%` }}
              />
              <div className="gs-home-xpnums">
                {formatNumberPt(xpCurrent)} / {formatNumberPt(xpNext)} XP
              </div>
            </div>
          </div>
        </div>
      </section>

      <RewardCollectionModal
        open={showRewardModal}
        payload={rewardPayload}
        onDismiss={() => {}}
      />
    </div>
  )
}
