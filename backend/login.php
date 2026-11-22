<?php
session_start();
include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$email = $conn->real_escape_string($data['email']);
$password = $data['password'];
$role = $conn->real_escape_string($data['role']);

$sql = "SELECT * FROM users WHERE email = '$email' AND role = '$role'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    if (password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];
        echo json_encode([
            "status" => "success",
            "role" => $user['role'],
            "user_id" => $user['id'],
            "name" => $user['name']
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Wrong password!"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "User not found for this role!"]);
}
?>
