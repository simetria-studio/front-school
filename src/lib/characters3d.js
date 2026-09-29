export const HOME_CHARACTER_KEY = 'home_character'
export const HOME_CHARACTER_EVENT = 'gs-home-character'
export const ACTION_EVERY_MS = 90_000

export const CHARACTERS = {
  modelo4: {
    id: 'modelo4',
    label: 'Modelo 4',
    idleUrl: '/models/modelo4/idle.fbx',
    homeIdleUrl: '/models/modelo4/arm-stretching.fbx',
    actions: [
      {
        url: '/models/modelo4/arm-stretching.fbx',
        label: 'Alongar',
        durationMs: 8000,
      },
      {
        url: '/models/modelo4/capoeira.fbx',
        label: 'Capoeira',
        durationMs: 14000,
      },
      {
        url: '/models/modelo4/dancing.fbx',
        label: 'Dançar',
        durationMs: 12000,
      },
      {
        url: '/models/modelo4/house-dancing.fbx',
        label: 'House',
        durationMs: 14000,
      },
      {
        url: '/models/modelo4/hip-hop.fbx',
        label: 'Hip hop',
        durationMs: 12000,
      },
    ],
  },
}

export const CHARACTER_IDS = Object.keys(CHARACTERS)

export function parseCharacterId() {
  return 'modelo4'
}

export function getHomeCharacter() {
  return 'modelo4'
}

export function setHomeCharacter() {
  const next = 'modelo4'
  try {
    localStorage.setItem(HOME_CHARACTER_KEY, next)
  } catch {
    /* ignore quota / private mode */
  }
  window.dispatchEvent(new CustomEvent(HOME_CHARACTER_EVENT, { detail: next }))
  return next
}

export function actionAt(spec, actionIndex) {
  const list = spec?.actions || []
  if (!list.length) return null
  const index = ((actionIndex % list.length) + list.length) % list.length
  return list[index]
}
