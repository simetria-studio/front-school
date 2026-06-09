import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchFigurinhas } from '../api/endpoints'
import GameSchoolHeader from '../components/GameSchoolHeader'
import { formatNumberPt } from '../lib/gameStats'
import { parseFigurinhasResponse } from '../lib/figurinhaDisplay'
import './Figurinhas.css'

const FILTERS = [
  { id: 'todas', label: 'Todas' },
  { id: 'possui', label: 'Coleccionadas' },
  { id: 'faltam', label: 'Faltam' },
]

function AlbumProgress({ resumo }) {
  if (!resumo) return null

  const pct = Math.min(100, Math.max(0, resumo.percentual ?? 0))

  return (
    <section className="gs-fig-progress" aria-label="Progresso do álbum">
      <div className="gs-fig-progress-head">
        <span className="gs-fig-progress-label">Álbum completo</span>
        <span className="gs-fig-progress-pct">{formatNumberPt(pct)}%</span>
      </div>
      <div
        className="gs-fig-progress-bar"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="gs-fig-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="gs-fig-progress-stats">
        <div className="gs-fig-stat">
          <span className="gs-fig-stat-val">{resumo.possui ?? 0}</span>
          <span className="gs-fig-stat-label">Tens</span>
        </div>
        <div className="gs-fig-stat">
          <span className="gs-fig-stat-val">{resumo.faltam ?? 0}</span>
          <span className="gs-fig-stat-label">Faltam</span>
        </div>
        <div className="gs-fig-stat">
          <span className="gs-fig-stat-val">{resumo.total ?? 0}</span>
          <span className="gs-fig-stat-label">Total</span>
        </div>
      </div>
    </section>
  )
}

function FigurinhaSlot({ figurinha, index }) {
  const { numero, titulo, possui, quantidade, imagemExibicaoUrl } = figurinha

  return (
    <article
      className={`gs-fig-slot${possui ? ' gs-fig-slot--owned' : ' gs-fig-slot--locked'}`}
      style={{ '--slot-delay': `${Math.min(index, 12) * 0.03}s` }}
      title={titulo}
    >
      <span className="gs-fig-slot-num" aria-hidden>
        #{numero}
      </span>

      <div className="gs-fig-slot-visual">
        {imagemExibicaoUrl ? (
          <img
            src={imagemExibicaoUrl}
            alt=""
            className="gs-fig-slot-img"
            loading="lazy"
          />
        ) : (
          <span className="gs-fig-slot-placeholder" aria-hidden>
            {possui ? '✨' : '?'}
          </span>
        )}
        {!possui ? <span className="gs-fig-slot-lock" aria-hidden /> : null}
      </div>

      <span className="gs-fig-slot-name">{titulo}</span>

      {possui && quantidade > 1 ? (
        <span className="gs-fig-slot-qty">×{quantidade}</span>
      ) : null}
    </article>
  )
}

function FigurinhasSkeleton() {
  return (
    <div className="gs-fig-loading" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="gs-fig-skeleton" />
      ))}
    </div>
  )
}

export default function Figurinhas() {
  const [filter, setFilter] = useState('todas')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['figurinhas'],
    queryFn: () => fetchFigurinhas(),
    select: parseFigurinhasResponse,
  })

  const resumo = data?.resumo
  const alunoNome = data?.aluno?.nome

  const figurinhas = useMemo(() => {
    const list = Array.isArray(data?.figurinhas) ? data.figurinhas : []
    if (filter === 'possui') return list.filter((f) => f.possui)
    if (filter === 'faltam') return list.filter((f) => !f.possui)
    return list
  }, [data?.figurinhas, filter])

  return (
    <div className="gs-fig-page">
      <GameSchoolHeader />

      <div className="gs-fig-body">
        <div className="gs-fig-top">
          <Link to="/conta" className="gs-fig-back" aria-label="Voltar">
            ←
          </Link>
          <div className="gs-fig-title-wrap">
            <h1 className="gs-fig-title">ÁLBUM</h1>
            <p className="gs-fig-subtitle">
              {alunoNome ? `Coleção de ${alunoNome}` : 'Coleção de figurinhas'}
            </p>
          </div>
        </div>

        <div className="gs-fig-scroll">
          {!isLoading && resumo ? <AlbumProgress resumo={resumo} /> : null}

          <div className="gs-fig-filters" role="tablist" aria-label="Filtrar figurinhas">
            {FILTERS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={filter === id}
                className={`gs-fig-filter${filter === id ? ' gs-fig-filter--active' : ''}`}
                onClick={() => setFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <FigurinhasSkeleton />
          ) : isError ? (
            <div className="gs-fig-empty">
              <div className="gs-fig-empty-icon" aria-hidden>
                📖
              </div>
              <p className="gs-fig-empty-text">
                Não foi possível carregar o álbum.
              </p>
              <button
                type="button"
                className="gs-btn gs-btn--primary"
                onClick={() => refetch()}
              >
                Tentar novamente
              </button>
            </div>
          ) : figurinhas.length === 0 ? (
            <div className="gs-fig-empty">
              <div className="gs-fig-empty-icon" aria-hidden>
                ✨
              </div>
              <p className="gs-fig-empty-text">
                {filter === 'faltam'
                  ? 'Parabéns! Já tens todas as figurinhas do álbum.'
                  : filter === 'possui'
                    ? 'Ainda não tens figurinhas. Ganha prémios na loja, roletas ou missões.'
                    : 'O álbum ainda não tem figurinhas configuradas.'}
              </p>
            </div>
          ) : (
            <div className="gs-fig-grid">
              {figurinhas.map((fig, i) => (
                <FigurinhaSlot
                  key={fig.id ?? `fig-${fig.numero}`}
                  figurinha={fig}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>

        <footer className="gs-fig-footer">
          <Link to="/inventario" className="gs-fig-footer-link">
            <span>Ver inventário</span>
            <span aria-hidden>›</span>
          </Link>
        </footer>
      </div>
    </div>
  )
}
