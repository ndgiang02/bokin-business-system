import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ShieldCheck, Sparkles, Workflow } from 'lucide-react';
import { authStore } from '../../store/authStore.js';
import { toast } from '../../shared/toast/useToast.js';
import './login.css';

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
    } else {
      toast.error('Đăng nhập thất bại');
    }
  };

  return (
    <div className="login-page">
      <div className="login-orb login-orb-left" />
      <div className="login-orb login-orb-right" />

      <section className="login-brand-panel">
        <div className="login-brand-card">
          <div className="login-logo-row">
            <div className="login-logo-mark">BK</div>
            <div>
              <div className="login-logo-title">BoKin Business</div>
              <div className="login-logo-subtitle">ENTERPRISE MANAGEMENT v2.0</div>
            </div>
          </div>

          <div className="login-hero-copy">
            <span className="login-eyebrow">
              <Sparkles size={14} />
              Quản trị hiện đại
            </span>
            <h1>Đăng nhập hệ thống quản lý</h1>
            <p>
              Theo dõi yêu cầu, phân công công việc và vận hành kinh doanh trên một giao diện thống nhất.
            </p>
          </div>

          <div className="login-feature-grid">
            <div className="login-feature-item">
              <ShieldCheck size={18} />
              <span>Bảo mật tài khoản</span>
            </div>
            <div className="login-feature-item">
              <Workflow size={18} />
              <span>Quy trình liền mạch</span>
            </div>
          </div>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-card">
          <div className="login-form-header">
            <span className="login-form-kicker">Chào mừng trở lại</span>
            <h2>Đăng nhập</h2>
            <p>Nhập email và mật khẩu để tiếp tục vào trang quản trị.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input login-input"
                type="email"
                placeholder="email@company.com"
                value={email}
                onChange={e => { setEmail(e.target.value); clearError(); }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <div className="login-password-wrap">
                <input
                  className="form-input login-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearError(); }}
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary login-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="login-loading">
                  <span className="login-spinner" />
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
      </section>
    </div>
  );
}
