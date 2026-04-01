USE workflow_db;

INSERT INTO roles (role, name) VALUES
('super_admin', 'Admin' ),
('truong_phong_kinh_doanh', 'Trưởng phòng kinh doanh'),
('truong_phong_sx', 'Trưởng phòng sản xuất'),
('nhan_vien_kinh_doanh', 'Nhân viên kinh doanh'),
('nhan_vien_san_xuat', 'Nhân viên sản xuất');

INSERT INTO departments (name) VALUES
    ('Super Admin'),
    ('Ban Giám Đốc'),
    ('Phòng Kinh Doanh'),
    ('Phòng Sản Xuất'),
    ('Phòng Kế Toán'),
    ('Phòng IT')
;

INSERT INTO users (name, email, password, role_id,department_id, phone)
VALUES
('Admin','admin@company.com','$2a$12$u.ixDEt7aBbCe1YRfxOyD.XrnkD8ltp.2n8BW.bBcM84WLBPaW49i',1,1,'');