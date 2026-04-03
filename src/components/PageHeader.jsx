import { Link } from 'react-router-dom'

export default function PageHeader({ title, backTo, right }) {
  return (
    <header className="gs-page-header">
      <div className="gs-page-header-row">
        {backTo ? (
          <Link to={backTo} className="gs-back">
            ←
          </Link>
        ) : (
          <span className="gs-back-spacer" />
        )}
        <h1 className="gs-page-title">{title}</h1>
        <span className="gs-page-header-right">{right}</span>
      </div>
    </header>
  )
}
