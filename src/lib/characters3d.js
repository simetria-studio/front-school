export const HOME_CHARACTER_KEY = 'home_character'
export const HOME_CHARACTER_EVENT = 'gs-home-character'

export const CHARACTERS = {
  modelo2: {
    id: 'modelo2',
    label: 'Modelo 2',
    idleUrl: '/models/avatar_m2.glb',
    actionUrl: null,
    actionLabel: 'Dançar',
    actionBusyLabel: 'A dançar…',
    actionDurationMs: 21000,
  },
  modelo3: {
    id: 'modelo3',
    label: 'Modelo 3',
    idleUrl: '/models/avatar.glb',
    actionUrl: '/models/avatar_dance.glb',
    actionLabel: 'Dançar',
    actionBusyLabel: 'A dançar…',
    actionDurationMs: 21000,
  },
  spiderman: {
    id: 'spiderman',
    label: 'Spiderman',
    idleUrl: '/models/spiderman.glb',
    actionUrl: '/models/spiderman_cheer.glb',
    actionLabel: 'Torcer',
    actionBusyLabel: 'A torcer…',
    actionDurationMs: 2800,
    scale: 94,
  },
}

export const CHARACTER_IDS = Object.keys(CHARACTERS)

export function parseCharacterId(raw) {
  if (typeof raw === 'string' && CHARACTERS[raw]) return raw
  return 'modelo3'
}

export function getHomeCharacter() {
  try {
    return parseCharacterId(localStorage.getItem(HOME_CHARACTER_KEY))
  } catch {
    return 'modelo3'
  }
}

export function setHomeCharacter(id) {
  const next = parseCharacterId(id)
  try {
    localStorage.setItem(HOME_CHARACTER_KEY, next)
  } catch {
    /* ignore quota / private mode */
  }
  window.dispatchEvent(new CustomEvent(HOME_CHARACTER_EVENT, { detail: next }))
  return next
}
