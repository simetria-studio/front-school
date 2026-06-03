import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { fetchQuiz, submitQuizTentativa } from '../api/endpoints'
import GameSchoolHeader from '../components/GameSchoolHeader'
import {
  buildTentativaPayload,
  normalizeQuizDetail,
  normalizeTentativaResult,
} from '../lib/quizDisplay'
import './Quizzes.css'

function formatScoreLine(result) {
  const parts = []
  if (!Number.isNaN(result.correct) && !Number.isNaN(result.total)) {
    parts.push(`${result.correct}/${result.total} corretas`)
  } else if (!Number.isNaN(result.score)) {
    parts.push(`Pontuação: ${result.score}`)
  }
  if (result.passed) parts.push('Aprovado')
  return parts.join(' · ') || 'Tentativa registada'
}

export default function QuizPlay() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const quizQuery = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => fetchQuiz(id),
    enabled: Boolean(id),
  })

  const quiz = useMemo(
    () => normalizeQuizDetail(quizQuery.data),
    [quizQuery.data],
  )

  const allAnswered =
    quiz.questions.length > 0 &&
    quiz.questions.every((q) => {
      const qid = q.id ?? String(q.text)
      return answers[qid] != null && answers[qid] !== ''
    })

  const submitMut = useMutation({
    mutationFn: () =>
      submitQuizTentativa(id, buildTentativaPayload(answers)),
    onSuccess: (body) => {
      setResult(normalizeTentativaResult(body))
      queryClient.invalidateQueries({ queryKey: ['quiz-tentativas', id] })
    },
  })

  function pickAnswer(perguntaId, alternativaId) {
    setAnswers((prev) => ({ ...prev, [perguntaId]: alternativaId }))
    setError('')
  }

  function submit(e) {
    e.preventDefault()
    setError('')
    if (!allAnswered) {
      setError('Responde a todas as perguntas antes de enviar.')
      return
    }
    submitMut.mutate(undefined, {
      onError: (err) => {
        setError(err instanceof ApiError ? err.message : String(err?.message))
      },
    })
  }

  return (
    <div className="gs-quiz-page">
      <GameSchoolHeader />

      <div className="gs-quiz-backdrop">
        <div className="gs-quiz-modal gs-quiz-play-modal">
          <div className="gs-quiz-modal-head">
            <Link to="/quizzes" className="gs-quiz-back" aria-label="Voltar aos quizzes">
              ←
            </Link>
            <h2>{quiz.title ? quiz.title.toUpperCase() : 'QUIZ'}</h2>
          </div>

          <div className="gs-quiz-scroll">
            {quizQuery.isLoading ? (
              <p className="gs-quiz-loading">A carregar quiz…</p>
            ) : quizQuery.isError ? (
              <p className="gs-quiz-empty">Não foi possível carregar este quiz.</p>
            ) : (
              <>
                {quiz.description ? (
                  <p className="gs-quiz-desc-block">{quiz.description}</p>
                ) : null}

                <div className="gs-quiz-actions-row">
                  <Link
                    to={`/quizzes/${id}/tentativas`}
                    className="gs-btn gs-btn--secondary"
                  >
                    Histórico
                  </Link>
                </div>

                {result ? (
                  <div
                    className={`gs-quiz-result${result.passed ? ' gs-quiz-result--ok' : ' gs-quiz-result--info'}`}
                    role="status"
                  >
                    {formatScoreLine(result)}
                  </div>
                ) : null}

                {error ? (
                  <p className="gs-alert gs-alert--error">{error}</p>
                ) : null}

                {quiz.questions.length === 0 ? (
                  <p className="gs-quiz-empty">Este quiz ainda não tem perguntas.</p>
                ) : (
                  <form onSubmit={submit}>
                    {quiz.questions.map((q, qi) => {
                      const qKey = q.id ?? `q-${qi}`
                      return (
                        <fieldset
                          key={qKey}
                          className="gs-quiz-question"
                        >
                          <legend className="gs-quiz-question-text">
                            {qi + 1}. {q.text}
                          </legend>
                          <div className="gs-quiz-options">
                            {q.options.map((opt, oi) => {
                              const optKey = opt.id ?? `o-${oi}`
                              const name = `q-${qKey}`
                              return (
                                <label
                                  key={optKey}
                                  className="gs-quiz-option"
                                >
                                  <input
                                    type="radio"
                                    name={name}
                                    value={String(optKey)}
                                    checked={
                                      String(answers[qKey]) === String(optKey)
                                    }
                                    onChange={() =>
                                      pickAnswer(qKey, optKey)
                                    }
                                    disabled={submitMut.isSuccess}
                                  />
                                  <span>{opt.label}</span>
                                </label>
                              )
                            })}
                          </div>
                        </fieldset>
                      )
                    })}

                    {!submitMut.isSuccess ? (
                      <button
                        type="submit"
                        className="gs-btn gs-btn--primary gs-btn--block gs-quiz-submit"
                        disabled={submitMut.isPending || !allAnswered}
                      >
                        {submitMut.isPending ? 'A enviar…' : 'Enviar respostas'}
                      </button>
                    ) : (
                      <Link
                        to={`/quizzes/${id}/tentativas`}
                        className="gs-btn gs-btn--primary gs-btn--block gs-quiz-submit"
                      >
                        Ver histórico
                      </Link>
                    )}
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
