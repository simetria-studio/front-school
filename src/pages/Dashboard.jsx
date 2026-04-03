import { useMemo } from 'react'
import GameSchoolHeader from '../components/GameSchoolHeader'
import RewardCollectionModal from '../components/RewardCollectionModal'
import { useAuth } from '../hooks/useAuth'
import { usePendingRewardsQuery } from '../hooks/usePendingRewardsQuery'
import { aggregateRewardCollection } from '../lib/notificationRewards'
import { formatNumberPt, getGameStats } from '../lib/gameStats'
import './Dashboard.css'

function StarShape() {
  return (
    <svg viewBox="0 0 200 200" aria-hidden className="gs-home-star-svg">
      <defs>
        <linearGradient id="gsStarFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8ad4ff" />
          <stop offset="100%" stopColor="#5eb8f7" />
        </linearGradient>
      </defs>
      <polygon
        points="100,12 124,78 194,78 138,122 158,192 100,152 42,192 62,122 6,78 76,78"
        fill="url(#gsStarFill)"
        stroke="#1565c0"
        strokeWidth="5"
        strokeLinejoin="round"
      />
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
        <h1 className="gs-home-greet">
          <span className="gs-home-greet-ola">OLÁ, </span>
          <span className="gs-home-greet-name">{greetName}</span>
        </h1>

        <div className="gs-home-star-wrap">
          <StarShape />
          <div className="gs-home-star-inner">
            <div className="gs-home-level">LEVEL {level}</div>
            <div className="gs-home-xpnums">
              {formatNumberPt(xpCurrent)}/{formatNumberPt(xpNext)}
            </div>
            <div className="gs-home-xpbar" role="progressbar" aria-valuenow={xpPct} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="gs-home-xpbar-fill"
                style={{ width: `${xpPct}%` }}
              />
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
