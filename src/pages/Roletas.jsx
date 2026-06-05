import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchRoletas } from '../api/endpoints'
import GameSchoolHeader from '../components/GameSchoolHeader'
import PaginationBar from '../components/PaginationBar'
import { normalizeRoletaListItem } from '../lib/roletaDisplay'
import { unwrapList } from '../lib/listUtils'
import './Roletas.css'

function WheelPreview({ preview }) {
  if (!preview?.length) {
    return (
      <div className="gs-roletas-card-wheel-ring">
        <div className="gs-roletas-card-wheel-inner" aria-hidden>
          🎰
        </div>
      </div>
    )
  }

  const slice = 360 / preview.length
  const gradient = preview
    .map((seg, i) => {
      const start = i * slice
      const end = (i + 1) * slice
      return `${seg.color} ${start}deg ${end}deg`
    })
    .join(', ')

  return (
    <div className="gs-roletas-card-wheel-ring">
      <div
        className="gs-roletas-card-wheel-slices"
        style={{ background: `conic-gradient(${gradient})` }}
        aria-hidden
      />
      <span className="gs-roletas-card-wheel-hub" />
    </div>
  )
}

function RoletaCard({ item, index }) {
  const { id, title, description, premioCount, preview } =
    normalizeRoletaListItem(item)
  if (id == null) return null

  return (
    <Link
      to={`/roletas/${id}`}
      className="gs-roletas-card"
      style={{ '--delay': `${Math.min(index, 8) * 0.05}s` }}
    >
      <div className="gs-roletas-card-wheel">
        <WheelPreview preview={preview} />
      </div>

      <div className="gs-roletas-card-body">
        <h3 className="gs-roletas-card-title">{title}</h3>
        {description ? (
          <p className="gs-roletas-card-desc">{description}</p>
        ) : null}

        <div className="gs-roletas-card-foot">
          <span className="gs-roletas-card-meta">
            {premioCount > 0
              ? `${premioCount} prémio${premioCount === 1 ? '' : 's'}`
              : 'Roleta disponível'}
          </span>
          <div className="gs-roletas-card-dots" aria-hidden>
            {preview.slice(0, 5).map((seg, i) => (
              <span
                key={i}
                className="gs-roletas-card-dot"
                style={{ '--dot-color': seg.color, background: seg.color }}
              />
            ))}
          </div>
        </div>

        <span className="gs-roletas-card-cta" style={{ marginTop: '0.55rem', alignSelf: 'flex-start' }}>
          Girar →
        </span>
      </div>
    </Link>
  )
}

export default function Roletas() {
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['roletas', page],
    queryFn: async () => {
      const raw = await fetchRoletas({ page, per_page: 20 })
      return unwrapList(raw)
    },
  })

  const rows = Array.isArray(data?.data) ? data.data : []
  const meta = data?.meta && typeof data.meta === 'object' ? data.meta : {}

  return (
    <div className="gs-roletas-page">
      <GameSchoolHeader />

      <div className="gs-roletas-body">
        <div className="gs-roletas-top">
          <Link to="/" className="gs-roletas-back" aria-label="Voltar ao início">
            ←
          </Link>
          <div className="gs-roletas-title-wrap">
            <h1 className="gs-roletas-title">ROLETAS</h1>
            <p className="gs-roletas-subtitle">
              Gira e ganha prémios especiais
            </p>
          </div>
        </div>

        <div className="gs-roletas-scroll">
          {!isLoading && rows.length > 0 ? (
            <p className="gs-roletas-intro">
              Escolhe uma roleta e tenta a sorte. Podes ganhar coins, XP e itens
              para o inventário.
            </p>
          ) : null}

          {isLoading ? (
            <div className="gs-roletas-loading" aria-hidden>
              <div className="gs-roletas-skeleton" />
              <div className="gs-roletas-skeleton" />
            </div>
          ) : rows.length === 0 ? (
            <div className="gs-roletas-empty">
              <div className="gs-roletas-empty-icon" aria-hidden>
                🎡
              </div>
              <h2 className="gs-roletas-empty-title">Sem roletas</h2>
              <p className="gs-roletas-empty-text">
                Ainda não há roletas ativas na tua escola. Volta mais tarde!
              </p>
            </div>
          ) : (
            <div className="gs-roletas-list">
              {rows.map((r, i) => (
                <RoletaCard key={r.id ?? `r-${i}`} item={r} index={i} />
              ))}
            </div>
          )}

          {!isLoading && (meta.last_page ?? 1) > 1 ? (
            <div className="gs-roletas-pager">
              <PaginationBar
                meta={meta}
                loading={isFetching}
                onPageChange={setPage}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
