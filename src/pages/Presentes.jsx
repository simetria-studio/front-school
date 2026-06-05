import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { enviarPresente, fetchInventario, fetchPresentes } from '../api/endpoints'
import GameSchoolHeader from '../components/GameSchoolHeader'
import PaginationBar from '../components/PaginationBar'
import {
  getInventarioSendableItems,
  parseInventarioResponse,
} from '../lib/inventarioDisplay'
import {
  buildPresentePayload,
  normalizePresente,
} from '../lib/presenteDisplay'
import { unwrapList } from '../lib/listUtils'
import './Presentes.css'

function ItemPicker({ items, value, onChange, loading }) {
  if (loading) {
    return (
      <div className="gs-gift-loading" aria-hidden>
        <div className="gs-gift-skeleton" />
      </div>
    )
  }

  if (!items.length) {
    return (
      <p className="gs-gift-picker-empty">
        Nenhum item para enviar.{' '}
        <Link to="/inventario">Ver inventário</Link>
      </p>
    )
  }

  return (
    <div className="gs-gift-picker" role="listbox" aria-label="Escolher item">
      {items.map((item) => {
        const active = String(item.id ?? '') === value
        return (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={active}
            className={`gs-gift-pick${active ? ' gs-gift-pick--active' : ''}`}
            onClick={() => onChange(String(item.id ?? ''))}
          >
            <span className="gs-gift-pick-visual">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="gs-gift-pick-img"
                />
              ) : (
                <span className="gs-gift-pick-emoji" aria-hidden>
                  {item.emoji}
                </span>
              )}
            </span>
            <span className="gs-gift-pick-name">{item.name}</span>
          </button>
        )
      })}
    </div>
  )
}

function PresenteRow({ item, index }) {
  const { remetente, itemName, emoji, mensagem, when } = normalizePresente(item)

  return (
    <article
      className="gs-gift-card"
      style={{ '--delay': `${Math.min(index, 6) * 0.05}s` }}
    >
      <div className="gs-gift-card-icon" aria-hidden>
        {emoji}
      </div>
      <div className="gs-gift-card-body">
        {when ? <span className="gs-gift-card-when">{when}</span> : null}
        <p className="gs-gift-card-title">
          <span className="gs-gift-card-from">{remetente}</span>
          {' enviou '}
          {itemName}
        </p>
        {mensagem ? (
          <p className="gs-gift-card-msg">&ldquo;{mensagem}&rdquo;</p>
        ) : null}
      </div>
    </article>
  )
}

