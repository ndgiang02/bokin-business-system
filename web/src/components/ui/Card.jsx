// Card.jsx
export function Card({ children, className = '', style = {} }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function StatCard({ icon, label, value, color = 'amber', change, changeDir = 'up', delay = 0 }) {
  return (
    <div className={`stat-card ${color}`} style={{ animationDelay: `${delay}ms` }}>
      <div className={`stat-icon-wrap ${color}`}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {change && (
        <div className={`stat-change ${changeDir}`}>
          {changeDir === 'up' ? '↑' : '↓'} {change}
        </div>
      )}
    </div>
  );
}