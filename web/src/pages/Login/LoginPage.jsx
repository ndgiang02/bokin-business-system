import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
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
    <div className="lp-root">
      {/* ── Left brand panel ── */}
      <section className="lp-brand">
        <div className="lp-brand-glow" />
        <div className="lp-brand-grid" />

        {/* Logo */}
        <div className="lp-logo">
          <div className="lp-logo-mark">BK</div>
          <div>
            <div className="lp-logo-name">BoKin Business</div>
          </div>
        </div>

        {/* Hero */}
        <div className="lp-hero">
          <div className="lp-hero-badge">
            <span className="lp-hero-dot" />
            Hệ thống đang hoạt động
          </div>
          <h1 className="lp-hero-title">
            Quản trị <span className="lp-hero-accent">doanh nghiệp.</span>
          </h1>
          <p className="lp-hero-sub">
            Theo dõi yêu cầu, phân công công việc và vận hành kinh doanh trên một giao diện thống nhất.
          </p>
        </div>

        {/* Decorative arc */}
        <div className="lp-arc" />
      </section>

      {/* ── Right form panel ── */}
      <section className="lp-form-panel">
        <div className="lp-form-card">
          <div className="lp-form-top">
            <h2 className="lp-form-title">Đăng nhập</h2>
            <p className="lp-form-desc">Nhập thông tin tài khoản để tiếp tục.</p>
          </div>

          <form onSubmit={handleSubmit} className="lp-form">
            {/* Email */}
            <div className="lp-field">
              <label className="lp-label">Địa chỉ Email</label>
              <input
                className="lp-input"
                type="email"
                placeholder="email@company.com"
                value={email}
                onChange={e => { setEmail(e.target.value); clearError(); }}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="lp-field">
              <div className="lp-label-row">
                <label className="lp-label">Mật khẩu</label>
              </div>
              <div className="lp-pw-wrap">
                <input
                  className="lp-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearError(); }}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lp-pw-toggle"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="lp-error" role="alert">
                <span className="lp-error-dot" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="lp-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="lp-spinner-wrap">
                  <span className="lp-spinner" />
                  Đang xác thực...
                </span>
              ) : (
                <span className="lp-submit-inner">
                  Đăng nhập
                  <ArrowRight size={16} className="lp-arrow" />
                </span>
              )}
            </button>
          </form>

          <p className="lp-footer-note">
            Hệ thống dành riêng cho nhân viên BoKin Business.
          </p>
        </div>
      </section>
    </div>
  );
}