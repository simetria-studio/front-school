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
    if (v == null) continue
    if (typeof v === 'object') continue
    if (String(v).trim() !== '') return String(v).trim()
  }
  return fallback
}

function formatWhen(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString('pt-PT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function normalizePresente(p) {
  const id = pickId(p, ['id', 'presente_id'])
  const remetente = pickText(
    p.remetente ?? p,
    ['remetente_nome', 'de', 'from_name', 'nome_remetente', 'name'],
    'Alguém',
  )
  const itemName = pickText(
    p.item ?? p.emote ?? p,
    ['titulo', 'nome', 'item_nome', 'emote_nome'],
    'Presente',
  )
  const emoji =
    p.item?.emoji ?? p.emote?.emoji ?? p.emoji ?? p.icon ?? '🎁'
  const mensagem = pickText(p, ['mensagem', 'message', 'texto'])
  const when = formatWhen(p.created_at ?? p.criado_em ?? p.data)
  return { id, remetente, itemName, emoji, mensagem, when, raw: p }
}

export function normalizeDestinatarioOption(row) {
  if (!row || typeof row !== 'object') return null

  const aluno =
    row.aluno && typeof row.aluno === 'object' ? row.aluno : null
  const user = row.user && typeof row.user === 'object' ? row.user : null

  const id = pickId(row, [
    'id',
    'aluno_id',
    'destinatario_id',
    'user_id',
  ]) ?? pickId(aluno, ['id', 'aluno_id']) ?? pickId(user, ['id'])

  const nome =
    pickText(row, ['nome', 'name', 'nome_destino', 'nome_completo']) ||
    pickText(aluno, ['nome', 'name', 'nome_completo']) ||
    pickText(user, ['name', 'nome', 'nome_completo'])

  if (!nome) return null

  const turmaRef =
    row.turma && typeof row.turma === 'object' ? row.turma : null
  let turmaLabel = ''

  if (turmaRef) {
    turmaLabel = pickText(turmaRef, ['nome', 'titulo', 'label'])
  } else if (typeof row.turma === 'string') {
    turmaLabel = row.turma.trim()
  } else if (typeof aluno?.turma === 'string') {
    turmaLabel = aluno.turma.trim()
  } else {
    turmaLabel = pickText(row, ['turma_nome', 'nome_turma'])
    if (!turmaLabel && aluno?.turma && typeof aluno.turma === 'object') {
      turmaLabel = pickText(aluno.turma, ['nome', 'titulo', 'label'])
    }
  }

  return { id, nome, turmaNome: turmaLabel, raw: row }
}

function extractDestinatarioRows(body) {
  if (!body) return []
  if (Array.isArray(body)) return body

  if (typeof body !== 'object') return []

  if (Array.isArray(body.data)) return body.data

  if (body.data && typeof body.data === 'object') {
    if (Array.isArray(body.data.data)) return body.data.data
    if (Array.isArray(body.data.alunos)) return body.data.alunos
    if (Array.isArray(body.data.destinatarios)) return body.data.destinatarios
  }

  for (const key of ['alunos', 'destinatarios', 'results']) {
    if (Array.isArray(body[key])) return body[key]
  }

  return []
}

export function parseDestinatariosResponse(body) {
  return extractDestinatarioRows(body)
    .map(normalizeDestinatarioOption)
    .filter(Boolean)
}

/** Monta corpo POST /presentes */
export function buildPresentePayload({
  nomeDestino,
  alunoItemId,
  quantidade = 1,
  mensagem,
}) {
  const payload = {
    nome_destino: String(nomeDestino ?? '').trim(),
    aluno_item_id: Number(alunoItemId) || alunoItemId,
    quantidade: Math.max(1, Number(quantidade) || 1),
  }
  if (mensagem?.trim()) payload.mensagem = mensagem.trim()
  return payload
}

export function parsePresenteSendResponse(body) {
  const message = pickText(body, ['message', 'mensagem'], 'Presente enviado!')
  const data = body?.data && typeof body.data === 'object' ? body.data : {}
  const destinatario =
    data.destinatario && typeof data.destinatario === 'object'
      ? data.destinatario
      : null
  const destNome = pickText(destinatario, ['nome', 'name'])
  const destId = pickId(destinatario, ['id'])
  const quantidade = Number(data.quantidade ?? 1) || 1

  return { message, destNome, destId, quantidade, raw: body }
}
