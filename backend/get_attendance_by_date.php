<?php
include 'db.php';

$subject = $conn->real_escape_string($_GET['subject'] ?? '');
$date = $conn->real_escape_string($_GET['date'] ?? '');

$sql = "SELECT student_id, status FROM attendance WHERE subject = '$subject' AND date = '$date'";
$res = $conn->query($sql);

$records = [];
while ($row = $res->fetch_assoc()) {
    $records[$row['student_id']] = $row['status'];
}

echo json_encode($records);
?>
