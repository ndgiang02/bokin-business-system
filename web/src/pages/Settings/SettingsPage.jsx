import { BarChart3, Download } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';

const monthData = [
  { month: 'T10', doanhthu: 3200, chiphiSX: 1800, loinhuan: 1400 },
  { month: 'T11', doanhthu: 4100, chiphiSX: 2100, loinhuan: 2000 },
  { month: 'T12', doanhthu: 5800, chiphiSX: 2600, loinhuan: 3200 },
  { month: 'T1',  doanhthu: 3900, chiphiSX: 1900, loinhuan: 2000 },
  { month: 'T2',  doanhthu: 4700, chiphiSX: 2300, loinhuan: 2400 },
  { month: 'T3',  doanhthu: 5200, chiphiSX: 2500, loinhuan: 2700 },
];

const TooltipCustom = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, display: 'flex', gap: 8, marginBottom: 2 }}>
          <span>{p.name}:</span><strong>{p.value}M</strong>
        </div>
      ))}
    </div>
  );
};

// =========================================
// Settings page
// =========================================
export function SettingsPage() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Cài Đặt Hệ Thống</h1>
        <p className="page-subtitle">Cấu hình và tùy chỉnh hệ thống quản lý</p>
      </div>

      {/* Thông tin công ty */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          🏢 Thông Tin Công Ty
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Tên Công Ty</label>
            <input className="form-input" defaultValue="Công Ty TNHH Quản Hệ Thống" />
          </div>
          <div className="form-group">
            <label className="form-label">Email Liên Hệ</label>
            <input className="form-input" defaultValue="info@company.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Số Điện Thoại</label>
            <input className="form-input" defaultValue="028 3456 7890" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Địa Chỉ</label>
            <input className="form-input" defaultValue="123 Đường Công Nghiệp, Bình Dương" />
          </div>
        </div>
        <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-primary btn-sm">Lưu Thay Đổi</button>
        </div>
      </div>

      {/* Cấu hình hệ thống */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚙️ Cấu Hình Hệ Thống
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Múi Giờ</label>
            <select className="form-select" defaultValue="Asia/Ho_Chi_Minh">
              <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (UTC+7)</option>
              <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Ngôn Ngữ</label>
            <select className="form-select" defaultValue="vi">
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Định Dạng Ngày</label>
            <select className="form-select" defaultValue="dd/mm/yyyy">
              <option value="dd/mm/yyyy">DD/MM/YYYY</option>
              <option value="mm/dd/yyyy">MM/DD/YYYY</option>
              <option value="yyyy-mm-dd">YYYY-MM-DD</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Phiên Bản</label>
            <input className="form-input" defaultValue="v2.0.0" readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </div>
        </div>
        <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-primary btn-sm">Lưu Thay Đổi</button>
        </div>
      </div>

      {/* Phê duyệt & thông báo */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          🔔 Thông Báo & Phê Duyệt
        </div>
        {[
          { label: 'Email thông báo khi có yêu cầu mới',           default: true },
          { label: 'Email thông báo khi yêu cầu được phê duyệt',   default: true },
          { label: 'Nhắc nhở deadline trước 3 ngày',                default: true },
          { label: 'Tự động giao việc khi yêu cầu được duyệt',     default: false },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
            <label style={{ position: 'relative', width: 40, height: 22, cursor: 'pointer', display: 'inline-block' }}>
              <input type="checkbox" defaultChecked={item.default} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{
                position: 'absolute', inset: 0, borderRadius: 22,
                background: item.default ? 'var(--accent)' : 'var(--bg-input)',
                border: '1px solid var(--border)',
                transition: 'all 0.2s',
              }}>
                <span style={{
                  position: 'absolute', top: 2,
                  left: item.default ? 20 : 2,
                  width: 16, height: 16, borderRadius: '50%',
                  background: item.default ? '#000' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                }} />
              </span>
            </label>
          </div>
        ))}
        <div style={{ paddingTop: 14 }}>
          <button className="btn btn-primary btn-sm">Lưu Cài Đặt</button>
        </div>
      </div>

      {/* Nguy hiểm */}
      <div className="card" style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 8, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚠️ Vùng Nguy Hiểm
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          Các hành động này không thể hoàn tác. Hãy cẩn thận trước khi thực hiện.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-danger btn-sm">Xóa Tất Cả Dữ Liệu Demo</button>
          <button className="btn btn-danger btn-sm">Đặt Lại Hệ Thống</button>
        </div>
      </div>
    </div>
  );
}