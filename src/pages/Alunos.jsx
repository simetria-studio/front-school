import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { fetchAlunos } from '../api/endpoints'
import PageHeader from '../components/PageHeader'
import PaginationBar from '../components/PaginationBar'
import { unwrapList } from '../lib/listUtils'

export default function Alunos() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [turmaId, setTurmaId] = useState('')

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['alunos', page, search, turmaId],
    queryFn: async () => {
      const params = { page, per_page: 20 }
      if (search.trim()) params.search = search.trim()
      if (turmaId) params.turma_id = turmaId
      const raw = await fetchAlunos(params)
      return unwrapList(raw)
    },
  })

  const rows = data?.data ?? []
  const meta = data?.meta ?? {}

  return (
    <>
      <PageHeader title="Alunos" />
      <div className="gs-filter-row">
        <label className="gs-label">
          Pesquisar
          <input
            className="gs-input"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="nome…"
          />
        </label>
        <label className="gs-label">
          Turma ID
          <input
            className="gs-input"
            inputMode="numeric"
            value={turmaId}
            onChange={(e) => {
              setTurmaId(e.target.value)
              setPage(1)
            }}
            placeholder="opcional"
          />
        </label>
      </div>

      {isLoading ? (
        <p className="gs-muted">A carregar…</p>
      ) : (
        <ul className="gs-list">
          {rows.map((a) => (
            <li key={a.id} className="gs-card gs-card--row">
              <div>
                <strong>{a.nome ?? a.name ?? `Aluno #${a.id}`}</strong>
                {a.turma_id != null ? (
                  <span className="gs-muted"> · Turma {a.turma_id}</span>
                ) : null}
              </div>
              <span className="gs-muted">#{a.id}</span>
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
