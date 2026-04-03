import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { iconCoin, iconXp } from '../assets/imgs'
import { fetchMissoes } from '../api/endpoints'
import GameSchoolHeader from '../components/GameSchoolHeader'
import PaginationBar from '../components/PaginationBar'
import { normalizeMission } from '../lib/missionDisplay'
import { unwrapList } from '../lib/listUtils'
import './Missoes.css'

function MissaoCard({ item }) {
  const { title, description, coins, xp } = normalizeMission(item)

  return (
    <article className="gs-missao-card">
      <h3 className="gs-missao-title">{title}</h3>
      {description ? (
        <p className="gs-missao-desc">{description}</p>
      ) : null}
      {(coins > 0 || xp > 0) && (
        <div>
          <span className="gs-missao-recompensas-label">Recompensas</span>
          <div className="gs-missao-recompensas-row">
            {coins > 0 ? (
              <span className="gs-missao-reward">
                {coins}
                <img src={iconCoin} alt="" />
              </span>
            ) : null}
            {xp > 0 ? (
              <span className="gs-missao-reward">
                {xp}
                <img src={iconXp} alt="" />
              </span>
            ) : null}
          </div>
        </div>
      )}
    </article>
  )
}

export default function Missoes() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['missoes', 'badge'] })
  }, [queryClient])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['missoes', page],
    queryFn: async () => {
      const raw = await fetchMissoes({ page, per_page: 20 })
      return unwrapList(raw)
    },
  })

  const rows = Array.isArray(data?.data) ? data.data : []
  const meta = data?.meta && typeof data.meta === 'object' ? data.meta : {}

  return (
    <div className="gs-missoes-page">
      <GameSchoolHeader />

      <div className="gs-missoes-backdrop">
        <div className="gs-missoes-modal">
          <div className="gs-missoes-modal-head">
            <Link to="/" className="gs-missoes-back" aria-label="Voltar ao início">
              ←
            </Link>
            <h2>MISSÕES</h2>
          </div>

          <div className="gs-missoes-scroll">
            {isLoading ? (
              <p className="gs-missoes-loading">A carregar…</p>
            ) : rows.length === 0 ? (
              <p className="gs-missoes-empty">Nenhuma missão por agora.</p>
            ) : (
              rows.map((m, i) => (
                <MissaoCard key={m.id ?? m.slug ?? `m-${i}`} item={m} />
              ))
            )}
          </div>
        </div>

        {!isLoading && (meta.last_page ?? 1) > 1 ? (
          <div className="gs-missoes-pager">
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
