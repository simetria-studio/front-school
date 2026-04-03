/** Extrai token da resposta de login (Laravel Sanctum, Passport, wrappers `data`, etc.). */
export function extractLoginTokenFromResponse(res) {
  if (!res || typeof res !== 'object') {
    return { token: null, tokenType: 'Bearer' }
  }
  const data = res.data && typeof res.data === 'object' ? res.data : null
  const token =
    res.token ??
    res.access_token ??
    data?.token ??
    data?.access_token ??
    res.plainTextToken ??
    data?.plainTextToken ??
    null
  const tokenType = res.token_type ?? data?.token_type ?? 'Bearer'
  return { token, tokenType }
}
