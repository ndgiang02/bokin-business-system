import { useState, useEffect } from 'react';
import { X, Download, Calendar, Clock, User, Package, Film, Hash, Tag, FileText, Image as ImageIcon, ChevronRight , Loader2, Video, Music, File, AlertTriangle,CheckCircle, XCircle, RotateCcw, UserCheck} from 'lucide-react';
import ImagePreview from './ImagePreview';
import RevisionModal from './RevisionModal.jsx';
import AssignModal   from './AssignModal.jsx';
import { requestStore } from '../../store/requestStore';
import './css/request-detail.css';

// ── Helpers ────────────────────────────────────────────────
function fixUrl(url) {
  if (!url) return url;
  return url.replace('http://minio:9000', 'http://localhost:9000');
}

const STATUS_MAP = {
  pending:     { label: 'Chờ Duyệt',   badge: 'badge-pending' },
  in_progress: { label: 'Đang Xử Lý',  badge: 'badge-in_progress' },
  done:        { label: 'Hoàn Thành',   badge: 'badge-done' },
  revision:    { label: 'Làm Lại',      badge: 'badge-rejected' },
  approved:    { label: 'Đã Duyệt',     badge: 'badge-approved' },
  rejected:    { label: 'Từ Chối',      badge: 'badge-rejected' },
  cancelled:   { label: 'Đã Huỷ',       badge: 'badge-rejected' },
};

const PRIORITY_MAP = {
  urgent: { label: 'Khẩn Cấp',  badge: 'badge-high' },
  high:   { label: 'Cao',        badge: 'badge-high' },
  medium: { label: 'Trung Bình', badge: 'badge-medium' },
  low:    { label: 'Thấp',       badge: 'badge-low' },
}

