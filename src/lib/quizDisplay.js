function pickId(obj, keys) {
  if (!obj || typeof obj !== 'object') return null
  for (const k of keys) {
    const v = obj[k]
    if (v != null && v !== '') return v
  }
  return null
}

function pickText(obj, keys, fallback = '') {
  if (!obj || typeof obj !== 'object') return fallback
  for (const k of keys) {
    const v = obj[k]
    if (v != null && String(v).trim() !== '') return String(v).trim()
  }
  return fallback
}

/** Item da lista GET /quizzes */
export function normalizeQuizListItem(q) {
  const id = pickId(q, ['id', 'quiz_id'])
  const title = pickText(q, ['titulo', 'nome', 'title'], `Quiz #${id ?? ''}`)
  const description = pickText(q, [
    'descricao',
    'description',
    'resumo',
    'texto',
  ])
  const questionCount = Number(
    q.perguntas_count ??
      q.total_perguntas ??
      q.questions_count ??
      (Array.isArray(q.perguntas) ? q.perguntas.length : 0) ??
      0,
  )
  const disponivel =
    q.disponivel !== false &&
    q.ativo !== false &&
    String(q.status ?? '').toLowerCase() !== 'inativo'

  return { id, title, description, questionCount, disponivel, raw: q }
}

function extractQuestions(quiz) {
  if (!quiz || typeof quiz !== 'object') return []
  const nested = quiz.quiz ?? quiz.data
  const sources = [quiz, nested].filter((x) => x && typeof x === 'object')
  for (const src of sources) {
    const keys = ['perguntas', 'questions', 'itens']
    for (const k of keys) {
      if (Array.isArray(src[k])) return src[k]
    }
  }
  return []
}

function extractOptions(pergunta) {
  if (!pergunta || typeof pergunta !== 'object') return []
  const keys = [
    'alternativas',
    'opcoes',
    'options',
    'respostas',
    'choices',
  ]
  for (const k of keys) {
    if (Array.isArray(pergunta[k])) return pergunta[k]
  }
  return []
}

/** Alternativa sem expor se é correta */
export function normalizeQuizOption(opt, index) {
  const id = pickId(opt, ['id', 'alternativa_id', 'opcao_id', 'option_id'])
  const label = pickText(
    opt,
    ['texto', 'titulo', 'label', 'nome', 'descricao', 'description'],
    `Opção ${index + 1}`,
  )
  return { id, label }
}

export function normalizeQuizQuestion(p, index) {
  const id = pickId(p, ['id', 'pergunta_id', 'question_id'])
  const text = pickText(
    p,
    ['pergunta', 'texto', 'enunciado', 'titulo', 'nome', 'question'],
    `Pergunta ${index + 1}`,
  )
  const options = extractOptions(p).map((o, i) => normalizeQuizOption(o, i))
  return { id, text, options }
}

/** Detalhe GET /quizzes/{id} */
export function normalizeQuizDetail(body) {
  const quiz = body?.data && typeof body.data === 'object' ? body.data : body
  const list = normalizeQuizListItem(quiz ?? {})
  const questions = extractQuestions(quiz).map((p, i) =>
    normalizeQuizQuestion(p, i),
  )
  return { ...list, questions }
}

/** Monta corpo POST /quizzes/{id}/tentativas */
export function buildTentativaPayload(answersByQuestionId) {
  const respostas = Object.entries(answersByQuestionId)
    .filter(([, altId]) => altId != null && altId !== '')
    .map(([perguntaId, opcaoId]) => ({
      pergunta_id: Number(perguntaId) || perguntaId,
      opcao_id: Number(opcaoId) || opcaoId,
    }))
  return { respostas }
}

function formatWhen(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Linha GET /quizzes/{id}/tentativas */
export function normalizeTentativa(t) {
  const id = pickId(t, ['id', 'tentativa_id'])
  const score = Number(
    t.pontuacao ??
      t.pontos ??
      t.score ??
      t.nota ??
      t.acertos ??
      NaN,
  )
  const total = Number(
    t.total_perguntas ?? t.total ?? t.perguntas_total ?? NaN,
  )
  const correct = Number(t.acertos ?? t.correctas ?? NaN)
  const when = formatWhen(
    t.created_at ?? t.criado_em ?? t.data ?? t.submitted_at,
  )
  const passed =
    t.aprovado === true ||
    t.passou === true ||
    String(t.resultado ?? '').toLowerCase() === 'aprovado'

  return { id, score, total, correct, when, passed, raw: t }
}

/** Resultado após POST tentativa */
export function normalizeTentativaResult(body) {
  if (!body || typeof body !== 'object') return {}
  const data = body.data && typeof body.data === 'object' ? body.data : body
  return normalizeTentativa(data)
}
