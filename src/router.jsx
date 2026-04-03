import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './layouts/AppShell'
import { useAuth } from './hooks/useAuth'
import { getStoredToken } from './lib/authStorage'
import Login from './pages/Login'
import QrLogin from './pages/QrLogin'
import Dashboard from './pages/Dashboard'
import Conta from './pages/Conta'
import Turmas from './pages/Turmas'
import Alunos from './pages/Alunos'
import Missoes from './pages/Missoes'
import Atitudes from './pages/Atitudes'
import Loja from './pages/Loja'
import Pedidos from './pages/Pedidos'
import NovoPedido from './pages/NovoPedido'
import Ranking from './pages/Ranking'
import Notificacoes from './pages/Notificacoes'
import Unidades from './pages/Unidades'

function ProtectedLayout() {
  const { user, ready } = useAuth()
  const token = getStoredToken()

  if (!ready) {
    return (
      <div className="gs-loading">
        <p>A preparar sessão…</p>
      </div>
    )
  }
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }
  return <AppShell />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/qr" element={<QrLogin />} />

      <Route path="/" element={<ProtectedLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="conta" element={<Conta />} />
        <Route path="turmas" element={<Turmas />} />
        <Route path="alunos" element={<Alunos />} />
        <Route path="missoes" element={<Missoes />} />
        <Route path="atitudes" element={<Atitudes />} />
        <Route path="loja" element={<Loja />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="pedidos/novo" element={<NovoPedido />} />
        <Route path="ranking" element={<Ranking />} />
        <Route path="notificacoes" element={<Notificacoes />} />
        <Route path="unidades" element={<Unidades />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
