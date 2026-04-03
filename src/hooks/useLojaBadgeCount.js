import { useQuery } from '@tanstack/react-query'
import { ApiError } from '../api/client'
import { fetchNotificacoes } from '../api/endpoints'
import { isLojaRetiradaNotification } from '../lib/notificationRewards'
import { unwrapList } from '../lib/listUtils'

/** Badge vermelho na Loja: pedido pronto para levantar (via notificações). */
export function useLojaBadgeCount() {
  return useQuery({
    queryKey: ['notificacoes', 'loja-badge'],
    queryFn: async () => {
      try {
        const raw = await fetchNotificacoes({ page: 1, per_page: 50 })
        const { data, meta } = unwrapList(raw)
        const rows = Array.isArray(data) ? data : []
        const m = meta && typeof meta === 'object' ? meta : {}
        const fromMeta = m.loja_pendente ?? m.pedidos_prontos ?? m.retirada_count
        if (typeof fromMeta === 'number' && fromMeta > 0) {
          return Math.min(99, fromMeta)
        }
        const n = rows.filter(isLojaRetiradaNotification).length
        return Math.min(99, n)
      } catch (e) {
        if (e instanceof ApiError && (e.status === 403 || e.status === 422)) {
          return 0
        }
        throw e
      }
    },
    staleTime: 30_000,
  })
}
