import { clearAuthStorage, getStoredToken, getStoredTokenType } from '../lib/authStorage'

export class ApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

let unauthorizedHandler = () => {}

export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = typeof fn === 'function' ? fn : () => {}
}

export function getApiBase() {
  const base = import.meta.env.VITE_API_URL || '/api'
  return String(base).replace(/\/$/, '')
}

function joinPath(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  const base = getApiBase()
  if (base.startsWith('http')) {
    return `${base}${p}`
  }
  const root = import.meta.env.BASE_URL || '/'
  const prefix = root.endsWith('/') ? root.slice(0, -1) : root
  return `${prefix}${base}${p}`.replace(/([^:]\/)\/+/g, '$1')
}

async function parseBody(res) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

export async function apiRequest(path, options = {}) {
  const { auth = true, headers: extraHeaders, ...rest } = options
  const headers = new Headers(extraHeaders || {})

  if (!headers.has('Accept')) headers.set('Accept', 'application/json')

  const isFormData = rest.body instanceof FormData
  if (rest.body != null && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (auth) {
    const token = getStoredToken()
    if (token) {
      const type = getStoredTokenType()
      headers.set('Authorization', `${type} ${token}`)
    }
  }

  const res = await fetch(joinPath(path), {
    ...rest,
    headers,
  })

  const body = await parseBody(res)

  if (res.status === 401 && auth) {
    clearAuthStorage()
    unauthorizedHandler()
  }

  if (!res.ok) {
    const message =
      body?.message ||
      body?.error ||
      (typeof body === 'object' && body?.errors && formatLaravelErrors(body.errors)) ||
      res.statusText ||
      'Pedido falhou'
    throw new ApiError(String(message), { status: res.status, body })
  }

  return body
}

function formatLaravelErrors(errors) {
  if (!errors || typeof errors !== 'object') return null
  return Object.values(errors)
    .flat()
    .filter(Boolean)
    .join(' ')
}

export function buildQuery(params) {
  const q = new URLSearchParams()
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    q.set(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}
