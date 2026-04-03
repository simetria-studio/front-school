/** Normaliza uma linha do GET /ranking (ajusta ao JSON do Laravel). */
export function normalizeRankingRow(r, por) {
  const name =
    r.nome ??
    r.name ??
    r.aluno_nome ??
    r.user?.name ??
    r.display_name ??
    '—'
  const subtitle =
    r.turma_nome ??
    r.turma?.titulo ??
    r.turma_titulo ??
    r.unidade_titulo ??
    r.unidade?.titulo ??
    r.subtitulo ??
    r.escola ??
    ''

  const score =
    por === 'coins'
      ? r.coins ?? r.pontos_coins ?? r.moedas ?? r.total_coins ?? 0
      : r.xp ?? r.experiencia ?? r.pontos_xp ?? r.total_xp ?? 0

  return {
    name,
    subtitle,
    score: Number(score) || 0,
  }
}

/** Ex.: 5_060_000 → "5060k"; 850 → "850" */
export function formatRankingScore(n) {
  const x = Number(n)
  if (!Number.isFinite(x)) return '—'
  if (x === 0) return '0'
  if (Math.abs(x) >= 1000) {
    const k = x / 1000
    const s = Number.isInteger(k) ? String(k) : String(Math.round(k * 10) / 10).replace(/\.0$/, '')
    return `${s}k`
  }
  return String(Math.round(x))
}
