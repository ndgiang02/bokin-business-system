CREATE DATABASE IF NOT EXISTS workflow_db
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE workflow_db;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    name VARCHAR(50)
);

CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role_id INT,
    department_id INT,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status INT DEFAULT 1,
    
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE requests (
    id INT AUTO_INCREMENT PRIMARY KEY,

    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,

    product_types VARCHAR(255) NOT NULL,
    video_quality VARCHAR(50) NULL,

    priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',

    deadline DATE NOT NULL,
    quantity INT DEFAULT 1,

    split_by_image BOOLEAN DEFAULT FALSE,

    notes TEXT NULL,

    status ENUM('pending','processing','done','revision','rejected','cancelled') DEFAULT 'pending',

    created_by_id INT,
    assigned_to INT,
    resolved_to INT,
    created_by_name VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE request_files (
    id INT AUTO_INCREMENT PRIMARY KEY,

    request_id INT NOT NULL,

    file_key VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,

    name VARCHAR(255),
    size INT,
    mime_type VARCHAR(100),
    file_type VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT,
    assigned_to INT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT,
    user_id INT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE revision_histories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    comment TEXT NOT NULL,
    round INT DEFAULT 1,
    created_by_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_revision_request
        FOREIGN KEY (request_id)
        REFERENCES requests(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_revision_user
        FOREIGN KEY (created_by_id)
        REFERENCES users(id)
);

CREATE TABLE request_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    user_id INT NOT NULL,
    assigned_by_id INT NOT NULL,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_assignment_request
        FOREIGN KEY (request_id)
        REFERENCES requests(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_assignment_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_assignment_assigned_by
        FOREIGN KEY (assigned_by_id)
        REFERENCES users(id),

    CONSTRAINT unique_request_user UNIQUE (request_id, user_id)
);