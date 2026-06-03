import { apiRequest, buildQuery } from './client'

export function loginWithPassword({ username, password, device_name }) {
  return apiRequest('/auth/login', {
    auth: false,
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
      device_name: device_name || 'game-school-web',
    }),
  })
}

export function loginWithQr({ qr_token, device_name }) {
  return apiRequest('/auth/qr-login', {
    auth: false,
    method: 'POST',
    body: JSON.stringify({
      qr_token,
      device_name: device_name || 'game-school-web',
    }),
  })
}

export function fetchMe() {
  return apiRequest('/auth/me')
}

export function logout() {
  return apiRequest('/auth/logout', { method: 'POST' })
}

export function fetchUnidades() {
  return apiRequest('/unidades')
}

/** Antes do login (QR); pode retornar 401 se o backend exigir token — ver UI fallback. */
export function fetchUnidadesGuest() {
  return apiRequest('/unidades', { auth: false })
}

export function fetchTurmas(params) {
  return apiRequest(`/turmas${buildQuery(params)}`)
}

export function fetchAlunos(params) {
  return apiRequest(`/alunos${buildQuery(params)}`)
}

export function fetchMissoes(params) {
  return apiRequest(`/missoes${buildQuery(params)}`)
}

export function fetchAtitudes(params) {
  return apiRequest(`/atitudes${buildQuery(params)}`)
}

export function fetchLojaItens(params) {
  return apiRequest(`/loja-itens${buildQuery(params)}`)
}

export function fetchPedidos(params) {
  return apiRequest(`/pedidos${buildQuery(params)}`)
}

export function createPedido(payload) {
  return apiRequest('/pedidos', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function aprovarPedido(pedidoId) {
  return apiRequest(`/pedidos/${pedidoId}/aprovar`, { method: 'POST' })
}

export function fetchRanking(params) {
  return apiRequest(`/ranking${buildQuery(params)}`)
}

export function fetchNotificacoes(params) {
  return apiRequest(`/notificacoes${buildQuery(params)}`)
}

export function marcarTodasNotificacoesLidas() {
  return apiRequest('/notificacoes/marcar-todas-lidas', { method: 'POST' })
}

export function marcarNotificacaoLida(id) {
  return apiRequest(`/notificacoes/${id}/marcar-lida`, { method: 'POST' })
}

export function fetchQuizzes(params) {
  return apiRequest(`/quizzes${buildQuery(params)}`)
}

export function fetchQuiz(id) {
  return apiRequest(`/quizzes/${id}`)
}

export function submitQuizTentativa(quizId, payload) {
  return apiRequest(`/quizzes/${quizId}/tentativas`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchQuizTentativas(quizId, params) {
  return apiRequest(`/quizzes/${quizId}/tentativas${buildQuery(params)}`)
}
