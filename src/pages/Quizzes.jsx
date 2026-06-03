import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchQuizzes } from '../api/endpoints'
import GameSchoolHeader from '../components/GameSchoolHeader'
import PaginationBar from '../components/PaginationBar'
import { normalizeQuizListItem } from '../lib/quizDisplay'
import { unwrapList } from '../lib/listUtils'
import './Quizzes.css'

function QuizCard({ item }) {
  const { id, title, description, questionCount } = normalizeQuizListItem(item)
  if (id == null) return null

  return (
    <Link to={`/quizzes/${id}`} className="gs-quiz-card">
      <h3 className="gs-quiz-card-title">{title}</h3>
      {description ? (
        <p className="gs-quiz-card-desc">{description}</p>
      ) : null}
      {questionCount > 0 ? (
        <span className="gs-quiz-card-meta">
          {questionCount} pergunta{questionCount === 1 ? '' : 's'}
        </span>
      ) : (
        <span className="gs-quiz-card-meta">Responder quiz</span>
      )}
    </Link>
  )
}

export default function Quizzes() {
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['quizzes', page],
    queryFn: async () => {
      const raw = await fetchQuizzes({ page, per_page: 20 })
      return unwrapList(raw)
    },
  })

  const rows = Array.isArray(data?.data) ? data.data : []
  const meta = data?.meta && typeof data.meta === 'object' ? data.meta : {}

  return (
    <div className="gs-quiz-page">
      <GameSchoolHeader />

      <div className="gs-quiz-backdrop">
        <div className="gs-quiz-modal">
          <div className="gs-quiz-modal-head">
            <Link to="/" className="gs-quiz-back" aria-label="Voltar ao início">
              ←
            </Link>
            <h2>QUIZZES</h2>
          </div>

          <div className="gs-quiz-scroll">
            {isLoading ? (
              <p className="gs-quiz-loading">A carregar…</p>
            ) : rows.length === 0 ? (
              <p className="gs-quiz-empty">Nenhum quiz disponível.</p>
            ) : (
              rows.map((q, i) => (
                <QuizCard key={q.id ?? `q-${i}`} item={q} />
              ))
            )}
          </div>
        </div>

        {!isLoading && (meta.last_page ?? 1) > 1 ? (
          <div className="gs-quiz-pager">
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
