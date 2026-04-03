/** Campos da missão vindos de GET /missoes — ajusta ao teu Laravel. */
export function normalizeMission(m) {
  const title = m.titulo ?? m.nome ?? `Missão #${m.id ?? ''}`
  const description =
    m.descricao ?? m.description ?? m.objetivo ?? m.texto ?? ''

  const coins =
    Number(
      m.coins ??
        m.recompensa_coins ??
        m.pontos_coins ??
        m.moedas ??
        m.reward_coins ??
        0,
    ) || 0
  const xp =
    Number(
      m.xp ?? m.recompensa_xp ?? m.pontos_xp ?? m.experiencia ?? m.reward_xp ?? 0,
    ) || 0

  return { title, description, coins, xp }
}

/** Usado no badge do dock: missão “nova” ou ainda por concluir/validar. */
export function isMissionNova(m) {
  if (!m || typeof m !== 'object') return false
  if (m.nova === true || m.is_nova === true || m.notificacao === true)
    return true
  const s = String(m.status ?? m.estado ?? '').toLowerCase()
  if (
    ['nova', 'novo', 'disponivel', 'disponível', 'ativa', 'pendente'].includes(
      s,
    )
  )
    return true
  if (m.concluida === false || m.concluido === false) return true
  return false
}
