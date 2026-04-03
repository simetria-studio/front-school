import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, setUnauthorizedHandler } from '../api/client'
import {
  fetchMe,
  loginWithPassword,
  loginWithQr,
  logout as apiLogout,
} from '../api/endpoints'
import {
  clearAuthStorage,
  getStoredToken,
  setStoredToken,
} from '../lib/authStorage'
import { extractLoginTokenFromResponse } from '../lib/authToken'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  /** Token existe mas /auth/me falhou (rede, 5xx) — não apagar sessão. */
  const [sessionRecoverable, setSessionRecoverable] = useState(false)

  const applySession = useCallback(async (token, tokenType) => {
    setStoredToken(token, tokenType)
    setSessionRecoverable(false)
    const me = await fetchMe()
    setUser(me?.user ?? me?.data ?? me)
    return me
  }, [])

  const clearSession = useCallback(() => {
    clearAuthStorage()
    setUser(null)
    setSessionRecoverable(false)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession()
      navigate('/login', { replace: true })
    })
  }, [clearSession, navigate])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const token = getStoredToken()
      if (!token) {
        if (!cancelled) {
          setSessionRecoverable(false)
          setReady(true)
        }
        return
      }
      try {
        const me = await fetchMe()
        if (!cancelled) {
          setUser(me?.user ?? me?.data ?? me)
          setSessionRecoverable(false)
        }
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 401) {
          clearSession()
        } else {
          setUser(null)
          setSessionRecoverable(true)
        }
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [clearSession])

  const login = useCallback(
    async ({ username, password }) => {
      const res = await loginWithPassword({ username, password })
      const { token, tokenType } = extractLoginTokenFromResponse(res)
      if (!token) throw new Error('Resposta sem token')
      await applySession(token, tokenType)
      return res
    },
    [applySession],
  )

  const loginQr = useCallback(
    async (qr_token) => {
      const res = await loginWithQr({ qr_token })
      const { token, tokenType } = extractLoginTokenFromResponse(res)
      if (!token) throw new Error('Resposta sem token')
      await applySession(token, tokenType)
      return res
    },
    [applySession],
  )

  const recoverSession = useCallback(async () => {
    const token = getStoredToken()
    if (!token) {
      setSessionRecoverable(false)
      return
    }
    try {
      const me = await fetchMe()
      setUser(me?.user ?? me?.data ?? me)
      setSessionRecoverable(false)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearSession()
        navigate('/login', { replace: true })
      } else {
        setSessionRecoverable(true)
      }
    }
  }, [clearSession, navigate])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      /* token já inválido */
    }
    clearSession()
    navigate('/login', { replace: true })
  }, [clearSession, navigate])

  const value = useMemo(
    () => ({
      user,
      ready,
      sessionRecoverable,
      login,
      loginQr,
      logout,
      recoverSession,
      refreshMe: async () => {
        const me = await fetchMe()
        setUser(me?.user ?? me?.data ?? me)
        setSessionRecoverable(false)
        return me
      },
    }),
    [user, ready, sessionRecoverable, login, loginQr, logout, recoverSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