export default function Presentes() {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const prefillItem = searchParams.get('item') ?? ''

  const [page, setPage] = useState(1)
  const [destinatarioId, setDestinatarioId] = useState('')
  const [inventarioId, setInventarioId] = useState(prefillItem)
  const [mensagem, setMensagem] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (prefillItem) setInventarioId(prefillItem)
  }, [prefillItem])

  const inventarioQuery = useQuery({
    queryKey: ['inventario'],
    queryFn: () => fetchInventario(),
    select: parseInventarioResponse,
  })

  const presentesQuery = useQuery({
    queryKey: ['presentes', 'recebidos', page],
    queryFn: async () => {
      const raw = await fetchPresentes({ tipo: 'recebidos', page, per_page: 20 })
      return unwrapList(raw)
    },
  })

  const sendableItems = getInventarioSendableItems(inventarioQuery.data)
  const rows = Array.isArray(presentesQuery.data?.data)
    ? presentesQuery.data.data
    : []
  const meta =
    presentesQuery.data?.meta &&
    typeof presentesQuery.data.meta === 'object'
      ? presentesQuery.data.meta
      : {}

  const sendMut = useMutation({
    mutationFn: () => {
      const selected = sendableItems.find(
        (item) => String(item.id ?? '') === inventarioId,
      )
      return enviarPresente(
        buildPresentePayload({
          destinatarioId,
          inventarioId: inventarioId || undefined,
          mensagem,
          tipo: selected?.tipo || undefined,
        }),
      )
    },
    onSuccess: () => {
      setSuccess('Presente enviado com sucesso!')
      setError('')
      setMensagem('')
      queryClient.invalidateQueries({ queryKey: ['inventario'] })
      queryClient.invalidateQueries({ queryKey: ['presentes'] })
    },
  })

  function submit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!destinatarioId.trim()) {
      setError('Indica o ID do destinatário.')
      return
    }
    if (!inventarioId.trim()) {
      setError('Escolhe um item do inventário.')
      return
    }
    sendMut.mutate(undefined, {
      onError: (err) => {
        setError(err instanceof ApiError ? err.message : String(err?.message))
      },
    })
  }

  return (
    <div className="gs-gift-page">
      <GameSchoolHeader />

      <div className="gs-gift-body">
        <div className="gs-gift-top">
          <Link to="/inventario" className="gs-gift-back" aria-label="Voltar">
            ←
          </Link>
          <div className="gs-gift-title-wrap">
            <h1 className="gs-gift-title">PRESENTES</h1>
            <p className="gs-gift-subtitle">Envia ou vê o que recebeste</p>
          </div>
        </div>

        <div className="gs-gift-scroll">
          <form className="gs-gift-panel" onSubmit={submit}>
            <div className="gs-gift-panel-head">
              <span className="gs-gift-panel-icon" aria-hidden>
                🎁
              </span>
              <h2 className="gs-gift-panel-title">Enviar presente</h2>
            </div>

            {error ? (
              <p className="gs-gift-alert gs-gift-alert--error">{error}</p>
            ) : null}
            {success ? (
              <p className="gs-gift-alert gs-gift-alert--success">{success}</p>
            ) : null}

            <label className="gs-gift-field">
              <span className="gs-gift-field-label">ID do destinatário</span>
              <input
                className="gs-gift-input"
                inputMode="numeric"
                required
                placeholder="Ex: 12"
                value={destinatarioId}
                onChange={(e) => setDestinatarioId(e.target.value)}
              />
            </label>

            <span className="gs-gift-picker-label">Escolhe o item</span>
            <ItemPicker
              items={sendableItems}
              value={inventarioId}
              onChange={setInventarioId}
              loading={inventarioQuery.isLoading}
            />

            <label className="gs-gift-field">
              <span className="gs-gift-field-label">Mensagem (opcional)</span>
              <input
                className="gs-gift-input"
                maxLength={200}
                placeholder="Escreve algo simpático…"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
              />
            </label>

            <button
              type="submit"
              className="gs-gift-submit"
              disabled={sendMut.isPending || !sendableItems.length}
            >
              {sendMut.isPending ? 'A enviar…' : 'Enviar presente'}
            </button>
          </form>

          <div className="gs-gift-section-head">
            <h2>Recebidos</h2>
            {!presentesQuery.isLoading && rows.length > 0 ? (
              <span className="gs-gift-section-count">
                {meta.total ?? rows.length}
              </span>
            ) : null}
          </div>

          {presentesQuery.isLoading ? (
            <div className="gs-gift-loading" aria-hidden>
              <div className="gs-gift-skeleton" />
              <div className="gs-gift-skeleton" />
            </div>
          ) : rows.length === 0 ? (
            <div className="gs-gift-empty">
              <div className="gs-gift-empty-icon" aria-hidden>
                💌
              </div>
              <p className="gs-gift-empty-text">
                Ainda não recebeste presentes. Quando um colega te enviar algo,
                aparece aqui.
              </p>
            </div>
          ) : (
            <div className="gs-gift-list">
              {rows.map((p, i) => (
                <PresenteRow key={p.id ?? `p-${i}`} item={p} index={i} />
              ))}
            </div>
          )}

          {!presentesQuery.isLoading && (meta.last_page ?? 1) > 1 ? (
            <div className="gs-gift-pager">
              <PaginationBar
                meta={meta}
                loading={presentesQuery.isFetching}
                onPageChange={setPage}
              />
            </div>
          ) : null}
        </div>

        <footer className="gs-gift-footer">
          <Link to="/inventario" className="gs-gift-inv-link">
            <span className="gs-gift-inv-link-label">Ver inventário</span>
            <span className="gs-gift-inv-link-chevron" aria-hidden>
              ›
            </span>
          </Link>
        </footer>
      </div>
    </div>
  )
}
