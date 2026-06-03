import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './layouts/AppShell'
import { useAuth } from './hooks/useAuth'
import { getStoredToken } from './lib/authStorage'
import Login from './pages/Login'
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
import Quizzes from './pages/Quizzes'
import QuizPlay from './pages/QuizPlay'
import QuizTentativas from './pages/QuizTentativas'

function LoginGate({ children }) {
  const { user, ready, sessionRecoverable } = useAuth()
  const token = getStoredToken()
  if (!ready) {
    return (
      <div className="gs-loading">
        <p>A preparar sessão…</p>
      </div>
    )
  }
  if (token && user) {
    return <Navigate to="/" replace />
  }
  if (token && sessionRecoverable && !user) {
    return <Navigate to="/" replace />
  }
  return children
}

function ProtectedLayout() {
  const { user, ready, sessionRecoverable, recoverSession, logout } = useAuth()
  const token = getStoredToken()

  if (!ready) {
    return (
      <div className="gs-loading">
        <p>A preparar sessão…</p>
      </div>
    )
  }

  if (token && sessionRecoverable && !user) {
    return (
      <div className="gs-public">
        <div className="gs-public-inner gs-session-recover">
          <p className="gs-tagline">
            A tua sessão está guardada neste dispositivo, mas não foi possível validar com o
            servidor. Verifica a ligação e tenta de novo.
          </p>
          <button
            type="button"
            className="gs-btn gs-btn--primary gs-btn--block"
            onClick={() => recoverSession()}
          >
            Tentar novamente
          </button>
          <button
            type="button"
            className="gs-btn gs-btn--secondary gs-btn--block"
            onClick={() => logout()}
          >
            Sair e usar outro QR
          </button>
        </div>
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
      <Route
        path="/login"
        element={
          <LoginGate>
            <Login />
          </LoginGate>
        }
      />
      <Route
        path="/qr"
        element={
          <LoginGate>
            <Navigate to="/login" replace />
          </LoginGate>
        }
      />

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
        <Route path="quizzes" element={<Quizzes />} />
        <Route path="quizzes/:id" element={<QuizPlay />} />
        <Route path="quizzes/:id/tentativas" element={<QuizTentativas />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
