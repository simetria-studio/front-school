/** ID do aluno para POST /pedidos — ajusta ao JSON de `/auth/me`. */
export function getAlunoIdFromUser(user) {
  if (!user || typeof user !== 'object') return null
  const id = user.aluno_id ?? user.id_aluno ?? user.aluno?.id
  if (id != null && id !== '') return Number(id) || id
  return null
}
