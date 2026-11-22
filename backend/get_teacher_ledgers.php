<?php
include 'db.php';

$user_id = (int)($_GET['user_id'] ?? 0);

// 1. Login gareko teacher ko email users table bata nikalne
$uRes = $conn->query("SELECT email FROM users WHERE id = $user_id AND role = 'teacher'");
if ($uRes->num_rows === 0) {
    echo json_encode([]);
    exit();
}
$teacher_email = $conn->real_escape_string($uRes->fetch_assoc()['email']);

// 2. Tyo email admin le add gareko faculty table ma khojne
$fRes = $conn->query("SELECT id FROM faculty WHERE email = '$teacher_email'");
if ($fRes->num_rows === 0) {
    echo json_encode([]);
    exit();
}
$faculty_id = (int)$fRes->fetch_assoc()['id'];

// 3. Tyo faculty lai assign vayeka sabai ledgers, subject, program ra semester tanne
$sql = "SELECT l.id as ledger_id, l.studentIds, 
               s.name as subject_name, 
               p.name as program_name, 
               sem.name as semester_name
        FROM ledgers l
        JOIN subjects s ON l.subjectId = s.id
        JOIN programs p ON s.programId = p.id
        JOIN semesters sem ON s.semesterId = sem.id
        WHERE l.facultyId = $faculty_id";

$res = $conn->query($sql);
$ledgers = [];

while ($row = $res->fetch_assoc()) {
    $row['studentIds'] = json_decode($row['studentIds'], true) ?: [];
    $ledgers[] = $row;
}

echo json_encode($ledgers);
?>
