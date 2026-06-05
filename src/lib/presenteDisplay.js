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

/** Monta corpo POST /presentes */
export function buildPresentePayload({ destinatarioId, itemId, inventarioId, mensagem, tipo }) {
  const payload = {}
  if (destinatarioId != null && destinatarioId !== '') {
    payload.destinatario_id = Number(destinatarioId) || destinatarioId
    payload.id_destinatario = payload.destinatario_id
  }
  if (inventarioId != null && inventarioId !== '') {
    payload.inventario_id = Number(inventarioId) || inventarioId
  }
  if (itemId != null && itemId !== '') {
    payload.item_id = Number(itemId) || itemId
    payload.emote_id = payload.item_id
  }
  if (mensagem?.trim()) payload.mensagem = mensagem.trim()
  if (tipo) payload.tipo = tipo
  return payload
}
