import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const CONFIG = {
  success: {
    icon:        <CheckCircle size={18} />,
    accent:      '#22c55e',
    accentDim:   'rgba(34,197,94,0.12)',
    accentBorder:'rgba(34,197,94,0.25)',
    label:       'Thành công',
  },
  error: {
    icon:        <XCircle size={18} />,
    accent:      '#ef4444',
    accentDim:   'rgba(239,68,68,0.12)',
    accentBorder:'rgba(239,68,68,0.25)',
    label:       'Thất bại',
  },
  info: {
    icon:        <Info size={18} />,
    accent:      '#3b82f6',
    accentDim:   'rgba(59,130,246,0.12)',
    accentBorder:'rgba(59,130,246,0.25)',
    label:       'Thông báo',
  },
};

export function Toast({ id, type = 'info', message, title, duration = 3500, onDismiss }) {
  const [visible,  setVisible]  = useState(false);
  const [progress, setProgress] = useState(100);

  const cfg = CONFIG[type] ?? CONFIG.info;

  // Mount animation
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Progress bar + auto-dismiss
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct > 0) raf = requestAnimationFrame(tick);
    };
    let raf = requestAnimationFrame(tick);

    const timer = setTimeout(() => handleDismiss(), duration);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
  }, [duration]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(id), 300);
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        padding: '14px 16px',
        paddingBottom: 18,
        background: 'var(--bg-card, #1a1f2e)',
        border: `1px solid ${cfg.accentBorder}`,
        borderLeft: `3px solid ${cfg.accent}`,
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        minWidth: 300,
        maxWidth: 400,
        overflow: 'hidden',
        cursor: 'default',
        // Slide in/out
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateX(0) scale(1)' : 'translateX(24px) scale(0.96)',
        transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34,1.3,0.64,1)',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
        background: cfg.accentDim,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: cfg.accent,
      }}>
        {cfg.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: cfg.accent, marginBottom: 2 }}>
          {title ?? cfg.label}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4, wordBreak: 'break-word' }}>
          {message}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        style={{
          width: 24, height: 24, borderRadius: 6, flexShrink: 0,
          border: 'none', background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted, #64748b)', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted, #64748b)'; }}
      >
        <X size={14} />
      </button>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        height: 3, borderRadius: '0 0 0 12px',
        background: cfg.accent,
        opacity: 0.6,
        width: `${progress}%`,
        transition: 'width 0.1s linear',
      }} />
    </div>
  );
}