export function isMaster(user) {
  if (!user || typeof user !== 'object') return false
  if (user.is_master === true) return true
  const r = String(user.role || user.tipo || user.papel || '').toLowerCase()
  return r === 'master' || r === 'administrador'
}

export function isAluno(user) {
  if (!user || typeof user !== 'object') return false
  if (user.aluno_id != null) return true
  const ar = String(user.access_role ?? '').toLowerCase()
  if (ar === 'aluno' || ar === 'student') return true
  const r = String(user.role || user.tipo || user.papel || '').toLowerCase()
  return r === 'aluno' || r === 'student'
}

export function canApprovePedidos(user) {
  if (!user) return false
  if (isMaster(user)) return true
  if (user.can_approve_pedidos === true) return true
  const r = String(user.role || user.tipo || user.papel || '').toLowerCase()
  return r === 'direcao' || r === 'direção' || r === 'director'
}

export function showNotificacoesNav(user) {
  if (!user) return false
  if (isAluno(user)) return true
  return user.notificacoes_enabled === true
}
