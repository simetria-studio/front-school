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

export function normalizeFigurinha(row, index = 0) {
  if (!row || typeof row !== 'object') return null

  const possui = row.possui === true || row.possui === 1
  const quantidade = Number(row.quantidade ?? 0) || 0
  const numero = Number(row.numero ?? index + 1) || index + 1
  const titulo = pickText(row, ['titulo', 'nome'], `Figurinha #${numero}`)

  const imagemUrl = row.imagem_url ?? row.image_url ?? null
  const imagemBloqueadaUrl =
    row.imagem_bloqueada_url ?? row.imagem_bloqueada ?? null
  const imagemExibicaoUrl =
    row.imagem_exibicao_url ??
    (possui ? imagemUrl : imagemBloqueadaUrl) ??
    imagemUrl ??
    imagemBloqueadaUrl

  return {
    id: row.id ?? `fig-${numero}`,
    numero,
    titulo,
    possui,
    quantidade,
    imagemUrl,
    imagemBloqueadaUrl,
    imagemExibicaoUrl,
    raw: row,
  }
}

export function parseFigurinhasResponse(body) {
  const root =
    body?.data && typeof body.data === 'object' && !Array.isArray(body.data)
      ? body.data
      : body ?? {}

  const figurinhasRaw = Array.isArray(root.figurinhas)
    ? root.figurinhas
    : Array.isArray(root.data)
      ? root.data
      : Array.isArray(body?.figurinhas)
        ? body.figurinhas
        : []

  const figurinhas = figurinhasRaw
    .map((row, index) => normalizeFigurinha(row, index))
    .filter(Boolean)
    .sort((a, b) => a.numero - b.numero)

  const resumoRaw =
    root.resumo && typeof root.resumo === 'object' ? root.resumo : {}

  const possuiFromList = figurinhas.filter((f) => f.possui).length
  const totalFromList = figurinhas.length
  const total = Number(resumoRaw.total ?? totalFromList) || totalFromList
  const possui = Number(resumoRaw.possui ?? possuiFromList) || possuiFromList
  const faltam =
    Number(resumoRaw.faltam ?? Math.max(0, total - possui)) ||
    Math.max(0, total - possui)
  const percentualRaw = Number(resumoRaw.percentual)
  const percentual = Number.isFinite(percentualRaw)
    ? percentualRaw
    : total > 0
      ? Math.round((possui / total) * 1000) / 10
      : 0

  return {
    aluno: root.aluno ?? null,
    resumo: { total, possui, faltam, percentual },
    figurinhas,
  }
}
