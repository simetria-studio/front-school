import { useQuery } from '@tanstack/react-query'
import { fetchMissoes } from '../api/endpoints'
import { isMissionNova } from '../lib/missionDisplay'
import { unwrapList } from '../lib/listUtils'

/**
 * Contagem para o badge em “Missões” no dock.
 * Preferência: meta.novas_count / missoes_novas do backend; senão conta itens com isMissionNova.
 */
export function useMissoesBadgeCount() {
  return useQuery({
    queryKey: ['missoes', 'badge'],
    queryFn: async () => {
      const raw = await fetchMissoes({ page: 1, per_page: 50 })
      const { data, meta } = unwrapList(raw)
      const rows = Array.isArray(data) ? data : []
      const m = meta && typeof meta === 'object' ? meta : {}
      const fromMeta =
        m.novas_count ?? m.missoes_novas ?? m.badge_count ?? m.novas
      if (typeof fromMeta === 'number' && fromMeta > 0) {
        return Math.min(99, fromMeta)
      }
      const n = rows.filter(isMissionNova).length
      return Math.min(99, n)
    },
    staleTime: 30_000,
  })
}
