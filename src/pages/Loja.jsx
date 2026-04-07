import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { iconCoin } from '../assets/imgs'
import { createPedido, fetchLojaItens } from '../api/endpoints'
import GameSchoolHeader from '../components/GameSchoolHeader'
import PaginationBar from '../components/PaginationBar'
import { useAuth } from '../hooks/useAuth'
import { getGameStats } from '../lib/gameStats'
import { normalizeLojaItem } from '../lib/lojaDisplay'
import { unwrapList } from '../lib/listUtils'
import { getAlunoIdFromUser } from '../lib/userAluno'
import './Loja.css'

export default function Loja() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { coins: userCoins } = getGameStats(user)
  const alunoId = getAlunoIdFromUser(user)
  const [page, setPage] = useState(1)
  const [feedback, setFeedback] = useState({ type: '', text: '' })

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['notificacoes', 'loja-badge'] })
  }, [queryClient])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['loja-itens', page],
    queryFn: async () => {
      const raw = await fetchLojaItens({ page, per_page: 20, apenas_ativos: true })
      return unwrapList(raw)
    },
  })

  const rows = Array.isArray(data?.data) ? data.data : []
  const meta = data?.meta && typeof data.meta === 'object' ? data.meta : {}

  const buyMut = useMutation({
    mutationFn: (idProduto) =>
      createPedido({
        id_aluno: alunoId,
        id_produto: idProduto,
        quantidade: 1,
      }),
    onSuccess: () => {
      setFeedback({
        type: 'ok',
        text: 'Pedido enviado! A coordenação vai validar.',
      })
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] })
      queryClient.invalidateQueries({ queryKey: ['notificacoes', 'loja-badge'] })
    },
    onError: (e) => {
      const msg =
        e instanceof ApiError ? e.message : e?.message || 'Não foi possível comprar.'
      setFeedback({ type: 'err', text: msg })
    },
  })

  function handleBuy(row) {
    setFeedback({ type: '', text: '' })
    if (alunoId == null) {
      setFeedback({
        type: 'err',
        text: 'Conta sem id de aluno. Ajusta getAlunoIdFromUser ao /auth/me.',
      })
      return
    }
    const price = Number(row?.priceCoins) || 0
    if (userCoins < price) {
      setFeedback({
        type: 'err',
        text: `Moedas insuficientes para comprar ${row?.title ?? 'este item'}.`,
      })
      return
    }
    buyMut.mutate(row.id)
  }

  return (
    <div className="gs-loja-page">
      <GameSchoolHeader />

      <div className="gs-loja-backdrop">
        <div className="gs-loja-modal">
          <div className="gs-loja-modal-head">
            <Link to="/" className="gs-loja-back" aria-label="Voltar ao início">
              ←
            </Link>
            <h2>STORE</h2>
          </div>

          <div className="gs-loja-scroll">
            {feedback.text ? (
              <p
                className={`gs-loja-msg${feedback.type === 'ok' ? ' gs-loja-msg--ok' : ' gs-loja-msg--err'}`}
              >
                {feedback.text}
              </p>
            ) : null}

            {isLoading ? (
              <p className="gs-loja-loading">A carregar…</p>
            ) : rows.length === 0 ? (
              <p className="gs-loja-empty">Loja vazia.</p>
            ) : (
              rows.map((item) => {
                const row = normalizeLojaItem(item)
                const hasEnoughCoins = userCoins >= (Number(row.priceCoins) || 0)
                const canBuy = row.canBuy && hasEnoughCoins
                return (
                  <div key={row.id} className="gs-loja-row">
                    <div className="gs-loja-row-main">
                      <span className="gs-loja-row-title">{row.title}</span>
                      <span className="gs-loja-row-price">
                        {row.priceCoins} COIN
                        <img src={iconCoin} alt="" />
                      </span>
                    </div>
                    <button
                      type="button"
                      className="gs-loja-buy"
                      disabled={!canBuy || buyMut.isPending}
                      onClick={() => handleBuy(row)}
                      title={!hasEnoughCoins ? 'Moedas insuficientes' : undefined}
                    >
                      BUY
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {!isLoading && (meta.last_page ?? 1) > 1 ? (
          <div className="gs-loja-pager">
            <PaginationBar
              meta={meta}
              loading={isFetching}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
