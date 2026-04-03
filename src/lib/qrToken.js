/**
 * Extrai o token do QR: URL …/login/qr/{token} (qualquer domínio) ou só o token.
 */
export function parseQrLoginToken(input) {
  const trimmed = String(input ?? '').trim()
  if (!trimmed) return ''
  const m = trimmed.match(/\/login\/qr\/([^/?#\s]+)/i)
  if (m) {
    try {
      return decodeURIComponent(m[1])
    } catch {
      return m[1]
    }
  }
  return trimmed
}
