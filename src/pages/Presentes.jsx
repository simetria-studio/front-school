import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import {
  enviarPresente,
  fetchInventario,
  fetchPresenteDestinatarios,
  fetchPresentes,
} from '../api/endpoints'
import GameSchoolHeader from '../components/GameSchoolHeader'
import PaginationBar from '../components/PaginationBar'
import {
  getInventarioSendableItems,
  parseInventarioResponse,
} from '../lib/inventarioDisplay'
import {
  buildPresentePayload,
  normalizePresente,
  parseDestinatariosResponse,
  parsePresenteSendResponse,
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
            {item.quantidade > 1 ? (
              <span className="gs-gift-pick-qty">×{item.quantidade}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

function DestinatarioAutocomplete({ value, onChange, disabled }) {
  const [input, setInput] = useState(value?.nome ?? '')
  const [debounced, setDebounced] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setInput(value?.nome ?? '')
  }, [value?.nome])

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(input.trim()), 320)
    return () => clearTimeout(timer)
  }, [input])

  const searchQuery = useQuery({
    queryKey: ['presentes', 'destinatarios', debounced],
    queryFn: () => fetchPresenteDestinatarios({ search: debounced }),
    enabled: debounced.length >= 2 && !value,
    select: parseDestinatariosResponse,
    staleTime: 30_000,
  })

  const options = Array.isArray(searchQuery.data) ? searchQuery.data : []
  const canSearch = !value && debounced.length >= 2
  const showDropdown = open && canSearch
  const showLoading =
    showDropdown && searchQuery.isFetching && options.length === 0
  const showEmpty =
    showDropdown &&
    searchQuery.isFetched &&
    !searchQuery.isFetching &&
    options.length === 0
  const showError = showDropdown && searchQuery.isError
  const showList = showDropdown && options.length > 0

  function handleInputChange(next) {
    setInput(next)
    setOpen(true)
    if (value) onChange(null)
  }

  function pickOption(option) {
    onChange(option)
    setInput(option.nome)
    setOpen(false)
  }

  return (
    <div className="gs-gift-autocomplete">
      <label className="gs-gift-field" style={{ marginBottom: 0 }}>
        <span className="gs-gift-field-label">Destinatário</span>
        <input
          className="gs-gift-input"
          type="text"
          autoComplete="off"
          required={!value}
          disabled={disabled}
          placeholder="Nome do colega…"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 150)
          }}
        />
      </label>

      {!value && debounced.length < 2 ? (
        <p className="gs-gift-autocomplete-hint">
          Escreve pelo menos 2 letras para procurar.
        </p>
      ) : null}

      {value ? (
        <div className="gs-gift-selected-dest">
          <span className="gs-gift-selected-dest-text">
            {value.nome}
            {value.turmaNome ? (
              <span className="gs-gift-selected-dest-turma">{value.turmaNome}</span>
            ) : null}
          </span>
          <button
            type="button"
            className="gs-gift-selected-dest-clear"
            onClick={() => {
              onChange(null)
              setInput('')
              setOpen(true)
            }}
          >
            Trocar
          </button>
        </div>
      ) : null}

      {showLoading ? (
        <p className="gs-gift-autocomplete-status">A procurar…</p>
      ) : null}

      {showError ? (
        <p className="gs-gift-autocomplete-status gs-gift-autocomplete-status--error">
          Não foi possível procurar colegas. Tenta outra vez.
        </p>
      ) : null}

      {showEmpty ? (
        <p className="gs-gift-autocomplete-status">
          Nenhum colega encontrado com &ldquo;{debounced}&rdquo;.
        </p>
      ) : null}

      {showList ? (
        <ul className="gs-gift-autocomplete-list" role="listbox">
          {options.map((opt) => (
            <li key={opt.id ?? opt.nome}>
              <button
                type="button"
                role="option"
                className="gs-gift-autocomplete-option"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pickOption(opt)}
              >
                <span className="gs-gift-autocomplete-name">{opt.nome}</span>
                {opt.turmaNome ? (
                  <span className="gs-gift-autocomplete-turma">{opt.turmaNome}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
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
  const [destinatario, setDestinatario] = useState(null)
  const [alunoItemId, setAlunoItemId] = useState(prefillItem)
  const [quantidade, setQuantidade] = useState(1)
  const [mensagem, setMensagem] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (prefillItem) setAlunoItemId(prefillItem)
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
  const selectedItem = useMemo(
    () =>
      sendableItems.find((item) => String(item.id ?? '') === alunoItemId) ??
      null,
    [sendableItems, alunoItemId],
  )
  const maxQuantidade = selectedItem?.quantidade ?? 1

  useEffect(() => {
    if (quantidade > maxQuantidade) setQuantidade(maxQuantidade)
  }, [maxQuantidade, quantidade])

  const rows = Array.isArray(presentesQuery.data?.data)
    ? presentesQuery.data.data
    : []
  const meta =
    presentesQuery.data?.meta &&
    typeof presentesQuery.data.meta === 'object'
      ? presentesQuery.data.meta
      : {}

  const sendMut = useMutation({
    mutationFn: () =>
      enviarPresente(
        buildPresentePayload({
          nomeDestino: destinatario?.nome,
          alunoItemId: alunoItemId || undefined,
          quantidade,
          mensagem,
        }),
      ),
    onSuccess: (body) => {
      const parsed = parsePresenteSendResponse(body)
      const destLabel = parsed.destNome || destinatario?.nome || 'o colega'
      setSuccess(parsed.message || `Presente enviado para ${destLabel}!`)
      setError('')
      setMensagem('')
      setDestinatario(null)
      setQuantidade(1)
      queryClient.invalidateQueries({ queryKey: ['inventario'] })
      queryClient.invalidateQueries({ queryKey: ['presentes'] })
    },
  })

  function submit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!destinatario?.nome?.trim()) {
      setError('Escolhe um destinatário da lista.')
      return
    }
    if (!alunoItemId.trim()) {
      setError('Escolhe um item do inventário.')
      return
    }
    if (quantidade < 1 || quantidade > maxQuantidade) {
      setError(`Quantidade inválida (máx. ${maxQuantidade}).`)
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

            <DestinatarioAutocomplete
              value={destinatario}
              onChange={setDestinatario}
              disabled={sendMut.isPending}
            />

            <span className="gs-gift-picker-label">Escolhe o item</span>
            <ItemPicker
              items={sendableItems}
              value={alunoItemId}
              onChange={setAlunoItemId}
              loading={inventarioQuery.isLoading}
            />

            {maxQuantidade > 1 ? (
              <label className="gs-gift-field">
                <span className="gs-gift-field-label">Quantidade</span>
                <div className="gs-gift-qty-row">
                  <input
                    className="gs-gift-input"
                    type="number"
                    min={1}
                    max={maxQuantidade}
                    value={quantidade}
                    onChange={(e) =>
                      setQuantidade(
                        Math.min(
                          maxQuantidade,
                          Math.max(1, Number(e.target.value) || 1),
                        ),
                      )
                    }
                  />
                  <span className="gs-gift-autocomplete-hint">
                    Máx. {maxQuantidade}
                  </span>
                </div>
              </label>
            ) : null}

            <label className="gs-gift-field">
              <span className="gs-gift-field-label">Mensagem (opcional)</span>
              <input
                className="gs-gift-input"
                maxLength={200}
                placeholder="Para você!"
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
