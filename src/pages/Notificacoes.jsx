import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  fetchNotificacoes,
  marcarNotificacaoLida,
  marcarTodasNotificacoesLidas,
} from '../api/endpoints'
import PageHeader from '../components/PageHeader'
import PaginationBar from '../components/PaginationBar'
import { ApiError } from '../api/client'
import { unwrapList } from '../lib/listUtils'

export default function Notificacoes() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [forbidden, setForbidden] = useState(false)

  const query = useQuery({
    queryKey: ['notificacoes', page],
    queryFn: async () => {
      try {
        setForbidden(false)
        const raw = await fetchNotificacoes({ page, per_page: 20 })
        return { ...unwrapList(raw), unread: raw.meta?.unread_count }
      } catch (e) {
        if (e instanceof ApiError && e.status === 403) {
          setForbidden(true)
          return { data: [], meta: {}, unread: 0 }
        }
        throw e
      }
    },
  })

  const rows = query.data?.data ?? []
  const meta = query.data?.meta ?? {}
  const unread = query.data?.unread ?? meta.unread_count

  const markAll = useMutation({
    mutationFn: marcarTodasNotificacoesLidas,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificacoes'] }),
  })

  const markOne = useMutation({
    mutationFn: (id) => marcarNotificacaoLida(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificacoes'] }),
  })

  if (forbidden) {
    return (
      <>
        <PageHeader title="Notificações" />
        <p className="gs-alert gs-alert--warn">
          Sem permissão para notificações nesta conta (perfil típico: aluno).
        </p>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Notificações"
        right={
          unread > 0 ? (
            <span className="gs-badge gs-badge--accent">{unread} novas</span>
          ) : null
        }
      />
      {unread > 0 ? (
        <button
          type="button"
          className="gs-btn gs-btn--secondary gs-btn--block gs-mb"
          disabled={markAll.isPending}
          onClick={() => markAll.mutate()}
        >
          Marcar todas como lidas
        </button>
      ) : null}

      {query.isLoading ? (
        <p className="gs-muted">A carregar…</p>
      ) : (
        <ul className="gs-list">
          {rows.map((n) => (
            <li
              key={n.id}
              className={`gs-card gs-card--row ${n.read_at == null && !n.lida ? 'gs-card--unread' : ''}`}
            >
              <div>
                <strong>{n.titulo ?? n.title ?? 'Notificação'}</strong>
                <p className="gs-muted gs-clamp">{n.mensagem ?? n.body ?? n.data?.message}</p>
              </div>
              {n.read_at == null && !n.lida ? (
                <button
                  type="button"
                  className="gs-btn gs-btn--sm gs-btn--ghost"
                  disabled={markOne.isPending}
                  onClick={() => markOne.mutate(n.id)}
                >
                  Lida
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <PaginationBar
        meta={meta}
        loading={query.isFetching}
        onPageChange={setPage}
      />
    </>
  )
}
