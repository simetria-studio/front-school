const SEGMENT_COLORS = [
  '#e53935',
  '#fb8c00',
  '#fdd835',
  '#43a047',
  '#1e88e5',
  '#8e24aa',
  '#00acc1',
  '#6d4c41',
  '#d81b60',
  '#7cb342',
]

const PREMIO_KEYS = [
  'segmentos',
  'premios',
  'prêmios',
  'fatias',
  'segments',
  'itens',
  'items',
  'opcoes',
  'opções',
  'slots',
  'prizes',
  'recompensas',
  'roleta_premios',
  'roleta_itens',
  'fatias_roleta',
  'premio_roleta',
]

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

function isPremioLikeArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return false
  return arr.every((x) => x && typeof x === 'object')
}

function findPremiosArray(obj, depth = 0, seen = new Set()) {
  if (!obj || typeof obj !== 'object' || depth > 5) return []
  if (seen.has(obj)) return []
  seen.add(obj)

  if (Array.isArray(obj)) {
    return isPremioLikeArray(obj) ? obj : []
  }

  for (const k of PREMIO_KEYS) {
    const v = obj[k]
    if (isPremioLikeArray(v)) return v
    if (v && typeof v === 'object' && isPremioLikeArray(v.data)) return v.data
  }

  for (const k of ['data', 'roleta', 'attributes', 'included', 'result', 'payload']) {
    const nested = obj[k]
    if (nested && typeof nested === 'object') {
      const found = findPremiosArray(nested, depth + 1, seen)
      if (found.length) return found
    }
  }

  return []
}

export function extractPremios(source) {
  return findPremiosArray(source)
}

function sortSegmentos(rows) {
  return rows.slice().sort((a, b) => {
    const oa = Number(a.ordem ?? a.order ?? 0)
    const ob = Number(b.ordem ?? b.order ?? 0)
    if (oa !== ob) return oa - ob
    return Number(a.id ?? 0) - Number(b.id ?? 0)
  })
}

export function normalizeRoletaListItem(r) {
  const id = pickId(r, ['id', 'roleta_id'])
  const title = pickText(r, ['titulo', 'nome', 'title'], `Roleta #${id ?? ''}`)
  const description = pickText(r, ['descricao', 'description', 'resumo'])
  const premios = sortSegmentos(extractPremios(r))
  const premioCount = premios.length
  const preview = premios.slice(0, 6).map((p, i) => {
    const seg = normalizeRoletaSegment(p, i)
    return { color: seg.color, emoji: seg.emoji }
  })
  return { id, title, description, premioCount, preview, raw: r }
}

export function normalizeRoletaSegment(p, index) {
  const item = p.item && typeof p.item === 'object' ? p.item : null
  const id = pickId(p, [
    'id',
    'segmento_id',
    'premio_id',
    'fatia_id',
    'segment_id',
    'opcao_id',
  ])

  let label = pickText(p, ['titulo', 'nome', 'label', 'descricao', 'texto'])
  if (!label && item) {
    label = pickText(item, ['titulo', 'nome', 'label', 'descricao'])
  }
  if (!label && p.tipo === 'coins') {
    const coins = Number(p.coins ?? p.moedas ?? 0)
    label = coins > 0 ? `${coins} Coins` : 'Coins'
  }
  if (!label) label = `Prémio ${index + 1}`

  const rawColor = pickText(p, ['cor', 'color', 'hex', 'cor_hex'], '')
  const color = rawColor || SEGMENT_COLORS[index % SEGMENT_COLORS.length]

  const emoji =
    p.emoji ??
    item?.emoji ??
    (p.tipo === 'coins' ? '🪙' : null)

  const imageUrl = item?.imagem_url ?? item?.image_url ?? null

  const displayLabel =
    emoji && !imageUrl ? `${emoji} ${label}`.trim() : label

  return {
    id,
    label: displayLabel,
    shortLabel: label,
    color,
    emoji,
    imageUrl,
    tipo: pickText(p, ['tipo', 'type'], item?.tipo ?? ''),
    raw: p,
  }
}

