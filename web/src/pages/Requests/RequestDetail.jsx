import { useState, useEffect } from 'react';
import {
  X, Download, Calendar, Clock, User, Package, Film, Hash, Tag,
  FileText, Image as ImageIcon, ChevronRight, Loader2, Video, Music,
  File, RotateCcw, UserCheck, CheckCircle, XCircle, AlertTriangle,
  Shield, Eye, Paperclip, History, Info, Zap,
} from 'lucide-react';
import { hasPermission } from '../../utils/roleUtils.js';
import RevisionModal from './RevisionModal.jsx';
import AssignModal   from './AssignModal.jsx';
import { requestStore } from '../../store/requestStore';
import { authStore }     from '../../store/authStore.js';
import { ROLES }         from '../../utils/roleUtils.js';
import './css/request-detail.css';

// ── Helpers ────────────────────────────────────────────────
function fixUrl(url) {
  if (!url) return url;
  return url.replace('http://minio:9000', 'http://localhost:9000');
}

const STATUS_CONFIG = {
  pending:     { label: 'Chờ Duyệt',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  dot: '#f59e0b' },
  processing: { label: 'Đang Xử Lý', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  dot: '#3b82f6' },
  done:        { label: 'Hoàn Thành', color: '#10b981', bg: 'rgba(16,185,129,0.12)',   dot: '#10b981' },
  revision:    { label: 'Làm Lại',    color: '#f97316', bg: 'rgba(249,115,22,0.12)',   dot: '#f97316' },
  approved:    { label: 'Đã Duyệt',   color: '#6366f1', bg: 'rgba(99,102,241,0.12)',   dot: '#6366f1' },
  rejected:    { label: 'Từ Chối',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    dot: '#ef4444' },
  cancelled:   { label: 'Đã Huỷ',    color: '#6b7280', bg: 'rgba(107,114,128,0.12)',  dot: '#6b7280' },
};

const PRIORITY_CONFIG = {
  urgent: { label: 'Khẩn Cấp',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: '🔴' },
  high:   { label: 'Cao',        color: '#f97316', bg: 'rgba(249,115,22,0.12)',  icon: '🟠' },
  medium: { label: 'Trung Bình', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '🟡' },
  low:    { label: 'Thấp',       color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '🟢' },
};

const QUALITY_LABELS = {
  '4k': '4K Ultra HD',
  '1080p': '1080p Full HD',
  '720p': '720p HD',
  '480p': '480p SD',
};

function formatBytes(b) {
  if (!b) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('vi-VN');
}

function getFileIcon(mimeType, size = 16) {
  if (mimeType?.startsWith('image/'))  return <ImageIcon size={size} color="#3b82f6" />;
  if (mimeType?.startsWith('video/'))  return <Video     size={size} color="#8b5cf6" />;
  if (mimeType?.startsWith('audio/'))  return <Music     size={size} color="#06b6d4" />;
  if (mimeType?.includes('pdf'))       return <FileText  size={size} color="#ef4444" />;
  if (mimeType?.includes('word') || mimeType?.includes('doc')) return <FileText size={size} color="#3b82f6" />;
  if (mimeType?.includes('excel') || mimeType?.includes('sheet')) return <FileText size={size} color="#10b981" />;
  return <File size={size} color="#6b7280" />;
}

