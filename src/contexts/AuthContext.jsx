import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setUnauthorizedHandler } from '../api/client'
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
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  const applySession = useCallback(async (token, tokenType) => {
    setStoredToken(token, tokenType)
    const me = await fetchMe()
    setUser(me?.user ?? me?.data ?? me)
    return me
  }, [])

  const clearSession = useCallback(() => {
    clearAuthStorage()
    setUser(null)
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
        if (!cancelled) setReady(true)
        return
      }
      try {
        const me = await fetchMe()
        if (!cancelled) setUser(me?.user ?? me?.data ?? me)
      } catch {
        if (!cancelled) clearSession()
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
      const token = res?.token ?? res?.access_token
      const tokenType = res?.token_type || 'Bearer'
      if (!token) throw new Error('Resposta sem token')
      await applySession(token, tokenType)
      // Não sobrescrever com res.user: o perfil completo vem de GET /auth/me.
      return res
    },
    [applySession],
  )

  const loginQr = useCallback(
    async (qr_token) => {
      const res = await loginWithQr({ qr_token })
      const token = res?.token ?? res?.access_token
      const tokenType = res?.token_type || 'Bearer'
      if (!token) throw new Error('Resposta sem token')
      await applySession(token, tokenType)
      return res
    },
    [applySession],
  )

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
      login,
      loginQr,
      logout,
      refreshMe: async () => {
        const me = await fetchMe()
        setUser(me?.user ?? me?.data ?? me)
        return me
      },
    }),
    [user, ready, login, loginQr, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
