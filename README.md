# Attendance-Management-System
Second Semster Project
//read//
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    faculty VARCHAR(50) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student') DEFAULT 'student'
);

CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    teacher_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Late') NOT NULL,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    duration VARCHAR(50) NOT NULL
);

CREATE TABLE semesters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    programId INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    start DATE NOT NULL,
    end DATE NOT NULL,
    active TINYINT(1) DEFAULT 1,
    FOREIGN KEY (programId) REFERENCES programs(id) ON DELETE CASCADE
);

CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    programId INT NOT NULL,
    semesterId INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (programId) REFERENCES programs(id) ON DELETE CASCADE,
    FOREIGN KEY (semesterId) REFERENCES semesters(id) ON DELETE CASCADE
);

CREATE TABLE faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL
);

CREATE TABLE admin_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    roll VARCHAR(50) NOT NULL,
    semesterId INT NOT NULL,
    FOREIGN KEY (semesterId) REFERENCES semesters(id) ON DELETE CASCADE
);

CREATE TABLE ledgers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subjectId INT NOT NULL,
    facultyId INT NOT NULL,
    studentIds TEXT NOT NULL,
    FOREIGN KEY (subjectId) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (facultyId) REFERENCES faculty(id) ON DELETE CASCADE
);
