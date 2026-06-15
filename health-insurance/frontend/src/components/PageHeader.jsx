import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, subtitle, back = true, right }) {
  const navigate = useNavigate()
  return (
    <div
      className="px-5 pt-12 pb-5 sticky top-0 z-30"
      style={{ background: 'var(--surface-0)', borderBottom: '1px solid var(--border)' }}
    >
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm mb-3 -ml-1 transition-colors"
          style={{ color: 'var(--ink-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-muted)'}
        >
          <span className="icon-o text-xl">arrow_back</span>
          <span className="font-display font-medium">Back</span>
        </button>
      )}
      <div className="flex items-end justify-between">
        <div>
          <h1
            className="font-display font-extrabold text-2xl leading-tight"
            style={{ color: 'var(--ink)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--ink-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {right && <div>{right}</div>}
      </div>
    </div>
  )
}