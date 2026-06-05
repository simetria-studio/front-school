import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { computeWheelRotation } from '../lib/roletaDisplay'
import './RoletaWheel.css'

const CX = 100
const CY = 100
const RIM = 92

function labelRotation(midDeg) {
  const n = ((midDeg % 360) + 360) % 360
  return n > 90 && n < 270 ? midDeg + 180 : midDeg
}

function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180 - Math.PI / 2
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function segmentPath(startDeg, endDeg) {
  const p1 = polar(CX, CY, RIM, startDeg)
  const p2 = polar(CX, CY, RIM, endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${CX} ${CY} L ${p1.x} ${p1.y} A ${RIM} ${RIM} 0 ${large} 1 ${p2.x} ${p2.y} Z`
}

function shadeColor(color, amount) {
  if (!color || typeof color !== 'string') return '#78909c'
  const c = color.trim()
  if (!c.startsWith('#')) return c

  let h = c.slice(1)
  if (h.length === 3) h = h.split('').map((ch) => ch + ch).join('')
  if (h.length !== 6 || Number.isNaN(parseInt(h, 16))) return c

  const num = parseInt(h, 16)
  const r = Math.min(255, Math.max(0, ((num >> 16) & 255) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 255) + amount))
  const b = Math.min(255, Math.max(0, (num & 255) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function segmentFill(s, uid) {
  if (String(s.color).startsWith('#')) {
    return `url(#${uid}-seg-${s.i})`
  }
  return s.color
}

function stripEmojiPrefix(text) {
  return String(text ?? '')
    .replace(/^[\p{Extended_Pictographic}\uFE0F\s]+/u, '')
    .trim()
}

function splitLabelLines(text, segmentCount) {
  const clean = stripEmojiPrefix(text) || String(text ?? '').trim() || '?'
  const maxLines = 2
  const maxPerLine =
    segmentCount <= 4 ? 14 : segmentCount <= 6 ? 10 : segmentCount <= 8 ? 8 : 6

  if (clean.length <= maxPerLine) return [clean]

  const words = clean.split(/\s+/).filter(Boolean)
  const lines = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxPerLine) {
      current = candidate
      continue
    }
    if (current) {
      lines.push(current)
      current = word
    } else {
      lines.push(
        word.length > maxPerLine
          ? `${word.slice(0, maxPerLine - 1)}…`
          : word,
      )
      current = ''
    }
    if (lines.length >= maxLines) break
  }

  if (lines.length < maxLines && current) lines.push(current)

  if (lines.length > maxLines) {
    const merged = lines.slice(0, maxLines - 1)
    const rest = lines.slice(maxLines - 1).join(' ')
    merged.push(
      rest.length > maxPerLine
        ? `${rest.slice(0, maxPerLine - 1)}…`
        : rest,
    )
    return merged
  }

  if (lines.length === maxLines) {
    const last = lines[maxLines - 1]
    if (last.length > maxPerLine + 2) {
      lines[maxLines - 1] = `${last.slice(0, maxPerLine - 1)}…`
    }
  }

  return lines.length ? lines : [clean.slice(0, maxPerLine)]
}

function buildWheelLabel(seg, segmentCount) {
  const name = seg.shortLabel ?? stripEmojiPrefix(seg.label) ?? '?'
  const emoji = seg.emoji && !seg.imageUrl ? seg.emoji : null
  const crowded = segmentCount >= 6

  if (emoji) {
    if (crowded && name.length > 10) {
      return { lines: [emoji], fontScale: 1.5 }
    }
    const shortName = name.length > 9 ? `${name.slice(0, 8)}…` : name
    return { lines: [emoji, shortName], fontScale: 1 }
  }

  return { lines: splitLabelLines(name, segmentCount), fontScale: 1 }
}

function labelFontSize(segmentCount, lineCount, maxLineLen, fontScale = 1) {
  let size = nFontSize(segmentCount)
  if (lineCount >= 2) size -= 1.25
  if (maxLineLen > 8) size -= 0.75
  if (maxLineLen > 11) size -= 0.75
  return Math.max(5.25, size * fontScale)
}

