import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, UserPlus } from 'lucide-react';
import { userApi } from '../../api/userApi.js';
import { depApi } from '../../api/departmentApi.js';
import { roleApi } from '../../api/roleApi.js'
import { ROLES, ROLE_LABELS } from '../../utils/roleUtils.js';

export function CreateMember() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', 
    email: '', 
    phone: '', 
    department_id: null,
    role_id: null, 
    password: '',
  });

  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
  const fetchData = async () => {
    const [depRes, roleRes] = await Promise.all([
      depApi.getAlldepartments(),
      roleApi.getAllRoles()
    ]);

    setDepartments(depRes.data.data);
    setRoles(roleRes.data.data);
  };

  fetchData();
}, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Bắt buộc';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email không hợp lệ';
    if (!form.password || form.password.length < 6) e.password = 'Tối thiểu 6 ký tự';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await userApi.create(form);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    navigate('/members');
  };

  return (
    <div className="animate-fade-in" style={{ width: "100%" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/members')}>
          <ArrowLeft size={14} /> Quay lại
        </button>
        <div>
          <h1 className="page-title">Thêm Thành Viên</h1>
          <p className="page-subtitle">Tạo tài khoản mới và phân quyền truy cập</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic info */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent-dim)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={18} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Thông Tin Cá Nhân</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Họ Và Tên *</label>
              <input className="form-input" placeholder="Nguyễn Văn A" value={form.name} onChange={e => set('name', e.target.value)} />
              {errors.name && <span style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4, display: 'block' }}>{errors.name}</span>}
            </div>

             <div className="form-group">
              <label className="form-label">Số Điện Thoại</label>
              <input className="form-input" placeholder="09xx xxx xxx" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" placeholder="email@company.com" value={form.email} onChange={e => set('email', e.target.value)} />
              {errors.email && <span style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4, display: 'block' }}>{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Mật Khẩu *</label>
              <input className="form-input" type="password" placeholder="Tối thiểu 6 ký tự" value={form.password} onChange={e => set('password', e.target.value)} />
              {errors.password && <span style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4, display: 'block' }}>{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Phòng Ban</label>
              <select className="form-select" value={form.department_id} onChange={e => set('department_id', Number(e.target.value))}>
                <option value="">-- Chọn phòng ban --</option>
                {departments.map(dep => (
                  <option key={dep.id} value={dep.id}>
                    {dep.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Vai Trò *</label>
              <select className="form-select" value={form.role_id} onChange={e => set('role_id', Number(e.target.value))}>
                 {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/members')}>Hủy</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
                Đang tạo...
              </span>
            ) : <><Save size={15} /> Tạo Tài Khoản</>}
          </button>
        </div>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}