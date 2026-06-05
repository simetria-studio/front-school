import { useMemo } from 'react'
import { Link } from 'react-router-dom'
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
    <svg viewBox="0 0 36 36" aria-hidden className="gs-home-quiz-cta-icon-svg">
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

        <Link to="/quizzes" className="gs-home-quiz-cta gs-home-animate gs-home-animate--3">
          <span className="gs-home-quiz-cta-icon">
            <QuizBubbleIcon />
          </span>
          <span className="gs-home-quiz-cta-label">QUIZZES</span>
          <span className="gs-home-quiz-cta-chevron" aria-hidden>
            ›
          </span>
        </Link>
      </section>

      <RewardCollectionModal
        open={showRewardModal}
        payload={rewardPayload}
        onDismiss={() => {}}
      />
    </div>
  )
}
