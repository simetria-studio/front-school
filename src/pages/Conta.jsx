import { Link } from 'react-router-dom'
import { isAluno, isMaster, showNotificacoesNav } from '../auth/userProfile'
import { useAuth } from '../hooks/useAuth'
import PageHeader from '../components/PageHeader'

export default function Conta() {
  const { user, logout } = useAuth()
  const aluno = isAluno(user)

  return (
    <>
      <PageHeader title="Conta" />

      <nav className="gs-menu-list" aria-label="Secções">
        {!aluno ? (
          <>
            <Link className="gs-menu-link" to="/turmas">
              Turmas <span className="gs-chevron">›</span>
            </Link>
            <Link className="gs-menu-link" to="/alunos">
              Alunos <span className="gs-chevron">›</span>
            </Link>
          </>
        ) : null}
        <Link className="gs-menu-link" to="/pedidos">
          Pedidos <span className="gs-chevron">›</span>
        </Link>
        <Link className="gs-menu-link" to="/missoes">
          Missões <span className="gs-chevron">›</span>
        </Link>
        <Link className="gs-menu-link" to="/quizzes">
          Quizzes <span className="gs-chevron">›</span>
        </Link>
        <Link className="gs-menu-link" to="/roletas">
          Roletas <span className="gs-chevron">›</span>
        </Link>
        {aluno ? (
          <>
            <Link className="gs-menu-link" to="/inventario">
              Inventário <span className="gs-chevron">›</span>
            </Link>
            <Link className="gs-menu-link" to="/figurinhas">
              Álbum de figurinhas <span className="gs-chevron">›</span>
            </Link>
            <Link className="gs-menu-link" to="/presentes">
              Presentes <span className="gs-chevron">›</span>
            </Link>
          </>
        ) : null}
        <Link className="gs-menu-link" to="/atitudes">
          Atitudes <span className="gs-chevron">›</span>
        </Link>
        <Link className="gs-menu-link" to="/ranking">
          Ranking <span className="gs-chevron">›</span>
        </Link>
        <Link className="gs-menu-link" to="/loja">
          Loja <span className="gs-chevron">›</span>
        </Link>
        {isMaster(user) ? (
          <Link className="gs-menu-link" to="/unidades">
            Unidades <span className="gs-chevron">›</span>
          </Link>
        ) : null}
        {showNotificacoesNav(user) ? (
          <Link className="gs-menu-link" to="/notificacoes">
            Notificações <span className="gs-chevron">›</span>
          </Link>
        ) : null}
      </nav>

      <button
        type="button"
        className="gs-btn gs-btn--ghost gs-btn--block"
        onClick={() => logout()}
      >
        Terminar sessão
      </button>
    </>
  )
}
