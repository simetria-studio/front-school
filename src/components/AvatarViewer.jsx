const SLOT_ORDER = [
  'base',
  'sombra',
  'calcado',
  'roupa_inferior',
  'roupa_superior',
  'rosto',
  'cabelo',
  'acessorio_cabeca',
  'acessorio_rosto',
  'acessorio_outro',
]

/**
 * Viewer em camadas PNG/SVG — ordem alinhada ao sheet de arte.
 */
export default function AvatarViewer({ slots, className = '', size = 220 }) {
  const layers = SLOT_ORDER.map((slot) => {
    const peca = slots?.[slot]
    if (!peca?.asset_url) return null
    const z = peca.meta?.z_index ?? SLOT_ORDER.indexOf(slot) + 1
    return (
      <img
        key={`${slot}-${peca.id}`}
        className="gs-avatar-layer"
        src={peca.asset_url}
        alt=""
        style={{ zIndex: z }}
        draggable={false}
      />
    )
  }).filter(Boolean)

  return (
    <div
      className={`gs-avatar-viewer ${className}`.trim()}
      style={{ width: size, height: Math.round(size * 1.6) }}
      aria-hidden={layers.length === 0}
    >
      <div className="gs-avatar-viewer__stage">
        {layers.length ? (
          layers
        ) : (
          <div className="gs-avatar-viewer__empty">?</div>
        )}
      </div>
    </div>
  )
}

export { SLOT_ORDER }
