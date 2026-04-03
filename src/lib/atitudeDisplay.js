/**
 * Normaliza um registo de atitude da API para a UI.
 * Ajusta os campos quando souberes o JSON real do Laravel.
 */
export function normalizeAtitude(a) {
  const title = a.titulo ?? a.nome ?? `Atitude #${a.id ?? ''}`
  const subtitle =
    a.descricao ??
    a.subtitulo ??
    a.detalhe ??
    a.regra ??
    a.observacao ??
    ''

  let coins =
    a.coins_delta ??
    a.moedas ??
    a.coins ??
    a.pontos_coins ??
    a.coin ??
    null
  let xp =
    a.xp_delta ??
    a.pontos_xp ??
    a.xp ??
    a.experiencia_ganha ??
    null

  if (coins !== null && coins !== undefined && coins !== '')
    coins = Number(coins)
  else coins = null
  if (xp !== null && xp !== undefined && xp !== '') xp = Number(xp)
  else xp = null

  const tipo = String(a.tipo ?? a.classificacao ?? a.categoria ?? '').toLowerCase()
  const isNegative =
    a.is_penalidade === true ||
    a.penalidade === true ||
    tipo.includes('penal') ||
    tipo.includes('negat') ||
    tipo === 'negativa' ||
    (coins != null && !Number.isNaN(coins) && coins < 0) ||
    (xp != null && !Number.isNaN(xp) && xp < 0)

  return { title, subtitle, coins, xp, isNegative }
}

export function formatDelta(n) {
  if (n == null || Number.isNaN(n) || n === 0) return '0'
  if (n > 0) return `+${n}`
  return String(n)
}
