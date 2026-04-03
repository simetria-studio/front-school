import { useQuery } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import { isMaster } from '../auth/userProfile'
import { fetchUnidades } from '../api/endpoints'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { unwrapList } from '../lib/listUtils'

export default function Unidades() {
  const { user } = useAuth()
  const master = isMaster(user)

  const { data, isLoading } = useQuery({
    queryKey: ['unidades'],
    queryFn: async () => {
      const raw = await fetchUnidades()
      return unwrapList(raw)
    },
    enabled: master,
  })

  if (!master) return <Navigate to="/conta" replace />

  const rows = data?.data ?? []

  return (
    <>
      <PageHeader title="Unidades" backTo="/conta" />
      {isLoading ? (
        <p className="gs-muted">A carregar…</p>
      ) : (
        <ul className="gs-list">
          {rows.map((u) => (
            <li key={u.id} className="gs-card gs-card--row">
              <strong>{u.titulo ?? u.nome}</strong>
              <span className="gs-muted">#{u.id}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
