import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { canApprovePedidos } from '../auth/userProfile'
import { aprovarPedido, fetchPedidos } from '../api/endpoints'
import PageHeader from '../components/PageHeader'
import PaginationBar from '../components/PaginationBar'
import { useAuth } from '../hooks/useAuth'
import { unwrapList } from '../lib/listUtils'

export default function Pedidos() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const canApprove = canApprovePedidos(user)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['pedidos', page],
    queryFn: async () => {
      const raw = await fetchPedidos({ page, per_page: 20 })
      return unwrapList(raw)
    },
  })

  const approveMut = useMutation({
    mutationFn: (id) => aprovarPedido(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pedidos'] }),
  })

  const rows = data?.data ?? []
  const meta = data?.meta ?? {}

  return (
    <>
      <PageHeader
        title="Pedidos"
        right={
          <Link to="/pedidos/novo" className="gs-btn gs-btn--sm gs-btn--primary">
            Novo
          </Link>
        }
      />
      {isLoading ? (
        <p className="gs-muted">A carregar…</p>
      ) : (
        <ul className="gs-list">
          {rows.map((p) => (
            <li key={p.id} className="gs-card gs-card--row gs-card--spread">
              <div>
                <strong>Pedido #{p.id}</strong>
                <p className="gs-muted">
                  {p.status ?? p.estado ?? '—'}
                  {p.id_aluno != null ? ` · Aluno ${p.id_aluno}` : ''}
                  {p.id_produto != null ? ` · Produto ${p.id_produto}` : ''}
                </p>
              </div>
              {canApprove &&
              (() => {
                const st = String(p.status ?? p.estado ?? '').toLowerCase()
                return (
                  st === 'pendente' ||
                  st === 'pending' ||
                  p.pendente === true
                )
              })() ? (
                <button
                  type="button"
                  className="gs-btn gs-btn--sm gs-btn--secondary"
                  disabled={approveMut.isPending}
                  onClick={() => approveMut.mutate(p.id)}
                >
                  Aprovar
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {approveMut.isError ? (
        <p className="gs-alert gs-alert--error">{String(approveMut.error?.message)}</p>
      ) : null}
      <PaginationBar
        meta={meta}
        loading={isFetching}
        onPageChange={setPage}
      />
    </>
  )
}
