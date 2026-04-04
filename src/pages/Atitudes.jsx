import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { iconCoin, iconXp } from '../assets/imgs'
import { fetchAtitudes } from '../api/endpoints'
import GameSchoolHeader from '../components/GameSchoolHeader'
import PaginationBar from '../components/PaginationBar'
import {
  formatDelta,
  normalizeAtitude,
  signedStatForAtitude,
} from '../lib/atitudeDisplay'
import { unwrapList } from '../lib/listUtils'
import './Atitudes.css'

function AtitudeRow({ item }) {
  const { title, subtitle, coins, xp, isNegative } = normalizeAtitude(item)
  const coinsUi = signedStatForAtitude(coins, isNegative)
  const xpUi = signedStatForAtitude(xp, isNegative)
  const showCoins = coinsUi != null && !Number.isNaN(coinsUi) && coinsUi !== 0
  const showXp = xpUi != null && !Number.isNaN(xpUi) && xpUi !== 0

  return (
    <article
      className={`gs-atitudes-row${isNegative ? ' is-neg' : ''}`}
    >
      <div className="gs-atitudes-row-text">
        <strong className="gs-atitudes-row-title">{title}</strong>
        {subtitle ? (
          <span className="gs-atitudes-row-sub">{subtitle}</span>
        ) : null}
      </div>
      {(showCoins || showXp) && (
        <div className="gs-atitudes-row-values">
          {showCoins ? (
            <span className="gs-atitudes-val">
              {formatDelta(coinsUi)}
              <img src={iconCoin} alt="" />
            </span>
          ) : null}
          {showXp ? (
            <span className="gs-atitudes-val">
              {formatDelta(xpUi)}
              <img src={iconXp} alt="" />
            </span>
          ) : null}
        </div>
      )}
    </article>
  )
}

export default function Atitudes() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['atitudes', page],
    queryFn: async () => {
      const raw = await fetchAtitudes({ page, per_page: 20 })
      return unwrapList(raw)
    },
  })

  const rows = Array.isArray(data?.data) ? data.data : []
  const meta = data?.meta && typeof data.meta === 'object' ? data.meta : {}

  return (
    <div className="gs-atitudes-page">
      <GameSchoolHeader />

      <div className="gs-atitudes-backdrop">
        <div className="gs-atitudes-modal">
          <div className="gs-atitudes-modal-head">
            <Link to="/" className="gs-atitudes-back" aria-label="Voltar ao início">
              ←
            </Link>
            <h2>ATITUDES</h2>
          </div>
          <div className="gs-atitudes-scroll">
            {isLoading ? (
              <p className="gs-atitudes-loading">A carregar…</p>
            ) : rows.length === 0 ? (
              <p className="gs-atitudes-empty">
                Ainda não há atitudes para mostrar.
              </p>
            ) : (
              rows.map((a) => <AtitudeRow key={a.id ?? JSON.stringify(a)} item={a} />)
            )}
          </div>
        </div>

        {!isLoading && meta.last_page > 1 ? (
          <div className="gs-atitudes-pager">
            <PaginationBar
              meta={meta}
              loading={isFetching}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
