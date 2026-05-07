import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ChevronRight } from 'lucide-react';
import { authStore } from '../../store/authStore.js';
import { toast } from '../../shared/toast/useToast.js';
import { ROLE_LABELS, ROLE_COLORS } from '../../utils/roleUtils.js';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login, isLoading, error, clearError } = authStore();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) {
        navigate('/dashboard');
    }
    else { 
        toast.error(ok.message || 'Đăng nhập thất bại');
    }
  
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />
      <div style={{
        position: 'absolute',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
        top: -200, left: -100,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        bottom: -100, right: 100,
        pointerEvents: 'none',
      }} />

      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px 80px',
        position: 'relative',
        borderRight: '1px solid var(--border)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56 }}>
          <div style={{
            width: 48, height: 48,
            background: 'var(--accent)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#000',
            boxShadow: '0 0 30px rgba(245,158,11,0.5)',
          }}>QH</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
              Quản Lý Hệ Thống
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: 1 }}>
              ENTERPRISE MANAGEMENT v2.0
            </div>
          </div>
        </div>

        <div style={{ animation: 'fadeInUp 0.5s ease' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 40,
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1.1,
            marginBottom: 12,
          }}>
            Đăng nhập<br />
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 40 }}>
            Hệ thống quản lý sản xuất & kinh doanh tích hợp
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="email@company.com"
                value={email}
                onChange={e => { setEmail(e.target.value); clearError(); }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearError(); }}
                  style={{ paddingRight: 44 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'var(--danger-dim)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8, padding: '10px 14px',
                fontSize: 13, color: 'var(--danger)',
                marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14, marginTop: 8 }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
                  Đang đăng nhập...
                </span>
              ) : (
                <>
                  <LogIn size={16} />
                  Đăng Nhập
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right panel - Demo accounts */}
      <div style={{
        width: 360,
        padding: '60px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          fontSize: 11,
          fontFamily: 'var(--font-display)',
          color: 'var(--text-muted)',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          marginBottom: 20,
        }}>
          // Demo accounts
        </div>

        <div style={{
          marginTop: 24,
          padding: '12px 14px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          fontSize: 11,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-display)',
        }}>
          Mật khẩu mặc định: <span style={{ color: 'var(--accent)' }}>123456</span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}