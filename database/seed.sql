USE workflow_db;

INSERT INTO roles (role, name) VALUES
('super_admin', 'Admin' ),
('truong_phong', 'Trưởng phòng '),
('nhan_vien', 'Nhân viên');


INSERT INTO departments (name, code) VALUES
    ('Super Admin', 'AD'),
    ('Ban Giám Đốc', 'GD'),
    ('Phòng Kinh Doanh', 'KD'),
    ('Phòng Sản Xuất', 'SX'),
    ('Phòng Kế Toán', 'KT'),
    ('Phòng IT', 'IT')
;

INSERT INTO users (name, email, password, role_id,department_id, phone)
VALUES
('Admin','admin@company.com','$2a$12$u.ixDEt7aBbCe1YRfxOyD.XrnkD8ltp.2n8BW.bBcM84WLBPaW49i',1,1,'');