/**
 * Extrai sempre um array de linhas da resposta Laravel / JSON variado.
 */
function extractRows(body) {
  if (!body) return []
  if (Array.isArray(body)) return body
  if (typeof body !== 'object') return []

  if (Array.isArray(body.data)) return body.data

  if (body.data && typeof body.data === 'object') {
    if (Array.isArray(body.data.data)) return body.data.data
  }

  const altKeys = [
    'atitudes',
    'items',
    'results',
    'records',
    'turmas',
    'alunos',
    'missoes',
    'pedidos',
    'loja_itens',
    'produtos',
    'notificacoes',
    'ranking',
  ]
  for (const k of altKeys) {
    if (Array.isArray(body[k])) return body[k]
  }

  return []
}

/**
 * Meta de paginação (Laravel: objeto `meta` ou campos na raiz junto a `data`).
 */
function extractMeta(body) {
  if (!body || typeof body !== 'object') return {}

  if (body.meta && typeof body.meta === 'object' && !Array.isArray(body.meta)) {
    return body.meta
  }

  const paginatorKeys = [
    'current_page',
    'last_page',
    'per_page',
    'total',
    'from',
    'to',
  ]
  const hasPaginator = paginatorKeys.some((k) => k in body)
  if (hasPaginator) {
    return {
      current_page: body.current_page,
      last_page: body.last_page,
      per_page: body.per_page,
      total: body.total,
      from: body.from,
      to: body.to,
    }
  }

  if (
    body.data &&
    typeof body.data === 'object' &&
    !Array.isArray(body.data) &&
    'current_page' in body.data
  ) {
    const p = body.data
    return {
      current_page: p.current_page,
      last_page: p.last_page,
      per_page: p.per_page,
      total: p.total,
      from: p.from,
      to: p.to,
    }
  }

  return {}
}

export function unwrapList(body) {
  const rows = extractRows(body)
  const data = Array.isArray(rows) ? rows : []
  return {
    data,
    meta: extractMeta(body),
    links: body?.links,
  }
}
