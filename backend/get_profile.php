<?php
include 'db.php';

$id = (int)($_GET['id'] ?? 0);
$res = $conn->query("SELECT id, name, email, faculty, semester, role FROM users WHERE id = $id");

if ($res->num_rows > 0) {
    echo json_encode(["status" => "success", "user" => $res->fetch_assoc()]);
} else {
    echo json_encode(["status" => "error", "message" => "Profile not found"]);
}
?>
