import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { isMaster } from '../auth/userProfile'
import { iconCoin, iconXp } from '../assets/imgs'
import { fetchRanking } from '../api/endpoints'
import GameSchoolHeader from '../components/GameSchoolHeader'
import PaginationBar from '../components/PaginationBar'
import { useAuth } from '../hooks/useAuth'
import { getSelectedUnidadeId } from '../lib/authStorage'
import {
  formatRankingScore,
  normalizeRankingRow,
} from '../lib/rankingDisplay'
import { unwrapList } from '../lib/listUtils'
import './Ranking.css'

function RankingRow({ item, por, position }) {
  const { name, subtitle, score } = normalizeRankingRow(item, por)

  return (
    <article className="gs-ranking-row">
      <span className="gs-ranking-rank">{position}</span>
      <div className="gs-ranking-mid">
        <strong className="gs-ranking-name">{name}</strong>
        {subtitle ? (
          <span className="gs-ranking-sub">{subtitle}</span>
        ) : null}
      </div>
      <div className="gs-ranking-score">
        {formatRankingScore(score)}
        <img src={por === 'coins' ? iconCoin : iconXp} alt="" />
      </div>
    </article>
  )
}

export default function Ranking() {
  const { user } = useAuth()
  const master = isMaster(user)
  const [por, setPor] = useState('coins')
  const [page, setPage] = useState(1)
  const [unidadeId, setUnidadeId] = useState(() =>
    master ? getSelectedUnidadeId() || '' : '',
  )

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['ranking', por, master ? unidadeId : '_', page],
    queryFn: async () => {
      const params = { por, page, per_page: 30 }
      if (master && unidadeId) params.unidade_id = unidadeId
      const raw = await fetchRanking(params)
      return unwrapList(raw)
    },
  })

  const rows = Array.isArray(data?.data) ? data.data : []
  const meta = data?.meta && typeof data.meta === 'object' ? data.meta : {}

  const per = meta.per_page ?? 30
  const cur = meta.current_page ?? page

  return (
    <div className="gs-ranking-page">
      <GameSchoolHeader />

      <div className="gs-ranking-backdrop">
        <div className="gs-ranking-modal">
          <div className="gs-ranking-modal-head">
            <Link to="/" className="gs-ranking-back" aria-label="Voltar ao início">
              ←
            </Link>
            <h2>RANKING</h2>
          </div>

          <div className="gs-ranking-tabs" role="tablist" aria-label="Filtrar por">
            <button
              type="button"
              role="tab"
              aria-selected={por === 'coins'}
              className={`gs-ranking-tab${por === 'coins' ? ' is-active' : ''}`}
              onClick={() => {
                setPor('coins')
                setPage(1)
              }}
            >
              Coin
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={por === 'xp'}
              className={`gs-ranking-tab${por === 'xp' ? ' is-active' : ''}`}
              onClick={() => {
                setPor('xp')
                setPage(1)
              }}
            >
              XP
            </button>
          </div>

          {master ? (
            <div className="gs-ranking-master">
              <label>
                Unidade (ID)
                <input
                  className="gs-input"
                  inputMode="numeric"
                  value={unidadeId}
                  onChange={(e) => {
                    setUnidadeId(e.target.value)
                    setPage(1)
                  }}
                  placeholder="opcional — master"
                />
              </label>
            </div>
          ) : null}

          <div className="gs-ranking-scroll">
            {isLoading ? (
              <p className="gs-ranking-loading">A carregar…</p>
            ) : rows.length === 0 ? (
              <p className="gs-ranking-empty">Sem entradas no ranking.</p>
            ) : (
              rows.map((r, i) => {
                const pos =
                  meta.from != null
                    ? meta.from + i
                    : (cur - 1) * per + i + 1
                return (
                  <RankingRow
                    key={r.id ?? `${pos}-${i}`}
                    item={r}
                    por={por}
                    position={pos}
                  />
                )
              })
            )}
          </div>
        </div>

        {!isLoading && (meta.last_page ?? 1) > 1 ? (
          <div className="gs-ranking-pager">
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
