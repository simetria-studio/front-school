import { useMutation, useQueryClient } from '@tanstack/react-query'
import { iconCoin, iconXp } from '../assets/imgs'
import { marcarNotificacaoLida } from '../api/endpoints'
import { useAuth } from '../hooks/useAuth'
import './RewardCollectionModal.css'

export default function RewardCollectionModal({
  open,
  payload,
  onDismiss,
}) {
  const queryClient = useQueryClient()
  const { refreshMe } = useAuth()
  const { items, notificationIds, totalXp, totalCoins } = payload

  const collectMut = useMutation({
    mutationFn: async () => {
      await Promise.all(
        notificationIds.map((id) => marcarNotificacaoLida(id)),
      )
    },
    onSuccess: async () => {
      await refreshMe()
      await queryClient.invalidateQueries({ queryKey: ['notificacoes'] })
      await queryClient.invalidateQueries({
        queryKey: ['notificacoes', 'pending-rewards'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['notificacoes', 'loja-badge'],
      })
      onDismiss?.()
    },
  })

  if (!open || !notificationIds?.length) return null

  return (
    <div className="gs-reward-overlay" role="dialog" aria-modal="true" aria-labelledby="gs-reward-title">
      <div className="gs-reward-modal">
        <div className="gs-reward-stars" aria-hidden>
          <span>★</span>
          <span>★</span>
          <span>★</span>
        </div>
        <h2 id="gs-reward-title" className="gs-reward-title">
          PARABÉNS!
        </h2>
        <p className="gs-reward-sub">
          Tens recompensas para recolher. Ao confirmar, o teu saldo é
          atualizado (conforme a escola configurou no servidor).
        </p>

        <ul className="gs-reward-list">
          {items.map((line, i) => (
            <li key={`${line.label}-${i}`} className="gs-reward-line">
              <span className="gs-reward-line-label">{line.label}</span>
              <span className="gs-reward-line-val">
                {line.xp > 0 ? (
                  <span>
                    {line.xp} XP <img src={iconXp} alt="" />
                  </span>
                ) : null}
                {line.coins > 0 ? (
                  <span>
                    {line.coins} COIN <img src={iconCoin} alt="" />
                  </span>
                ) : null}
                {!line.xp && !line.coins ? (
                  <span className="gs-reward-line-muted">—</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>

        <div className="gs-reward-totals">
          {totalXp > 0 ? (
            <span className="gs-reward-pill">
              {totalXp} XP <img src={iconXp} alt="" />
            </span>
          ) : null}
          {totalCoins > 0 ? (
            <span className="gs-reward-pill">
              {totalCoins} COIN <img src={iconCoin} alt="" />
            </span>
          ) : null}
        </div>

        {collectMut.isError ? (
          <p className="gs-reward-err">
            {String(collectMut.error?.message ?? 'Não foi possível confirmar.')}
          </p>
        ) : null}

        <button
          type="button"
          className="gs-reward-collect"
          disabled={collectMut.isPending}
          onClick={() => collectMut.mutate()}
        >
          {collectMut.isPending ? 'A processar…' : 'Coletar'}
        </button>
      </div>
    </div>
  )
}
