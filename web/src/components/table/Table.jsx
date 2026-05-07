// Table.jsx
export function Table({ columns, data, onRowClick, emptyText = 'Không có dữ liệu' }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{
                padding: '10px 14px',
                textAlign: 'left',
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontFamily: 'var(--font-display)',
                borderBottom: '1px solid var(--border)',
                whiteSpace: 'nowrap',
                ...col.headerStyle
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: 13
              }}>
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                style={{
                  borderBottom: '1px solid var(--border)',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background 0.15s',
                  animationDelay: `${i * 40}ms`,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {columns.map(col => (
                  <td key={col.key} style={{
                    padding: '12px 14px',
                    color: 'var(--text-secondary)',
                    verticalAlign: 'middle',
                    ...col.cellStyle
                  }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', padding: '12px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
      <span>Tổng {total} bản ghi</span>
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i + 1)}
            style={{
              width: 28, height: 28,
              background: page === i + 1 ? 'var(--accent)' : 'var(--bg-input)',
              color: page === i + 1 ? '#000' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'var(--font-display)',
              transition: 'all 0.15s',
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}