function formatBytes(b) {
  if (!b) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024*1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType, size = 16) {
  if (mimeType?.startsWith('image/'))  return <ImageIcon size={size} color="#2563eb" />;
  if (mimeType?.startsWith('video/'))  return <Video     size={size} color="#7c3aed" />;
  if (mimeType?.startsWith('audio/'))  return <Music     size={size} color="#0891b2" />;
  if (mimeType?.includes('pdf'))       return <FileText  size={size} color="#dc2626" />;
  if (mimeType?.includes('word') || mimeType?.includes('doc')) return <FileText size={size} color="#2563eb" />;
  if (mimeType?.includes('excel') || mimeType?.includes('sheet')) return <FileText size={size} color="#059669" />;
  return <File size={size} color="#94a3b8" />;
}

 function InfoRow({ label, children }) {
  return (
    <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: 8 }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{children ?? '—'}</div>
    </div>
  );
}

  function FilePreview({ file }) {
    const [zoom, setZoom] = useState(false);
    const url    = fixUrl(file.url);
    const isImg  = file.fileType === 'image' || file.mimeType?.startsWith('image/');

    return (
      <>
        <div
          onClick={() => setZoom(true)}
          style={{
            width: 80, height: 80, borderRadius: 10, overflow: 'hidden',
            border: '1px solid var(--border)', cursor: 'pointer', flexShrink: 0,
            background: 'var(--bg-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 4, transition: 'all 0.2s',
            position: 'relative',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          {isImg ? (
            <img src={url} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; }} />
          ) : (
            <>
              {getFileIcon(file.mime_type, 24)}
              <span style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', padding: '0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                {file.name?.split('.').pop()?.toUpperCase()}
              </span>
            </>
          )}
        </div>

        {/* Lightbox */}
        {zoom && (
          <div onClick={() => setZoom(false)} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            {isImg ? (
              <img src={url} alt={file.name} onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: 12, boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }} />
            ) : (
              <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '32px 48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                {getFileIcon(file.mimeType, 48)}
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatBytes(file.size)}</div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }} onClick={e => e.stopPropagation()}>
              <a href={url} download={file.name} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                <Download size={14} /> Tải về
              </a>
              <button onClick={() => setZoom(false)} style={{ padding: '8px 18px', borderRadius: 8, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', fontSize: 13 }}>
                Đóng
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

// ── Main ──────────────────────────────────────────────────
export default function RequestDetail({ selected, onClose, PRIORITY_MAP, STATUS_MAP }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [previewName, setPreviewName] = useState(null);
  const [request, setRequest] = useState(null);
  //const [isLoading, setLoading] = useState(false);
  const { getRequestById } = requestStore();
  
  useEffect(() => {
     const fetchData = async () => {
     const d = await getRequestById(selected);
     console.log("API result:", d);
     setRequest(d?.data || d);
    };

    fetchData();
  }, [selected]);  

  if (request == null) {
    return (

      <div className="rd-backdrop" onClick={onClose}>
          <div className="rd-modal" onClick={e => e.stopPropagation()}>

            <Loader2 className="spin" size={30} />
            <p>Đang tải...</p>
        
          </div>
        </div>
    );
  }

  const canRevision = request.status === 'done' && request.createdById === user?.id;
  const canAssign   = hasPermission(user?.role, 'manage_tasks');
  const productTypes = (request.product_types || '').split(',').map(t => t.trim()).filter(Boolean);


  return (
    <>
      <div className="rd-backdrop" onClick={onClose}>
        <div className="rd-modal" onClick={e => e.stopPropagation()}>

          {/* ── HEADER ── */}
          <div className="rd-header">
            <div className="rd-header-inner">
              <div>
                <div className="rd-code">{request.code}</div>
              </div>
              <button className="rd-close-btn" onClick={onClose}>
                <X size={15} />
              </button>
            </div>
          </div>

          {/* ── BODY ── */}
          <div className="rd-body">

            {/* Section label */}
            <div className="rd-section-label">
              <FileText size={11} />
              Thông tin yêu cầu
            </div>

            {/* INFO GRID */}
            <div className="rd-grid">
              {/* Người tạo */}
              <div className="rd-info-card">
                <div className="rd-info-card-label">
                  <User size={13} />
                  Người tạo
                </div>
                <div className="rd-info-card-value">
                  {request?.created_by_name || `User #${request?.created_by_id}` || '—'}
                </div>
              </div>

              {/* Loại sản phẩm */}
              <div className="rd-info-card">
                <div className="rd-info-card-label">
                  <Package size={13} />
                  Loại sản phẩm
                </div>
                <div className="rd-info-card-value">
                  {request?.product_types || '—'}
                </div>
              </div>

              {/* Chất lượng video */}
              <div className="rd-info-card">
                <div className="rd-info-card-label">
                  <Film size={13} />
                  Chất lượng video
                </div>
                <div className="rd-info-card-value">
                  {request?.video_quality
                    ? QUALITY_LABELS[request.video_quality] || request.video_quality
                    : '—'}
                </div>
              </div>

              {/* Số lượng */}
              <div className="rd-info-card">
                <div className="rd-info-card-label">
                  <Hash size={13} />
                  Số lượng
                </div>
                <div className="rd-info-card-value">
                  {request?.quantity ?? '—'}
                </div>
              </div>

              {/* Ưu tiên */}
              <div className="rd-info-card">
                <div className="rd-info-card-label">
                  <Tag size={13} />
                  Ưu tiên
                </div>
                <div className="rd-info-card-value">
                  <span className={`badge ${PRIORITY_MAP[request?.priority]?.class}`}>
                    {PRIORITY_MAP[request?.priority]?.label || '—'}
                  </span>
                </div>
              </div>

              {/* Trạng thái */}
              <div className="rd-info-card">
                <div className="rd-info-card-label">
                  <ChevronRight size={13} />
                  Trạng thái
                </div>
                <div className="rd-info-card-value">
                  <span className={`badge ${STATUS_MAP[request?.status]?.class}`}>
                    {STATUS_MAP[request?.status]?.label || '—'}
                  </span>
                </div>
              </div>

              {/* Deadline */}
              <div className="rd-info-card">
                <div className="rd-info-card-label">
                  <Calendar size={13} />
                  Deadline
                </div>
                <div className="rd-info-card-value">
                  {request?.deadline
                    ? new Date(request.deadline).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                    : '—'}
                </div>
              </div>

              {/* Ngày tạo */}
              <div className="rd-info-card">
                <div className="rd-info-card-label">
                  <Clock size={13} />
                  Ngày tạo
                </div>
                <div className="rd-info-card-value">
                  {request?.created_at
                    ? new Date(request.created_at).toLocaleString('vi-VN')
                    : '—'}
                </div>
              </div>

            </div>

            {/* NOTES */}
            {request.notes && (
              <div className="rd-notes">
                <div className="rd-notes-label">
                  <FileText size={11} />
                  Ghi chú
                </div>
                <div className="rd-notes-text">{request.notes}</div>
              </div>
            )}


            {request.files?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                  File đính kèm ({request.files.length})
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {request.files.map(f => <FilePreview key={f.id} file={f} />)}
                </div>
              </div>
            )}

            {/* Assigned users */}
            {request.assignments?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                  Nhân viên được gán ({request.assignments.length})
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {request.assignments.map(a => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 20, fontSize: 12 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700 }}>
                        {a.user?.name?.charAt(0)}
                      </div>
                      {a.user?.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revision history */}
            {request.revisionHistories?.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                  Lịch sử revision ({request.revisionHistories.length} lần)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {request.revisionHistories.map(r => (
                    <div key={r.id} style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)', borderRadius: 8, padding: '10px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--warning)', fontFamily: 'var(--font-mono)' }}>Lần {r.round}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{formatDate(r.createdAt || r.created_at)}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.comment}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Bởi: {r.createdBy?.name || r.created_by_name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>



          {/* ── FOOTER ── */}
          <div className="rd-footer">
            {canAssign && (
              <button onClick={() => setShowAssign(true)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <UserCheck size={14} /> Gán nhân viên
              </button>
            )}

            {/* Revision */}
            {canRevision && (
              <button onClick={() => setShowRevision(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(217,119,6,0.4)', background: 'var(--warning-dim)', color: 'var(--warning)', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}>
                <RotateCcw size={14} /> Chưa ưng, làm lại
              </button>
            )}

            <button className="rd-btn-close" onClick={onClose}>
              Đóng
            </button>
          </div>

        </div>
      </div>

       <RevisionModal
        request={request}
        open={showRevision}
        onClose={() => setShowRevision(false)}
        onRevised={() => { setShowRevision(false); onUpdated?.(); onClose(); }}
      />

      {/* Assign Modal */}
      <AssignModal
        request={request}
        open={showAssign}
        onClose={() => setShowAssign(false)}
        onAssigned={() => { setShowAssign(false); onUpdated?.(); }}
      />

       <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    
    </>
  );
}