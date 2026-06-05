import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchInventario } from '../api/endpoints'
import GameSchoolHeader from '../components/GameSchoolHeader'
import {
  inventarioCategoriaIcon,
  inventarioTipoLabel,
  parseInventarioResponse,
} from '../lib/inventarioDisplay'
import './Inventario.css'

function InventarioItem({ item, index }) {
  const {
    id,
    name,
    emoji,
    quantidade,
    imageUrl,
    raridade,
    raridadeLabel,
    podeEnviar,
  } = item
  const rarityKey = raridade || 'comum'

  return (
    <article
      className={`gs-inv-card gs-inv-card--${rarityKey}`}
      style={{ '--card-delay': `${Math.min(index, 8) * 0.04}s` }}
    >
      {raridadeLabel ? (
        <div className={`gs-inv-card-rarity gs-inv-card-rarity--${rarityKey}`}>
          {raridadeLabel}
        </div>
      ) : null}

      <div className="gs-inv-card-visual">
        {quantidade > 1 ? (
          <span className="gs-inv-card-qty">×{quantidade}</span>
        ) : null}
        {imageUrl ? (
          <img src={imageUrl} alt="" className="gs-inv-card-img" />
        ) : (
          <span className="gs-inv-card-emoji" aria-hidden>
            {emoji}
          </span>
        )}
      </div>

      <div className="gs-inv-card-foot">
        <span className="gs-inv-card-name">{name}</span>
        {podeEnviar ? (
          <Link to={`/presentes?item=${id ?? ''}`} className="gs-inv-card-send">
            <span aria-hidden>🎁</span> Enviar
          </Link>
        ) : null}
      </div>
    </article>
  )
}

function InventarioCategoria({ categoria, catIndex }) {
  if (!categoria.itens.length) return null

  return (
    <section
      className="gs-inv-cat"
      aria-label={categoria.titulo}
      style={{ '--delay': `${catIndex * 0.06}s` }}
    >
      <header className="gs-inv-cat-head">
        <span className="gs-inv-cat-icon" aria-hidden>
          {inventarioCategoriaIcon(categoria.tipo)}
        </span>
        <div className="gs-inv-cat-text">
          <h3>{categoria.titulo}</h3>
          <span className="gs-inv-cat-meta">
            {categoria.unicos} {categoria.unicos === 1 ? 'único' : 'únicos'}
            {categoria.total !== categoria.unicos
              ? ` · ${categoria.total} no total`
              : ''}
          </span>
        </div>
      </header>
      <div className="gs-inv-grid">
        {categoria.itens.map((item, i) => (
          <InventarioItem
            key={item.id ?? `${categoria.tipo}-${i}`}
            item={item}
            index={i}
          />
        ))}
      </div>
    </section>
  )
}

function InventarioStats({ resumo }) {
  if (!resumo) return null

  const porTipo = resumo.por_tipo && typeof resumo.por_tipo === 'object'
    ? Object.entries(resumo.por_tipo)
    : []

  return (
    <>
      <div className="gs-inv-stats">
        <div className="gs-inv-stat">
          <span className="gs-inv-stat-val">{resumo.total_quantidade ?? 0}</span>
          <span className="gs-inv-stat-label">
            {(resumo.total_quantidade ?? 0) === 1 ? 'Item' : 'Itens'}
          </span>
        </div>
        <div className="gs-inv-stat">
          <span className="gs-inv-stat-val">{resumo.total_unicos ?? 0}</span>
          <span className="gs-inv-stat-label">
            {(resumo.total_unicos ?? 0) === 1 ? 'Tipo' : 'Tipos'}
          </span>
        </div>
      </div>

      {porTipo.length > 0 ? (
        <div className="gs-inv-chips" aria-label="Por categoria">
          {porTipo.map(([tipo, info]) => (
            <span key={tipo} className="gs-inv-chip">
              {inventarioTipoLabel(tipo)} · {info?.quantidade ?? 0}
            </span>
          ))}
        </div>
      ) : null}
    </>
  )
}

function InventarioSkeleton() {
  return (
    <div className="gs-inv-loading" aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="gs-inv-skeleton" />
      ))}
    </div>
  )
}

export default function Inventario() {
  const { data, isLoading } = useQuery({
    queryKey: ['inventario'],
    queryFn: () => fetchInventario(),
    select: parseInventarioResponse,
  })

  const resumo = data?.resumo
  const categorias = Array.isArray(data?.categorias) ? data.categorias : []
  const hasItems = categorias.some((cat) => cat.itens.length > 0)

  return (
    <div className="gs-inv-page">
      <GameSchoolHeader />

      <div className="gs-inv-body">
        <div className="gs-inv-top">
          <Link to="/conta" className="gs-inv-back" aria-label="Voltar">
            ←
          </Link>
          <div className="gs-inv-title-wrap">
            <h1 className="gs-inv-title">INVENTÁRIO</h1>
            <p className="gs-inv-subtitle">A tua coleção de prémios</p>
          </div>
        </div>

        <div className="gs-inv-scroll">
          {!isLoading && resumo ? <InventarioStats resumo={resumo} /> : null}

          {isLoading ? (
            <InventarioSkeleton />
          ) : !hasItems ? (
            <div className="gs-inv-empty">
              <div className="gs-inv-empty-icon" aria-hidden>
                🎒
              </div>
              <h2 className="gs-inv-empty-title">Ainda está vazio</h2>
              <p className="gs-inv-empty-text">
                Gira a roleta ou completa missões para começares a encher a tua
                coleção.
              </p>
              <Link to="/roletas" className="gs-inv-empty-link">
                Ir para roletas →
              </Link>
            </div>
          ) : (
            categorias.map((cat, i) => (
              <InventarioCategoria
                key={cat.tipo || cat.titulo}
                categoria={cat}
                catIndex={i}
              />
            ))
          )}
        </div>

        <footer className="gs-inv-footer">
          <Link to="/presentes" className="gs-inv-presentes-cta">
            <span>
              <span className="gs-inv-presentes-cta-label">Presentes</span>
              <span className="gs-inv-presentes-cta-sub">
                Enviar ou ver recebidos
              </span>
            </span>
            <span className="gs-inv-presentes-chevron" aria-hidden>
              ›
            </span>
          </Link>
        </footer>
      </div>
    </div>
  )
}
