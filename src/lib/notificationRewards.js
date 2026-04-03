function isUnread(n) {
  if (!n || typeof n !== 'object') return false
  return n.read_at == null && n.lida !== true
}

function normalizeRewardLine(raw) {
  const label =
    raw.titulo ??
    raw.nome ??
    raw.label ??
    raw.descricao ??
    raw.motivo ??
    'Recompensa'
  const xp = Number(raw.xp ?? raw.pontos_xp ?? 0) || 0
  const coins =
    Number(raw.coins ?? raw.moedas ?? raw.coin ?? raw.pontos_coins ?? 0) || 0
  return { label, xp, coins }
}

/** Linhas de recompensa a partir do payload `data` de uma notificação. */
export function itemsFromNotificationData(n) {
  const d = n?.data
  if (!d || typeof d !== 'object') {
    const title = n?.titulo ?? n?.title ?? 'Recompensa'
    return [{ label: title, xp: 0, coins: 0 }]
  }

  if (Array.isArray(d.recompensas)) {
    return d.recompensas.map(normalizeRewardLine)
  }
  if (Array.isArray(d.items)) {
    return d.items.map(normalizeRewardLine)
  }
  if (Array.isArray(d.linhas)) {
    return d.linhas.map(normalizeRewardLine)
  }

  const xp = Number(d.xp ?? d.pontos_xp ?? 0) || 0
  const coins = Number(d.coins ?? d.moedas ?? d.pontos_coins ?? 0) || 0
  if (xp > 0 || coins > 0) {
    return [
      normalizeRewardLine({
        titulo: d.motivo ?? d.titulo ?? n.titulo ?? 'Recompensa',
        xp,
        coins,
      }),
    ]
  }

  return [{ label: n.titulo ?? n.title ?? 'Recompensa', xp: 0, coins: 0 }]
}

/** Notificação não lida que representa coleta de recompensas (ajusta ao teu Laravel). */
export function isRewardCollectionNotification(n) {
  if (!isUnread(n)) return false
  const d = n.data
  if (d && typeof d === 'object') {
    if (d.coleta_recompensas === true) return true
    if (d.tipo === 'coleta_recompensas' || d.action === 'collect_rewards')
      return true
    if (Array.isArray(d.recompensas) && d.recompensas.length > 0) return true
    if (Array.isArray(d.items) && d.items.length > 0) return true
    const xp = Number(d.xp ?? 0) || 0
    const coins = Number(d.coins ?? d.moedas ?? 0) || 0
    if (xp > 0 || coins > 0) return true
  }
  const t = String(n.type ?? n.tipo ?? '').toLowerCase()
  if (t.includes('recompensa') || t.includes('reward')) return true
  const title = String(n.titulo ?? n.title ?? '').toLowerCase()
  if (
    title.includes('recompensa') ||
    title.includes('parabéns') ||
    title.includes('parabens')
  )
    return true
  return false
}

/** Junta várias notificações num único modal de coleta. */
export function aggregateRewardCollection(notifications) {
  const list = Array.isArray(notifications) ? notifications : []
  const pending = list.filter(isRewardCollectionNotification)
  const items = []
  const notificationIds = []
  for (const n of pending) {
    if (n.id == null) continue
    notificationIds.push(n.id)
    for (const line of itemsFromNotificationData(n)) {
      items.push(line)
    }
  }
  const totalXp = items.reduce((s, x) => s + x.xp, 0)
  const totalCoins = items.reduce((s, x) => s + x.coins, 0)
  return {
    items,
    notificationIds,
    totalXp,
    totalCoins,
    hasPending: notificationIds.length > 0,
  }
}

/** Badge Loja: pedido pronto para levantar (heurística — alinhar ao backend). */
export function isLojaRetiradaNotification(n) {
  if (!isUnread(n)) return false
  const d = n.data || {}
  if (d.tipo === 'pedido_pronto' || d.loja_retirada === true) return true
  if (d.pedido_pronto === true || d.retirada === true) return true
  const title = String(n.titulo ?? n.title ?? '').toLowerCase()
  if (title.includes('pronto') && title.includes('retir')) return true
  if (title.includes('levantar') || title.includes('loja')) {
    if (title.includes('pronto') || title.includes('disponível')) return true
  }
  const t = String(n.type ?? '').toLowerCase()
  if (t.includes('pedido') && t.includes('pronto')) return true
  return false
}