// ── Status Badge ──────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: '#6b7280', bg: 'rgba(107,114,128,0.12)', dot: '#6b7280' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.4px',
      border: `1px solid ${cfg.color}30`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}` }} />
      {cfg.label}
    </span>
  );
}

// ── Priority Badge ────────────────────────────────────────
function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || { label: priority, color: '#6b7280', bg: 'rgba(107,114,128,0.12)', icon: '⚪' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.4px',
      border: `1px solid ${cfg.color}30`,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ── Confirm Dialog ────────────────────────────────────────
function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel, confirmColor = '#ef4444', icon, isLoading }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 600,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-card, #1e1e2e)',
        border: '1px solid var(--border, #2d2d3d)',
        borderRadius: 16, padding: '28px 32px',
        width: 380, boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        animation: 'modalIn 0.2s ease',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: `${confirmColor}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${confirmColor}40`,
          }}>
            {icon}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary, #fff)', marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted, #888)', lineHeight: 1.5 }}>{message}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 4 }}>
            <button onClick={onClose} disabled={isLoading} style={{
              flex: 1, padding: '10px 0', borderRadius: 10,
              border: '1px solid var(--border, #2d2d3d)',
              background: 'transparent', color: 'var(--text-secondary, #aaa)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              Huỷ
            </button>
            <button onClick={onConfirm} disabled={isLoading} style={{
              flex: 1, padding: '10px 0', borderRadius: 10,
              border: 'none', background: confirmColor, color: '#fff',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              opacity: isLoading ? 0.7 : 1,
            }}>
              {isLoading ? <Loader2 size={14} className="spin" /> : null}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── File Preview ──────────────────────────────────────────
function FilePreview({ file }) {
  const [zoom, setZoom] = useState(false);
  const url   = fixUrl(file.url);
  const isImg = file.fileType === 'image' || file.mimeType?.startsWith('image/');

  return (
    <>
      <div
        onClick={() => setZoom(true)}
        title={file.name}
        style={{
          width: 72, height: 72, borderRadius: 10, overflow: 'hidden',
          border: '1px solid var(--border, #2d2d3d)', cursor: 'pointer', flexShrink: 0,
          background: 'var(--bg-secondary, #161622)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 4, transition: 'all 0.2s',
          position: 'relative',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.06)';
          e.currentTarget.style.borderColor = 'var(--accent, #6366f1)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.25)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.borderColor = 'var(--border, #2d2d3d)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {isImg ? (
          <img src={url} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
        ) : (
          <>
            {getFileIcon(file.mimeType, 22)}
            <span style={{ fontSize: 8, color: 'var(--text-muted)', textAlign: 'center', padding: '0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', fontWeight: 700, letterSpacing: '0.5px' }}>
              {file.name?.split('.').pop()?.toUpperCase()}
            </span>
          </>
        )}
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
          transition: 'background 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; }}
        >
          <Eye size={16} color="#fff" style={{ opacity: 0, transition: 'opacity 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = 1; }}
          />
        </div>
      </div>

      {zoom && (
        <div onClick={() => setZoom(false)} style={{
          position: 'fixed', inset: 0, zIndex: 700,
          background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
        }}>
          {isImg ? (
            <img src={url} alt={file.name} onClick={e => e.stopPropagation()} style={{ maxWidth: '88vw', maxHeight: '78vh', borderRadius: 12, boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }} />
          ) : (
            <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '32px 48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              {getFileIcon(file.mimeType, 48)}
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatBytes(file.size)}</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }} onClick={e => e.stopPropagation()}>
            <a href={url} download={file.name} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 8,
              background: 'var(--accent, #6366f1)', color: '#fff',
              fontSize: 13, fontWeight: 600, textDecoration: 'none',
            }}>
              <Download size={14} /> Tải về
            </a>
            <button onClick={() => setZoom(false)} style={{
              padding: '8px 18px', borderRadius: 8,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', cursor: 'pointer', fontSize: 13,
            }}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Section Header ────────────────────────────────────────
function SectionHeader({ icon, title, count }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      marginBottom: 12,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'var(--accent-dim, rgba(99,102,241,0.12))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--accent, #6366f1)',
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #fff)' }}>
        {title}
      </span>
      {count != null && (
        <span style={{
          fontSize: 11, fontWeight: 700,
          background: 'var(--accent-dim, rgba(99,102,241,0.15))',
          color: 'var(--accent, #6366f1)',
          padding: '1px 7px', borderRadius: 10,
        }}>
          {count}
        </span>
      )}
    </div>
  );
}

// ── Info Card ─────────────────────────────────────────────
function InfoCard({ label, icon, children }) {
  return (
    <div style={{
      background: 'var(--bg-input, #161622)',
      border: '1px solid var(--border, #2d2d3d)',
      borderRadius: 10, padding: '10px 14px',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-dim, rgba(99,102,241,0.4))'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border, #2d2d3d)'}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 10, color: 'var(--text-muted, #666)',
        fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.6px', marginBottom: 6,
      }}>
        <span style={{ color: 'var(--accent, #6366f1)', opacity: 0.8 }}>{icon}</span>
        {label}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-primary, #fff)', fontWeight: 500 }}>
        {children ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}
      </div>
    </div>
  );
}

// ── Action Button ─────────────────────────────────────────
function ActionButton({ icon, label, onClick, color, outline, disabled, isLoading }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '9px 16px', borderRadius: 10,
        border: outline ? `1.5px solid ${color}60` : 'none',
        background: outline
          ? (hover ? `${color}18` : `${color}0c`)
          : (hover ? `${color}ee` : color),
        color: outline ? color : '#fff',
        fontSize: 13, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.18s', opacity: disabled ? 0.45 : 1,
        whiteSpace: 'nowrap',
        boxShadow: !outline && hover ? `0 4px 14px ${color}50` : 'none',
      }}
    >
      {isLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : icon}
      {label}
    </button>
  );
}

// ── Main Component ────────────────────────────────────────
export default function RequestDetail({ selected, onClose }) {
  const [request,      setRequest]      = useState(null);
  const [showRevision, setShowRevision] = useState(false);
  const [showAssign,   setShowAssign]   = useState(false);
  const [confirm,      setConfirm]      = useState(null); // { type: 'complete' | 'cancel' | 'approve' | 'reject' }
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab,    setActiveTab]    = useState('info'); // 'info' | 'files' | 'history'

  const { getRequestById, updateStatus } = requestStore();
  const { user } = authStore();
  const [updating, setUpdating] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      const d = await getRequestById(selected);
      setRequest(d?.data || d);
    };
    fetchData();
  }, [selected]);

  if (request == null) {
    return (
      <div className="rd-backdrop" onClick={onClose}>
        <div className="rd-modal" onClick={e => e.stopPropagation()} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 12, minHeight: 240,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(99,102,241,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Loader2 size={22} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  // ── Permissions ──────────────────────────────────────────
  const isCreator   = request.createdById === user?.id || request.created_by_id === user?.id;
  const isTruongPhongKD   = user?.role === ROLES.TRUONG_PHONG;
  const isTruongPhong = user?.role === ROLES.TRUONG_PHONG;
  const isNhanVien  = user?.role === ROLES.NHAN_VIEN;
  const isAssigned  = request.assigned_to === user?.id;

  const canAssign   = isTruongPhong;
  const canRevision = request.status === 'done' && isTruongPhongKD;
  const canComplete = isAssigned && request.status === 'processing';
  const canCancel   = (isCreator || isTruongPhong) && ['pending', 'processing'].includes(request.status);
  const canApprove  = isTruongPhong && request.status === 'done';
  const canReject   = isTruongPhong && request.status === 'done';

  // ── Helpers ──────────────────────────────────────────────
  const hasFiles     = request.files?.length > 0;
  const hasHistory   = request.revisionHistories?.length > 0;
  const hasAssignees = request.assignments?.length > 0;

  const tabCount = {
    files:   request.files?.length ?? 0,
    history: request.revisionHistories?.length ?? 0,
  };

  // ── Actions ──────────────────────────────────────────────
  const handleAction = async (type) => {
    setActionLoading(true);
    try {
      const statusMap = {
        complete: 'done',
        cancel:   'cancelled',
        approve:  'approved',
        reject:   'rejected',
      };
      await updateStatus?.(request.id, statusMap[type]);
      const d = await getRequestById(selected);
      setRequest(d?.data || d);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  const handleUpdateStatus = async (status) => {
    setUpdating(true);
    try {
      await updateStatus(request.id, status);
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setUpdating(false);
    }
  };

  const CONFIRM_CONFIG = {
    complete: {
      title: 'Hoàn thành yêu cầu?',
      message: 'Xác nhận đánh dấu yêu cầu này là đã hoàn thành. Người tạo sẽ được thông báo để kiểm tra.',
      confirmLabel: 'Hoàn thành',
      confirmColor: '#10b981',
      icon: <CheckCircle size={24} color="#10b981" />,
    },
    cancel: {
      title: 'Huỷ yêu cầu?',
      message: 'Yêu cầu sẽ bị huỷ và không thể khôi phục. Bạn chắc chắn muốn tiếp tục?',
      confirmLabel: 'Huỷ yêu cầu',
      confirmColor: '#ef4444',
      icon: <XCircle size={24} color="#ef4444" />,
    },
    approve: {
      title: 'Duyệt yêu cầu?',
      message: 'Phê duyệt kết quả và đóng yêu cầu này. Hành động này không thể hoàn tác.',
      confirmLabel: 'Phê duyệt',
      confirmColor: '#6366f1',
      icon: <Shield size={24} color="#6366f1" />,
    },
    reject: {
      title: 'Từ chối yêu cầu?',
      message: 'Kết quả sẽ bị từ chối. Bạn nên yêu cầu làm lại (revision) để rõ lý do hơn.',
      confirmLabel: 'Từ chối',
      confirmColor: '#ef4444',
      icon: <AlertTriangle size={24} color="#ef4444" />,
    },
  };

  const statusCfg   = STATUS_CONFIG[request.status]   || {};
  const priorityCfg = PRIORITY_CONFIG[request.priority] || {};

  return (
    <>
      <div className="rd-backdrop" onClick={onClose}>
        <div
          className="rd-modal"
          onClick={e => e.stopPropagation()}
          style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh', padding: 0, overflow: 'hidden' }}
        >

          {/* ══ HEADER ══════════════════════════════════════ */}
          <div style={{
            padding: '18px 20px 14px',
            borderBottom: '1px solid var(--border, #2d2d3d)',
            background: 'linear-gradient(135deg, var(--bg-card, #1e1e2e) 0%, rgba(99,102,241,0.04) 100%)',
            flexShrink: 0,
          }}>
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Code + Priority */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 18, fontWeight: 800, color: 'var(--text-primary, #fff)',
                    letterSpacing: '-0.3px', fontFamily: 'var(--font-mono)',
                  }}>
                    {request.code}
                  </span>
                  <PriorityBadge priority={request.priority} />
                </div>
                {/* Status row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <StatusBadge status={request.status} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {request.created_at ? new Date(request.created_at).toLocaleDateString('vi-VN') : ''}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: '1px solid var(--border)', background: 'transparent',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s', flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef444440'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { key: 'info',    label: 'Thông tin',    icon: <Info size={12} /> },
                { key: 'files',   label: `Tệp đính kèm`, icon: <Paperclip size={12} />, count: tabCount.files },
                { key: 'history', label: 'Lịch sử',      icon: <History size={12} />,   count: tabCount.history },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 8,
                    border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    transition: 'all 0.18s',
                    background: activeTab === tab.key
                      ? 'rgba(99,102,241,0.15)'
                      : 'transparent',
                    color: activeTab === tab.key
                      ? 'var(--accent, #6366f1)'
                      : 'var(--text-muted, #888)',
                    borderBottom: activeTab === tab.key ? '2px solid var(--accent, #6366f1)' : '2px solid transparent',
                  }}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.count > 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      background: activeTab === tab.key ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.08)',
                      color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-muted)',
                      padding: '1px 6px', borderRadius: 8,
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ══ BODY ════════════════════════════════════════ */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>

            {/* ── TAB: INFO ─────────────────────────────── */}
            {activeTab === 'info' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <InfoCard label="Người tạo" icon={<User size={10} />}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: 'var(--accent, #6366f1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 800, color: '#fff', flexShrink: 0,
                      }}>
                        {(request?.created_by_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      {request?.created_by_name || `#${request?.created_by_id}` || '—'}
                    </div>
                  </InfoCard>

                  <InfoCard label="Phòng tiếp nhận" icon={<Package size={10} />}>
                    {request?.to_department_name || '—'}
                  </InfoCard>

                  <InfoCard label="Loại sản phẩm" icon={<Package size={10} />}>
                    {request?.product_types || '—'}
                  </InfoCard>

                  <InfoCard label="Chất lượng video" icon={<Film size={10} />}>
                    {request?.video_quality
                      ? (QUALITY_LABELS[request.video_quality] || request.video_quality)
                      : '—'}
                  </InfoCard>

                  <InfoCard label="Số lượng" icon={<Hash size={10} />}>
                    {request?.quantity != null
                      ? <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{request.quantity}</span>
                      : '—'}
                  </InfoCard>

                  <InfoCard label="Deadline" icon={<Calendar size={10} />}>
                    {request?.deadline
                      ? (() => {
                          const d = new Date(request.deadline);
                          const now = new Date();
                          const diff = d - now;
                          const days = Math.ceil(diff / 86400000);
                          const isOverdue = diff < 0;
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                              {isOverdue
                                ? <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 700 }}>Quá hạn</span>
                                : days <= 3
                                ? <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700 }}>Còn {days} ngày</span>
                                : null}
                            </div>
                          );
                        })()
                      : '—'}
                  </InfoCard>

                  <InfoCard label="Ngày tạo" icon={<Clock size={10} />}>
                    {request?.created_at
                      ? new Date(request.created_at).toLocaleString('vi-VN')
                      : '—'}
                  </InfoCard>
                </div>

                {/* Notes */}
                {request.notes && (
                  <div style={{
                    background: 'rgba(245,158,11,0.06)',
                    border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: 10, padding: '12px 14px',
                    borderLeft: '3px solid #f59e0b',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <FileText size={12} color="#f59e0b" />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ghi chú</span>
                    </div>
                    <div  style={{
                          fontSize: 13,
                          color: 'var(--text-secondary)',
                          lineHeight: 1.6,
                          wordBreak: 'break-word',    
                          overflowWrap: 'break-word',   
                          whiteSpace: 'pre-wrap'       
                        }}>
                          {request.notes}</div>
                  </div>
                )}

                {/* Assignees */}
                {hasAssignees && (
                  <div>
                    <SectionHeader icon={<UserCheck size={14} />} title="Nhân viên được gán" count={request.assignments.length} />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {request.assignments.map(a => (
                        <div key={a.id} style={{
                          display: 'flex', alignItems: 'center', gap: 7,
                          padding: '6px 12px',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border)',
                          borderRadius: 20, fontSize: 12, fontWeight: 500,
                          color: 'var(--text-secondary)',
                        }}>
                          <div style={{
                            width: 20, height: 20, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 9, fontWeight: 800,
                          }}>
                            {a.user?.name?.charAt(0)?.toUpperCase()}
                          </div>
                          {a.user?.name}
                          {(a.user?.id === user?.id || a.userId === user?.id) && (
                            <span style={{ fontSize: 9, color: 'var(--accent)', fontWeight: 700 }}>Bạn</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: FILES ───────────────────────────── */}
            {activeTab === 'files' && (
              <div>
                {hasFiles ? (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {request.files.map(f => <FilePreview key={f.id} file={f} />)}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <Paperclip size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
                    <p style={{ fontSize: 13 }}>Không có tệp đính kèm</p>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: HISTORY ─────────────────────────── */}
            {activeTab === 'history' && (
              <div>
                {hasHistory ? (
                  <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 10, 
                      maxHeight: 300,  // chiều cao tối đa, bạn có thể tùy chỉnh
                      overflowY: 'auto',
                      paddingRight: 6 // tránh bị che scroll
                    }}>
                      {[...request.revisionHistories]
                        .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
                        .map((r, idx, arr) => (
                          <div key={r.id} style={{
                            background: 'rgba(249,115,22,0.06)',
                            border: '1px solid rgba(249,115,22,0.2)',
                            borderRadius: 10, 
                            padding: '12px 14px',
                            borderLeft: '3px solid #f97316',
                            position: 'relative',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                              <span style={{
                            fontSize: 11, fontWeight: 800, color: '#f97316',
                            fontFamily: 'var(--font-mono)',
                            background: 'rgba(249,115,22,0.12)',
                            padding: '2px 8px', borderRadius: 6,
                          }}>
                            {arr.length - idx}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {formatDate(r.createdAt || r.created_at)}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>
                        {r.comment}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                        <User size={10} />
                        {r.createdBy?.name || r.created_by_name || 'Ẩn danh'}
                      </div>
                    </div>
                ))}
              </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <History size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
                    <p style={{ fontSize: 13 }}>Chưa có lịch sử revision</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ══ FOOTER ══════════════════════════════════════ */}
          {(canAssign || canRevision || canComplete || canCancel || canApprove || canReject) && (
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border, #2d2d3d)',
              background: 'var(--bg-card, #1e1e2e)',
              display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
              flexShrink: 0,
            }}>

              {/* Assign */}
              {canAssign && (
                <ActionButton
                  icon={<UserCheck size={14} />}
                  label="Gán nhân viên"
                  onClick={() => setShowAssign(true)}
                  color="#6366f1"
                  outline
                />
              )}

              {/* Complete */}
              {canComplete && (
                <ActionButton
                  icon={<CheckCircle size={14} />}
                  label="Hoàn thành"
                  onClick={() => { handleUpdateStatus('done') }}
                  color="#10b981"
                />
              )}

              {/* Approve */}
              {canApprove && (
                <ActionButton
                  icon={<Shield size={14} />}
                  label="Phê duyệt"
                  onClick={() => setConfirm('approve')}
                  color="#6366f1"
                />
              )}

              {/* Revision */}
              {canRevision && (
                <ActionButton
                  icon={<RotateCcw size={14} />}
                  label="Làm lại"
                  onClick={() => setShowRevision(true)}
                  color="#f97316"
                  outline
                />
              )}

              {/* Reject */}
              {canReject && (
                <ActionButton
                  icon={<XCircle size={14} />}
                  label="Từ chối"
                  onClick={() => setConfirm('reject')}
                  color="#ef4444"
                  outline
                />
              )}

              {/* Cancel */}
              {canCancel && (
                <ActionButton
                  icon={<XCircle size={14} />}
                  label="Huỷ yêu cầu"
                  onClick={() => setConfirm('cancel')}
                  color="#ef4444"
                  outline
                />
              )}

              <div style={{ flex: 1 }} />

              <button
                onClick={onClose}
                style={{
                  padding: '8px 16px', borderRadius: 10,
                  border: '1px solid var(--border)', background: 'transparent',
                  color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                Đóng
              </button>
            </div>
          )}

          {/* Footer (no actions) */}
          {!(canAssign || canRevision || canComplete || canCancel || canApprove || canReject) && (
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border)',
              background: 'var(--bg-card)',
              display: 'flex', justifyContent: 'flex-end',
              flexShrink: 0,
            }}>
              <button
                onClick={onClose}
                style={{
                  padding: '8px 20px', borderRadius: 10,
                  border: '1px solid var(--border)', background: 'transparent',
                  color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ── Modals ── */}
      <RevisionModal
        request={request}
        open={showRevision}
        onClose={() => setShowRevision(false)}
        onRevised={() => { setShowRevision(false); onClose(); }}
      />

      <AssignModal
        request={request}
        open={showAssign}
        onClose={() => setShowAssign(false)}
        onAssigned={async () => {
          const d = await getRequestById(selected);
          setRequest(d?.data || d);
          setShowAssign(false);
        }}
      />

      {/* ── Confirm Dialog ── */}
      {confirm && (
        <ConfirmDialog
          open={!!confirm}
          onClose={() => !actionLoading && setConfirm(null)}
          onConfirm={() => handleAction(confirm)}
          isLoading={actionLoading}
          {...CONFIRM_CONFIG[confirm]}
        />
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </>
  );
}