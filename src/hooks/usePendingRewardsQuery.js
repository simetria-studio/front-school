import { useQuery } from '@tanstack/react-query'
import { ApiError } from '../api/client'
import { fetchNotificacoes } from '../api/endpoints'
import { unwrapList } from '../lib/listUtils'

/** Notificações para detetar modal de coleta de recompensas (aluno). */
export function usePendingRewardsQuery(user) {
  return useQuery({
    queryKey: ['notificacoes', 'pending-rewards'],
    queryFn: async () => {
      try {
        const raw = await fetchNotificacoes({ per_page: 50, page: 1 })
        return unwrapList(raw)
      } catch (e) {
        if (e instanceof ApiError && (e.status === 403 || e.status === 422)) {
          return { data: [], meta: {} }
        }
        throw e
      }
    },
    enabled: Boolean(user),
    staleTime: 15_000,
  })
}