function WheelSegmentLabel({ slice, segmentCount, clipId }) {
  const { lines, fontScale = 1 } = buildWheelLabel(slice, segmentCount)
  const maxLen = Math.max(...lines.map((l) => l.length), 1)
  const isEmojiOnly = lines.length === 1 && lines[0] === slice.emoji
  const fontSize = labelFontSize(
    segmentCount,
    lines.length,
    maxLen,
    isEmojiOnly ? 1.45 : fontScale,
  )
  const lineHeight = fontSize * 1.12
  const { x, y } = slice.labelPos
  const rotation = labelRotation(slice.midDeg)
  const startDy = -((lines.length - 1) * lineHeight) / 2

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      fontSize={fontSize}
      fontWeight="800"
      textAnchor="middle"
      dominantBaseline="middle"
      clipPath={`url(#${clipId})`}
      transform={`rotate(${rotation}, ${x}, ${y})`}
      className="gs-roleta-wheel-svg-text"
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? startDy : lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

function WheelPointer() {
  return (
    <svg
      viewBox="0 0 40 52"
      aria-hidden
      className="gs-roleta-wheel-pointer-svg"
    >
      <defs>
        <linearGradient id="gsPtrFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff5252" />
          <stop offset="100%" stopColor="#b71c1c" />
        </linearGradient>
        <filter id="gsPtrGlow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#e53935" floodOpacity="0.8" />
        </filter>
      </defs>
      <path
        d="M20 4 L36 44 Q20 38 4 44 Z"
        fill="url(#gsPtrFill)"
        stroke="#ffd54f"
        strokeWidth="2.5"
        strokeLinejoin="round"
        filter="url(#gsPtrGlow)"
      />
      <ellipse cx="20" cy="42" rx="6" ry="3" fill="rgba(0,0,0,0.2)" />
    </svg>
  )
}

export default function RoletaWheel({
  segments = [],
  spinning = false,
  targetIndex = null,
  onSpinEnd,
}) {
  const uid = useId().replace(/:/g, '')
  const [rotation, setRotation] = useState(0)
  const rotationRef = useRef(0)
  const prevSpinning = useRef(false)

  const safeSegments = useMemo(
    () =>
      segments.length > 0
        ? segments
        : [{ id: 'empty', label: '?', color: '#78909c' }],
    [segments],
  )

  const slices = useMemo(() => {
    const n = safeSegments.length
    const step = 360 / n
    return safeSegments.map((seg, i) => {
      const startDeg = i * step
      const endDeg = (i + 1) * step
      const midDeg = startDeg + step / 2
      const labelPos = polar(CX, CY, RIM * 0.66, midDeg)
      const pegPos = polar(CX, CY, RIM - 2, endDeg)
      return {
        ...seg,
        i,
        startDeg,
        endDeg,
        midDeg,
        path: segmentPath(startDeg, endDeg),
        labelPos,
        pegPos,
        light: shadeColor(seg.color, 38),
        dark: shadeColor(seg.color, -42),
      }
    })
  }, [safeSegments])

  useEffect(() => {
    if (spinning && !prevSpinning.current && targetIndex != null) {
      const next = computeWheelRotation(
        targetIndex,
        safeSegments.length,
        rotationRef.current,
      )
      rotationRef.current = next
      setRotation(next)
    }
    prevSpinning.current = spinning
  }, [spinning, targetIndex, safeSegments.length])

  function handleTransitionEnd(e) {
    if (e.propertyName !== 'transform' || !spinning) return
    onSpinEnd?.()
  }

  return (
    <div className={`gs-roleta-wheel-wrap${spinning ? ' is-spinning' : ''}`}>
      <div className="gs-roleta-wheel-aura" aria-hidden />
      <div className="gs-roleta-wheel-frame">
        <div className="gs-roleta-wheel-lights" aria-hidden>
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              className="gs-roleta-wheel-light"
              style={{ transform: `rotate(${i * 22.5}deg) translateY(-49%)` }}
            />
          ))}
        </div>

        <div className="gs-roleta-wheel-pointer">
          <WheelPointer />
        </div>

        <div
          className="gs-roleta-wheel-spin"
          style={{ transform: `rotate(${rotation}deg)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          <svg viewBox="0 0 200 200" className="gs-roleta-wheel-svg" aria-hidden>
            <defs>
              {slices
                .filter((s) => String(s.color).startsWith('#'))
                .map((s) => (
                  <linearGradient
                    key={`g-${s.i}`}
                    id={`${uid}-seg-${s.i}`}
                    x1="30%"
                    y1="20%"
                    x2="80%"
                    y2="90%"
                  >
                    <stop offset="0%" stopColor={s.light} />
                    <stop offset="55%" stopColor={s.color} />
                    <stop offset="100%" stopColor={s.dark} />
                  </linearGradient>
                ))}
              <radialGradient id={`${uid}-inner-shadow`} cx="50%" cy="50%" r="50%">
                <stop offset="55%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.28)" />
              </radialGradient>
              {slices.map((s) => (
                <clipPath key={`clip-${s.i}`} id={`${uid}-clip-${s.i}`}>
                  <path d={s.path} />
                </clipPath>
              ))}
            </defs>

            <circle cx={CX} cy={CY} r={RIM + 2} fill="#5d0000" />
            <circle cx={CX} cy={CY} r={RIM} fill="#1a0505" />

            {slices.map((s) => (
              <path
                key={s.id ?? s.i}
                d={s.path}
                fill={segmentFill(s, uid)}
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            ))}

            {slices.map((s) => (
              <circle
                key={`peg-${s.i}`}
                cx={s.pegPos.x}
                cy={s.pegPos.y}
                r="2.2"
                fill="#fff"
                stroke="#ffd54f"
                strokeWidth="0.8"
              />
            ))}

            {slices.map((s) => (
              <WheelSegmentLabel
                key={`lbl-${s.i}`}
                slice={s}
                segmentCount={safeSegments.length}
                clipId={`${uid}-clip-${s.i}`}
              />
            ))}

            <circle
              cx={CX}
              cy={CY}
              r={RIM}
              fill={`url(#${uid}-inner-shadow)`}
              pointerEvents="none"
              opacity="0.85"
            />
          </svg>

          <div className="gs-roleta-wheel-hub" aria-hidden>
            <span className="gs-roleta-wheel-hub-star">★</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function nFontSize(count) {
  if (count <= 6) return 11
  if (count <= 8) return 9.5
  if (count <= 12) return 8
  return 7
}
