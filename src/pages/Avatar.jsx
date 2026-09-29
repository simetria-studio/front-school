import { useState } from 'react'
import { Link } from 'react-router-dom'
import AvatarViewer3D from '../components/AvatarViewer3D'
import { CHARACTERS, actionAt } from '../lib/characters3d'
import './Avatar.css'

export default function Avatar() {
  const spec = CHARACTERS.modelo4
  const [mood, setMood] = useState('idle')
  const [playToken, setPlayToken] = useState(0)
  const [actionIndex, setActionIndex] = useState(0)
  const action = actionAt(spec, actionIndex)
  const dancing = mood === 'dancing'

  return (
    <div className="gs-av-page">
      <div className="gs-av-body">
        <div className="gs-av-top">
          <Link to="/conta" className="gs-av-back" aria-label="Voltar">
            ‹
          </Link>
          <div className="gs-av-title-wrap">
            <h1 className="gs-av-title">Meu personagem</h1>
            <p className="gs-av-subtitle">
              Na home, uma animação toca sozinha a cada 1,5 min
            </p>
          </div>
        </div>

        <div className="gs-av-stage-wrap">
          <AvatarViewer3D
            characterId="modelo4"
            mood={mood}
            playToken={playToken}
            actionIndex={actionIndex}
            fill
            preloadAction
            enableTouch
            onActionFinished={() => {
              setMood('idle')
              setActionIndex((i) => i + 1)
            }}
          />
        </div>

        <div className="gs-av-actions">
          <button
            type="button"
            className="gs-btn gs-btn--primary gs-btn--block"
            disabled={!action || dancing}
            onClick={() => {
              setPlayToken((n) => n + 1)
              setMood('dancing')
            }}
          >
            {dancing ? 'A animar…' : action?.label || 'Animar'}
          </button>
        </div>
      </div>
    </div>
  )
}
