<?php
error_reporting(0);
include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No data received"]);
    exit();
}

$role = $conn->real_escape_string($data['role'] ?? 'student');
$secretCode = trim($data['secretCode'] ?? '');
$name = $conn->real_escape_string($data['name'] ?? '');
$email = $conn->real_escape_string($data['email'] ?? '');
$faculty = $conn->real_escape_string($data['faculty'] ?? 'N/A');
$semester = $conn->real_escape_string($data['semester'] ?? 'N/A');
$username = $conn->real_escape_string($data['username'] ?? $email);
$password = password_hash($data['password'] ?? '', PASSWORD_DEFAULT);

// Server-side Secret Code Verification
if ($role === 'admin' && $secretCode !== 'ADMIN123') {
    echo json_encode(["status" => "error", "message" => "Unauthorized: Invalid Admin Secret Code!"]);
    exit();
}
if ($role === 'teacher' && $secretCode !== 'TEACHER123') {
    echo json_encode(["status" => "error", "message" => "Unauthorized: Invalid Teacher Secret Code!"]);
    exit();
}

$check = $conn->query("SELECT id FROM users WHERE email='$email'");
if ($check && $check->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Email already registered!"]);
    exit();
}

$sql = "INSERT INTO users (name, email, username, faculty, semester, password, role) 
        VALUES ('$name', '$email', '$username', '$faculty', '$semester', '$password', '$role')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => "success", "message" => "Registration Successful!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
}
?>
