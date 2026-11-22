<?php
include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$teacher_id = $data['teacher_id'] ?? 1;
$subject = $conn->real_escape_string($data['subject']);
$date = $conn->real_escape_string($data['date']);
$records = $data['records']; // [{student_id: 1, status: 'Present'}, ...]

foreach ($records as $rec) {
    $student_id = (int)$rec['student_id'];
    $status = $conn->real_escape_string($rec['status']);

    // Yadi tehi date ma pahile nai attendance xa bhane UPDATE garne (Edit mode), natra INSERT
    $check = $conn->query("SELECT id FROM attendance WHERE student_id=$student_id AND subject='$subject' AND date='$date'");
    if ($check->num_rows > 0) {
        $conn->query("UPDATE attendance SET status='$status' WHERE student_id=$student_id AND subject='$subject' AND date='$date'");
    } else {
        $conn->query("INSERT INTO attendance (student_id, teacher_id, subject, date, status) VALUES ($student_id, $teacher_id, '$subject', '$date', '$status')");
    }
}

echo json_encode(["status" => "success", "message" => "Attendance saved successfully!"]);
?>
