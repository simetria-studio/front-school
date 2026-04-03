import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { createPedido } from '../api/endpoints'
import PageHeader from '../components/PageHeader'

export default function NovoPedido() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [id_aluno, setIdAluno] = useState('')
  const [id_produto, setIdProduto] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [error, setError] = useState('')

  const mut = useMutation({
    mutationFn: () =>
      createPedido({
        id_aluno: Number(id_aluno),
        id_produto: Number(id_produto),
        quantidade: quantidade ? Number(quantidade) : 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      navigate('/pedidos')
    },
  })

  function submit(e) {
    e.preventDefault()
    setError('')
    mut.mutate(undefined, {
      onError: (err) => {
        setError(err instanceof ApiError ? err.message : String(err?.message))
      },
    })
  }

  return (
    <>
      <PageHeader title="Novo pedido" backTo="/pedidos" />
      <form className="gs-form gs-card" onSubmit={submit}>
        {error ? <p className="gs-alert gs-alert--error">{error}</p> : null}
        <label className="gs-label">
          ID do aluno
          <input
            className="gs-input"
            inputMode="numeric"
            required
            value={id_aluno}
            onChange={(e) => setIdAluno(e.target.value)}
          />
        </label>
        <label className="gs-label">
          ID do produto (loja)
          <input
            className="gs-input"
            inputMode="numeric"
            required
            value={id_produto}
            onChange={(e) => setIdProduto(e.target.value)}
          />
        </label>
        <label className="gs-label">
          Quantidade
          <input
            className="gs-input"
            inputMode="numeric"
            min={1}
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
          />
        </label>
        <button
          type="submit"
          className="gs-btn gs-btn--primary gs-btn--block"
          disabled={mut.isPending}
        >
          {mut.isPending ? 'A enviar…' : 'Criar pedido'}
        </button>
        <Link to="/loja" className="gs-link-muted gs-center">
          Ver itens da loja
        </Link>
      </form>
    </>
  )
}
