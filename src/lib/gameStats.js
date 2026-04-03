/**
 * Fontes onde o Laravel costuma expor coins/XP (user direto ou aninhado).
 */
function collectUserSources(user) {
  if (!user || typeof user !== 'object') return []
  const out = [user]
  const nest = [
    user.aluno,
    user.game,
    user.gamificacao,
    user.perfil_gamificacao,
    user.student,
    user.profile,
    user.meta,
  ]
  for (const o of nest) {
    if (o && typeof o === 'object') out.push(o)
  }
  return out
}

function pickFirstNumber(sources, keys) {
  for (const src of sources) {
    for (const k of keys) {
      if (src[k] == null || src[k] === '') continue
      const n = Number(src[k])
      if (Number.isFinite(n)) return n
    }
  }
  return null
}

/** Extrai coins, XP e nível do objeto `user` vindo de `/auth/me`. */
export function getGameStats(user) {
  const defaults = {
    coins: 0,
    xp: 0,
    level: 1,
    xpCurrent: 0,
    xpNext: 6000,
  }

  if (!user || typeof user !== 'object') {
    return defaults
  }

  const sources = collectUserSources(user)

  const coins =
    pickFirstNumber(sources, [
      'coins',
      'moedas',
      'pontos_coins',
      'saldo_coins',
      'total_coins',
      'coin',
      'saldo',
      'creditos',
      'credits',
      'game_coins',
    ]) ?? 0

  const xp =
    pickFirstNumber(sources, [
      'xp',
      'experiencia',
      'experiência',
      'pontos_xp',
      'total_xp',
      'experience',
      'experience_points',
      'game_xp',
    ]) ?? 0

  const levelRaw =
    pickFirstNumber(sources, [
      'nivel',
      'nível',
      'level',
      'nivel_atual',
      'lvl',
      'game_level',
    ]) ?? 1
  const level = Math.max(1, Math.floor(levelRaw) || 1)

  const xpNextKeys = [
    'xp_para_proximo_nivel',
    'xp_proximo_nivel',
    'next_level_xp',
    'xp_next_level',
    'meta_xp_proximo',
  ]
  const xpCurrentKeys = [
    'xp_no_nivel',
    'xp_atual_nivel',
    'current_level_xp',
    'xp_nivel_atual',
    'meta_xp_atual',
  ]

  let xpNext = pickFirstNumber(sources, xpNextKeys)
  let xpCurrent = pickFirstNumber(sources, xpCurrentKeys)

  if (xpNext == null || !Number.isFinite(xpNext) || xpNext <= 0) {
    xpNext = 6000
  }
  if (xpCurrent == null || !Number.isFinite(xpCurrent) || xpCurrent < 0) {
    xpCurrent = Math.max(0, xp % Math.max(xpNext, 1))
  }

  return { coins, xp, level, xpCurrent, xpNext }
}

export function formatNumberPt(n) {
  return new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(
    Math.floor(Number(n) || 0),
  )
}
