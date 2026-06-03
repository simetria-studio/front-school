import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchQuiz, fetchQuizTentativas } from '../api/endpoints'
import GameSchoolHeader from '../components/GameSchoolHeader'
import PaginationBar from '../components/PaginationBar'
import { normalizeQuizListItem, normalizeTentativa } from '../lib/quizDisplay'
import { unwrapList } from '../lib/listUtils'
import './Quizzes.css'

function TentativaRow({ item }) {
  const { when, score, total, correct, passed } = normalizeTentativa(item)
  let scoreText = ''
  if (!Number.isNaN(correct) && !Number.isNaN(total)) {
    scoreText = `${correct}/${total} corretas`
  } else if (!Number.isNaN(score)) {
    scoreText = `Pontuação: ${score}`
  } else {
    scoreText = 'Tentativa'
  }

  return (
    <article className="gs-quiz-tentativa-row">
      {when ? <span className="gs-quiz-tentativa-when">{when}</span> : null}
      <span className="gs-quiz-tentativa-score">
        {scoreText}
        {passed ? (
          <span className="gs-quiz-tentativa-badge">Aprovado</span>
        ) : null}
      </span>
    </article>
  )
}

export default function QuizTentativas() {
  const { id } = useParams()
  const [page, setPage] = useState(1)

  const titleQuery = useQuery({
    queryKey: ['quiz', id, 'title'],
    queryFn: () => fetchQuiz(id),
    enabled: Boolean(id),
  })

  const tentativasQuery = useQuery({
    queryKey: ['quiz-tentativas', id, page],
    queryFn: async () => {
      const raw = await fetchQuizTentativas(id, { page, per_page: 20 })
      return unwrapList(raw)
    },
    enabled: Boolean(id),
  })

  const quizTitle = normalizeQuizListItem(
    titleQuery.data?.data ?? titleQuery.data ?? {},
  ).title

  const rows = Array.isArray(tentativasQuery.data?.data)
    ? tentativasQuery.data.data
    : []
  const meta =
    tentativasQuery.data?.meta &&
    typeof tentativasQuery.data.meta === 'object'
      ? tentativasQuery.data.meta
      : {}

  return (
    <div className="gs-quiz-page">
      <GameSchoolHeader />

      <div className="gs-quiz-backdrop">
        <div className="gs-quiz-modal">
          <div className="gs-quiz-modal-head">
            <Link
              to={`/quizzes/${id}`}
              className="gs-quiz-back"
              aria-label="Voltar ao quiz"
            >
              ←
            </Link>
            <h2>HISTÓRICO</h2>
          </div>

          <div className="gs-quiz-scroll">
            {quizTitle ? (
              <p className="gs-quiz-desc-block">{quizTitle}</p>
            ) : null}

            {tentativasQuery.isLoading ? (
              <p className="gs-quiz-loading">A carregar…</p>
            ) : rows.length === 0 ? (
              <p className="gs-quiz-empty">Ainda não fizeste tentativas.</p>
            ) : (
              rows.map((t, i) => (
                <TentativaRow key={t.id ?? `t-${i}`} item={t} />
              ))
            )}
          </div>
        </div>

        {!tentativasQuery.isLoading && (meta.last_page ?? 1) > 1 ? (
          <div className="gs-quiz-pager">
            <PaginationBar
              meta={meta}
              loading={tentativasQuery.isFetching}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
