import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchRoleta, fetchRoletaGiros } from '../api/endpoints'
import GameSchoolHeader from '../components/GameSchoolHeader'
import PaginationBar from '../components/PaginationBar'
import {
  normalizeGiroHistorico,
  normalizeRoletaListItem,
} from '../lib/roletaDisplay'
import { unwrapList } from '../lib/listUtils'
import './Roleta.css'

function GiroRow({ item }) {
  const { when, label, tipo } = normalizeGiroHistorico(item)

  return (
    <article className="gs-roleta-row">
      {when ? <span className="gs-roleta-row-when">{when}</span> : null}
      <span className="gs-roleta-row-label">
        {label}
        {tipo ? <span className="gs-roleta-row-tipo">{tipo}</span> : null}
      </span>
    </article>
  )
}

export default function RoletaGiros() {
  const { id } = useParams()
  const [page, setPage] = useState(1)

  const titleQuery = useQuery({
    queryKey: ['roleta', id, 'title'],
    queryFn: () => fetchRoleta(id),
    enabled: Boolean(id),
  })

  const girosQuery = useQuery({
    queryKey: ['roleta-giros', id, page],
    queryFn: async () => {
      const raw = await fetchRoletaGiros(id, { page, per_page: 20 })
      return unwrapList(raw)
    },
    enabled: Boolean(id),
  })

  const roletaTitle = normalizeRoletaListItem(
    titleQuery.data?.data ?? titleQuery.data ?? {},
  ).title

  const rows = Array.isArray(girosQuery.data?.data) ? girosQuery.data.data : []
  const meta =
    girosQuery.data?.meta && typeof girosQuery.data.meta === 'object'
      ? girosQuery.data.meta
      : {}

  return (
    <div className="gs-roleta-page">
      <GameSchoolHeader />

      <div className="gs-roleta-backdrop">
        <div className="gs-roleta-modal">
          <div className="gs-roleta-modal-head">
            <Link
              to={`/roletas/${id}`}
              className="gs-roleta-back"
              aria-label="Voltar à roleta"
            >
              ←
            </Link>
            <h2>HISTÓRICO</h2>
          </div>

          <div className="gs-roleta-scroll">
            {roletaTitle ? (
              <p className="gs-roleta-desc-block">{roletaTitle}</p>
            ) : null}

            {girosQuery.isLoading ? (
              <p className="gs-roleta-loading">A carregar…</p>
            ) : rows.length === 0 ? (
              <p className="gs-roleta-empty">Ainda não fizeste giros.</p>
            ) : (
              rows.map((g, i) => (
                <GiroRow key={g.id ?? `g-${i}`} item={g} />
              ))
            )}
          </div>
        </div>

        {!girosQuery.isLoading && (meta.last_page ?? 1) > 1 ? (
          <div className="gs-roleta-pager">
            <PaginationBar
              meta={meta}
              loading={girosQuery.isFetching}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