export function normalizeRoletaDetail(body) {
  if (!body || typeof body !== 'object') {
    return {
      id: null,
      title: 'Roleta',
      description: '',
      segments: [],
      paidCost: null,
      raw: body,
    }
  }

  const roleta =
    body.data && typeof body.data === 'object' && !Array.isArray(body.data)
      ? body.data
      : body

  const premiosRaw = sortSegmentos(extractPremios(body))
  const segments = premiosRaw.map((p, i) => normalizeRoletaSegment(p, i))
  const list = normalizeRoletaListItem(roleta ?? {})
  const paidCost = Number(
    roleta?.custo_giro ??
      roleta?.custo_pago ??
      roleta?.preco_giro ??
      roleta?.custo_moedas ??
      NaN,
  )

  return {
    ...list,
    segments,
    paidCost: Number.isFinite(paidCost) ? paidCost : null,
    raw: body,
  }
}

function extractGiroPayload(resultBody) {
  const data =
    resultBody?.data && typeof resultBody.data === 'object'
      ? resultBody.data
      : resultBody ?? {}
  return data.giro && typeof data.giro === 'object' ? data.giro : data
}

export function findSegmentIndex(segments, resultBody) {
  if (!Array.isArray(segments) || !segments.length) return 0

  const data =
    resultBody?.data && typeof resultBody.data === 'object'
      ? resultBody.data
      : resultBody ?? {}
  const giro = extractGiroPayload(resultBody)
  const segmento =
    giro.segmento ??
    giro.segment ??
    data.segmento ??
    data.segment

  const idxRaw =
    giro.fatia_index ??
    giro.segment_index ??
    giro.indice ??
    segmento?.indice

  if (idxRaw != null && !Number.isNaN(Number(idxRaw))) {
    const idx = Number(idxRaw)
    if (idx >= 0 && idx < segments.length) return idx
  }

  if (segmento?.ordem != null) {
    const byOrdem = segments.findIndex(
      (s) => Number(s.raw?.ordem) === Number(segmento.ordem),
    )
    if (byOrdem >= 0) return byOrdem
  }

  const segmentoId = pickId(segmento, ['id', 'segmento_id', 'segment_id'])
  if (segmentoId != null) {
    const found = segments.findIndex((s) => String(s.id) === String(segmentoId))
    if (found >= 0) return found
  }

  const premio = giro.premio ?? data.premio ?? giro.premios?.[0]
  const premioId = pickId(premio, ['id', 'premio_id', 'item_id'])
  if (premioId != null) {
    const found = segments.findIndex(
      (s) =>
        String(s.id) === String(premioId) ||
        String(s.raw?.item?.id) === String(premioId),
    )
    if (found >= 0) return found
  }

  const label =
    pickText(segmento, ['titulo', 'nome']) ||
    pickText(premio, ['titulo', 'nome']) ||
    pickText(giro, ['premio_nome', 'titulo'])
  if (label) {
    const found = segments.findIndex(
      (s) => s.shortLabel === label || s.label.includes(label),
    )
    if (found >= 0) return found
  }

  return 0
}

function normalizeTipoKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function isBauPrize(segment, result) {
  const tipoCandidates = [
    segment?.tipo,
    segment?.raw?.tipo,
    result?.segmento?.tipo,
    segment?.raw?.item?.tipo,
  ].map(normalizeTipoKey)

  if (
    tipoCandidates.some((t) =>
      ['bau', 'chest', 'caixa', 'lootbox', 'loot_box'].includes(t),
    )
  ) {
    return true
  }

  const title = String(
    result?.prizeTitle ?? segment?.shortLabel ?? segment?.label ?? '',
  ).toLowerCase()

  return /\bbau\b|baú|chest|caixa/.test(title)
}

