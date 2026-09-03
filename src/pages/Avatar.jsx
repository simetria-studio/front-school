import { useState } from 'react'
import { Link } from 'react-router-dom'
import AvatarViewer3D from '../components/AvatarViewer3D'
import { useHomeCharacter } from '../hooks/useHomeCharacter'
import { CHARACTER_IDS, CHARACTERS } from '../lib/characters3d'
import './Avatar.css'

export default function Avatar() {
  const [homeCharacter, selectCharacter] = useHomeCharacter()
  const [previewId, setPreviewId] = useState(homeCharacter)
  const [mood, setMood] = useState('idle')
  const [playToken, setPlayToken] = useState(0)
  const [msg, setMsg] = useState('')

  const spec = CHARACTERS[previewId] || CHARACTERS.modelo3
  const selected = homeCharacter === previewId
  const dancing = mood === 'dancing'

  function escolher(id) {
    setPreviewId(id)
    setMood('idle')
    setPlayToken(0)
    setMsg('')
  }

  function usarNaHome() {
    selectCharacter(previewId)
    setMsg(`${spec.label} selecionado`)
  }

  return (
    <div className="gs-av-page">
      <div className="gs-av-body">
        <div className="gs-av-top">
          <Link to="/conta" className="gs-av-back" aria-label="Voltar">
            ‹
          </Link>
          <div className="gs-av-title-wrap">
            <h1 className="gs-av-title">Meu personagem</h1>
            <p className="gs-av-subtitle">Escolhe o modelo 3D para a home</p>
          </div>
        </div>

        <div className="gs-av-stage-wrap">
          <AvatarViewer3D
            key={previewId}
            characterId={previewId}
            mood={mood}
            playToken={playToken}
            fill
            preloadAction
            enableTouch
            onActionFinished={() => setMood('idle')}
          />
        </div>

        <div className="gs-av-picker" role="tablist" aria-label="Personagens">
          {CHARACTER_IDS.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={previewId === id}
              className={previewId === id ? 'is-active' : ''}
              onClick={() => escolher(id)}
            >
              {CHARACTERS[id].label}
            </button>
          ))}
        </div>

        <div className="gs-av-actions">
          <button
            type="button"
            className="gs-btn gs-btn--primary gs-btn--block"
            disabled={!spec.actionUrl || dancing}
            onClick={() => {
              setPlayToken((n) => n + 1)
              setMood('dancing')
            }}
          >
            {dancing ? spec.actionBusyLabel : spec.actionLabel}
          </button>
          <button
            type="button"
            className="gs-btn gs-btn--secondary gs-btn--block"
            disabled={selected}
            onClick={usarNaHome}
          >
            {selected ? 'Personagem selecionado' : 'Selecionar personagem'}
          </button>
        </div>

        {msg ? <p className="gs-av-msg">{msg}</p> : null}
      </div>
    </div>
  )
}
