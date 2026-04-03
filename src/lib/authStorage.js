const TOKEN_KEY = 'gs_token'
const TOKEN_TYPE_KEY = 'gs_token_type'
const UNIT_KEY = 'gs_selected_unidade_id'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token, tokenType = 'Bearer') {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(TOKEN_TYPE_KEY, tokenType)
  } else {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_TYPE_KEY)
  }
}

export function getStoredTokenType() {
  return localStorage.getItem(TOKEN_TYPE_KEY) || 'Bearer'
}

export function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_TYPE_KEY)
}

export function getSelectedUnidadeId() {
  const v = localStorage.getItem(UNIT_KEY)
  return v ? Number(v) : null
}

export function setSelectedUnidadeId(id) {
  if (id == null) localStorage.removeItem(UNIT_KEY)
  else localStorage.setItem(UNIT_KEY, String(id))
}

export function clearSelectedUnidade() {
  localStorage.removeItem(UNIT_KEY)
}