export function normalizeRoletaPremio(p, index = 0) {
  if (!p || typeof p !== 'object') return null

  const item = p.item && typeof p.item === 'object' ? p.item : p
  const tipo = pickText(p, ['tipo', 'type'], pickText(item, ['tipo', 'type'], ''))
  const tipoKey = normalizeTipoKey(tipo)

  let titulo = pickText(item, ['titulo', 'nome'])
  if (!titulo) titulo = pickText(p, ['titulo', 'nome'])

  const coins = Number(p.coins ?? p.moedas ?? p.coins_ganho ?? 0) || 0
  const xp = Number(p.xp ?? p.xp_ganho ?? 0) || 0

  if (!titulo && tipoKey === 'coins') {
    titulo = coins > 0 ? `${coins} Coins` : 'Coins'
  }
  if (!titulo && tipoKey === 'xp') {
    titulo = xp > 0 ? `${xp} XP` : 'XP'
  }
  if (!titulo) titulo = `Prémio ${index + 1}`

  const emoji =
    item.emoji ??
    p.emoji ??
    (tipoKey === 'coins' ? '🪙' : tipoKey === 'xp' ? '⭐' : null)

  const imageUrl =
    item.imagem_url ??
    item.image_url ??
    p.imagem_url ??
    p.image_url ??
    null

  const quantidade = Number(p.quantidade ?? p.qty ?? 1) || 1
  const raridade = pickText(item, ['raridade'], pickText(p, ['raridade'], ''))

  return {
    titulo,
    tipo,
    tipoKey,
    coins,
    xp,
    emoji,
    imageUrl,
    quantidade,
    raridade,
    raw: p,
  }
}

export function normalizeGiroResult(body) {
  const data =
    body?.data && typeof body.data === 'object' ? body.data : body ?? {}
  const giro = extractGiroPayload(body)
  const segmento = giro.segmento ?? giro.segment ?? null
  const premios = Array.isArray(giro.premios)
    ? giro.premios
    : Array.isArray(giro.itens)
      ? giro.itens
      : Array.isArray(giro.conteudo)
        ? giro.conteudo
        : Array.isArray(giro.recompensas)
          ? giro.recompensas
          : []
  const premiosNormalized = premios
    .map((p, i) => normalizeRoletaPremio(p, i))
    .filter(Boolean)

  let label = pickText(segmento, ['titulo', 'nome'])
  if (!label && premios.length) {
    label = pickText(premios[0], ['titulo', 'nome'])
  }
  if (!label) label = 'Prémio obtido!'

  const coins = Number(giro.coins_ganho ?? giro.coins ?? 0) || 0
  const xp = Number(giro.xp_ganho ?? giro.xp ?? 0) || 0

  const parts = [label]
  if (coins > 0) parts.push(`+${coins} moedas`)
  if (xp > 0) parts.push(`+${xp} XP`)

  return {
    label: parts.join(' · '),
    prizeTitle: label,
    segmento,
    premios,
    premiosNormalized,
    coins,
    xp,
    coinsAluno: data.coins_aluno,
    xpAluno: data.xp_aluno,
    raw: data,
  }
}

