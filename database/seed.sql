USE workflow_db;

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

INSERT INTO roles (role, name) VALUES
('super_admin', 'Admin' ),
('truong_phong', 'Trưởng phòng '),
('nhan_vien', 'Nhân viên'), 
('thuc_tap', 'Thực tập sinh');


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
('Admin','admin@company.com','$2a$12$WfFGsFluYShtLcHK3qSLDOidS1aEh22Qij3SxrTtPgLW5Km0F/ySm',1,1,'');