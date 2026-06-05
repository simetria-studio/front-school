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

function resolveItemImageUrl(itemRef) {
  if (!itemRef || typeof itemRef !== 'object') return null
  const full = itemRef.imagem_url ?? itemRef.image_url ?? itemRef.url
  if (full) return full
  const rel = itemRef.imagem ?? itemRef.image
  if (!rel) return null
  if (String(rel).startsWith('http')) return rel
  const apiBase = import.meta.env.VITE_API_URL || '/api'
  const origin = String(apiBase).replace(/\/api\/?$/, '')
  const path = String(rel).startsWith('/') ? rel : `/${rel}`
  return `${origin}${path}`
}

function extractLegacyRows(body) {
  if (!body) return []
  if (Array.isArray(body)) return body
  if (typeof body !== 'object') return []
  if (Array.isArray(body.data)) return body.data
  if (body.data && typeof body.data === 'object') {
    if (Array.isArray(body.data.data)) return body.data.data
    if (Array.isArray(body.data.itens)) return body.data.itens
  }
  if (Array.isArray(body.itens)) return body.itens
  if (Array.isArray(body.inventario)) return body.inventario
  return []
}

export function inventarioCategoriaIcon(tipo) {
  const key = String(tipo ?? '').trim().toLowerCase()
  if (key === 'personagem') return '🦸'
  if (key === 'figurinha') return '✨'
  if (key === 'emote') return '🎭'
  if (key === 'badge' || key === 'medalha') return '🏅'
  if (key === 'skin' || key === 'avatar') return '👤'
  return '📦'
}

export function inventarioTipoLabel(tipo) {
  const key = String(tipo ?? '').trim().toLowerCase()
  if (!key) return 'Item'
  if (key === 'emote') return 'Emote'
  if (key === 'figurinha') return 'Figurinha'
  if (key === 'personagem') return 'Personagem'
  if (key === 'skin' || key === 'avatar') return 'Avatar'
  if (key === 'badge' || key === 'medalha') return 'Medalha'
  return key.charAt(0).toUpperCase() + key.slice(1)
}

export function normalizeInventarioItem(row) {
  const inventarioId = pickId(row, ['id', 'inventario_id'])
  const itemRef =
    row.item && typeof row.item === 'object'
      ? row.item
      : row.emote && typeof row.emote === 'object'
        ? row.emote
        : row

  const itemId = pickId(itemRef, ['id', 'item_id'])
  const name = pickText(
    itemRef,
    ['titulo', 'nome'],
    pickText(
      itemRef,
      ['label', 'descricao'],
      pickText(row, ['titulo', 'nome'], `Item #${inventarioId ?? ''}`),
    ),
  )
  const emoji = itemRef.emoji ?? itemRef.icon ?? row.emoji ?? row.icon ?? null
  const quantidade = Number(row.quantidade ?? row.qty ?? row.amount ?? 1) || 1
  const imageUrl = resolveItemImageUrl(itemRef) ?? resolveItemImageUrl(row)
  const tipo = pickText(itemRef, ['tipo', 'type'], pickText(row, ['tipo', 'type'], ''))
  const tipoLabel = pickText(
    itemRef,
    ['tipo_label'],
    inventarioTipoLabel(tipo),
  )
  const raridade = pickText(itemRef, ['raridade'], '')
  const raridadeLabel = pickText(itemRef, ['raridade_label'], '')
  const podeEnviar =
    row.pode_enviar === true ||
    row.pode_enviar === 1 ||
    row.pode_enviar === '1'

  return {
    id: inventarioId,
    itemId,
    name,
    emoji: emoji || (imageUrl ? null : '🎁'),
    quantidade,
    imageUrl,
    tipo,
    tipoLabel,
    raridade,
    raridadeLabel,
    podeEnviar,
    raw: row,
  }
}

export function canSendInventarioItem(item) {
  if (!item || typeof item !== 'object') return false
  if (typeof item.podeEnviar === 'boolean') return item.podeEnviar
  if (item.raw?.pode_enviar != null) {
    return item.raw.pode_enviar === true || item.raw.pode_enviar === 1
  }
  const key = String(item.tipo ?? 'emote').trim().toLowerCase()
  return key === 'emote' || key === ''
}

export function parseInventarioResponse(body) {
  const root =
    body?.data && typeof body.data === 'object' && !Array.isArray(body.data)
      ? body.data
      : body

  if (
    root &&
    typeof root === 'object' &&
    (Array.isArray(root.categorias) || Array.isArray(root.itens))
  ) {
    const categorias = Array.isArray(root.categorias)
      ? root.categorias.map((cat) => ({
          tipo: pickText(cat, ['tipo'], ''),
          titulo: pickText(
            cat,
            ['titulo'],
            inventarioTipoLabel(pickText(cat, ['tipo'], '')),
          ),
          total: Number(cat.total ?? 0) || 0,
          unicos: Number(cat.unicos ?? 0) || 0,
          itens: Array.isArray(cat.itens)
            ? cat.itens.map(normalizeInventarioItem)
            : [],
        }))
      : []

    const itens = Array.isArray(root.itens)
      ? root.itens.map(normalizeInventarioItem)
      : categorias.flatMap((cat) => cat.itens)

    return {
      aluno: root.aluno ?? null,
      resumo: root.resumo ?? null,
      categorias,
      itens,
    }
  }

  const legacyRows = extractLegacyRows(body)
  const itens = legacyRows.map(normalizeInventarioItem)

  return {
    aluno: null,
    resumo: null,
    categorias: itens.length
      ? [{ tipo: '', titulo: 'Itens', total: itens.length, unicos: itens.length, itens }]
      : [],
    itens,
  }
}

export function getInventarioSendableItems(parsed) {
  const list = Array.isArray(parsed?.itens) ? parsed.itens : []
  return list.filter(canSendInventarioItem)
}
