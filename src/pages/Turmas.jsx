import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { isMaster } from '../auth/userProfile'
import { fetchTurmas } from '../api/endpoints'
import PageHeader from '../components/PageHeader'
import PaginationBar from '../components/PaginationBar'
import { useAuth } from '../hooks/useAuth'
import { getSelectedUnidadeId } from '../lib/authStorage'
import { unwrapList } from '../lib/listUtils'

export default function Turmas() {
  const { user } = useAuth()
  const master = isMaster(user)
  const [page, setPage] = useState(1)
  const [unidadeId, setUnidadeId] = useState(() =>
    master ? getSelectedUnidadeId() || '' : '',
  )

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['turmas', master ? unidadeId : '_', page],
    queryFn: async () => {
      const params = { page }
      if (master && unidadeId) params.unidade_id = unidadeId
      const raw = await fetchTurmas(params)
      return unwrapList(raw)
    },
  })

  const rows = data?.data ?? []
  const meta = data?.meta ?? {}

  return (
    <>
      <PageHeader title="Turmas" />
      {master ? (
        <label className="gs-label gs-label--inline">
          Filtrar por unidade (ID)
          <input
            className="gs-input"
            inputMode="numeric"
            value={unidadeId}
            onChange={(e) => {
              setUnidadeId(e.target.value)
              setPage(1)
            }}
            placeholder="opcional"
          />
        </label>
      ) : null}

      {isLoading ? (
        <p className="gs-muted">A carregar…</p>
      ) : (
        <ul className="gs-list">
          {rows.map((t) => (
            <li key={t.id} className="gs-card gs-card--row">
              <strong>{t.titulo ?? t.nome ?? `Turma #${t.id}`}</strong>
              {t.unidade_id != null ? (
                <span className="gs-muted"> · Unidade {t.unidade_id}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <PaginationBar
        meta={meta}
        loading={isFetching}
        onPageChange={setPage}
      />
    </>
  )
}