export function computeWheelRotation(segmentIndex, segmentCount, currentRotation = 0) {
  const n = Math.max(segmentCount, 1)
  const segmentAngle = 360 / n
  const extraSpins = 5
  const target =
    extraSpins * 360 + (360 - segmentIndex * segmentAngle - segmentAngle / 2)
  const normalized = currentRotation - (currentRotation % 360)
  return normalized + target
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

export function normalizeRoletaStatus(body) {
  const data =
    body?.data && typeof body.data === 'object' ? body.data : body ?? {}
  const giroGratis =
    data.giro_gratis && typeof data.giro_gratis === 'object'
      ? data.giro_gratis
      : {}

  const freeOnly =
    data.somente_gratis === true || giroGratis.somente_gratis === true
  const freeUnlimited = giroGratis.ilimitado === true

  let freeSpinAvailable =
    giroGratis.disponivel === true ||
    freeUnlimited ||
    (freeOnly && freeUnlimited)

  if (!freeSpinAvailable) {
    const freeRaw =
      data.giro_gratis_disponivel ??
      data.gratis_disponivel ??
      data.pode_girar_gratis ??
      data.tem_giro_gratis ??
      data.free_spin_available
    freeSpinAvailable =
      freeRaw === true ||
      data.gratis === true ||
      (freeRaw !== false && data.disponivel_gratis === true)
  }

  if (
    !freeUnlimited &&
    typeof giroGratis.restantes === 'number' &&
    giroGratis.restantes <= 0
  ) {
    freeSpinAvailable = false
  }

  const paidCost = Number(
    data.custo_coins ??
      data.custo_pago ??
      data.custo_giro ??
      data.preco ??
      NaN,
  )
  const coinsAluno = Number(data.coins_aluno ?? NaN)
  const hasPaidCost = Number.isFinite(paidCost)
  const hasCoins = Number.isFinite(coinsAluno)
  const insufficientCoins = hasPaidCost && hasCoins && coinsAluno < paidCost

  const canSpinPaid =
    !freeOnly &&
    data.pode_girar_pago !== false &&
    data.giro_pago_disponivel !== false &&
    !insufficientCoins

  return {
    freeSpinAvailable,
    freeOnly,
    freeUnlimited,
    freeRemaining:
      typeof giroGratis.restantes === 'number' ? giroGratis.restantes : null,
    freeLimitWeek:
      giroGratis.limite_semana ??
      data.giros_gratis_por_semana ??
      null,
    freeUsedWeek:
      typeof giroGratis.usados_semana === 'number'
        ? giroGratis.usados_semana
        : null,
    nextFreeAt: giroGratis.proximo_gratis_em ?? null,
    canSpinPaid,
    paidCost: hasPaidCost ? paidCost : null,
    coinsAluno: hasCoins ? coinsAluno : null,
    insufficientCoins,
    raw: data,
  }
}

export function formatRoletaFreeStatusLabel(status) {
  if (!status || typeof status !== 'object') return 'Sem giro grátis'

  if (status.freeUnlimited) {
    return status.freeOnly ? 'Roleta grátis' : 'Giros grátis ilimitados'
  }

  if (status.freeSpinAvailable && status.freeRemaining != null) {
    const n = status.freeRemaining
    return `${n} giro${n === 1 ? '' : 's'} grátis`
  }

  if (status.freeOnly && status.freeSpinAvailable) {
    return 'Roleta grátis'
  }

  if (status.freeSpinAvailable) return 'Giro grátis disponível'

  if (status.nextFreeAt) {
    const when = formatWhen(status.nextFreeAt)
    return when ? `Próximo grátis: ${when}` : 'Sem giro grátis'
  }

  return 'Sem giro grátis'
}

export function formatRoletaFreeMeta(status) {
  if (!status || typeof status !== 'object') return null
  if (status.freeUnlimited && !status.freeOnly) return null

  const parts = []

  if (
    status.freeLimitWeek != null &&
    status.freeUsedWeek != null &&
    !status.freeUnlimited
  ) {
    parts.push(`${status.freeUsedWeek}/${status.freeLimitWeek} esta semana`)
  } else if (status.freeLimitWeek != null && !status.freeUnlimited) {
    parts.push(`${status.freeLimitWeek} grátis/semana`)
  }

  return parts.length ? parts.join(' · ') : null
}

export function normalizeGiroHistorico(g) {
  const id = pickId(g, ['id', 'giro_id'])
  const segmento = g.segmento ?? g.giro?.segmento
  const premioObj =
    segmento ??
    g.premio ??
    g.opcao ??
    g.fatia ??
    (Array.isArray(g.premios) ? g.premios[0] : null)
  const label = pickText(
    premioObj && typeof premioObj === 'object' ? premioObj : g,
    ['titulo', 'nome', 'premio', 'descricao', 'texto'],
    'Giro',
  )
  const tipo = pickText(g, ['tipo', 'type'], '')
  const when = formatWhen(g.created_at ?? g.criado_em ?? g.data)
  return { id, label, tipo, when, raw: g }
}
