import { useCallback, useEffect, useState } from 'react'
import {
  HOME_CHARACTER_EVENT,
  getHomeCharacter,
  parseCharacterId,
  setHomeCharacter,
} from '../lib/characters3d'

export function useHomeCharacter() {
  const [characterId, setCharacterId] = useState(getHomeCharacter)

  useEffect(() => {
    const sync = () => setCharacterId(getHomeCharacter())
    window.addEventListener(HOME_CHARACTER_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(HOME_CHARACTER_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const selectCharacter = useCallback((id) => {
    const next = setHomeCharacter(id)
    setCharacterId(parseCharacterId(next))
  }, [])

  return [characterId, selectCharacter]
}
