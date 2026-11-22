<?php
include 'db.php';

$user_id = (int)($_GET['student_id'] ?? 0);

// 1. Users table bata login gareko student ko info tanne
$userRes = $conn->query("SELECT id, name, faculty, semester FROM users WHERE id = $user_id");
$user = $userRes->fetch_assoc();

if (!$user) {
    echo json_encode(["student" => null, "subjects" => [], "history" => []]);
    exit();
}

// 2. Admin le add gareko admin_students table ma naam match garera student_id ra semesterId patta lagaune
$safeName = $conn->real_escape_string($user['name']);
$adminStRes = $conn->query("SELECT id, roll, semesterId FROM admin_students WHERE name = '$safeName' LIMIT 1");
$adminSt = $adminStRes->fetch_assoc();

$target_student_id = $adminSt ? (int)$adminSt['id'] : $user_id;
$user['roll'] = $adminSt ? $adminSt['roll'] : $user['id'];
$current_sem_id = $adminSt ? (int)$adminSt['semesterId'] : 0;

// 3. Current Semester ko subjects matra filter garne condition
$semFilter = "";
if ($current_sem_id > 0) {
    $semFilter = " AND subject IN (SELECT name FROM subjects WHERE semesterId = $current_sem_id)";
}

// 4. Current Semester ko Subject-wise summary
$summarySql = "SELECT subject, 
               COUNT(*) as total_classes,
               SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_days
               FROM attendance 
               WHERE student_id = $target_student_id $semFilter
               GROUP BY subject";
$summaryRes = $conn->query($summarySql);
$subjects = [];

while ($row = $summaryRes->fetch_assoc()) {
    $total = (int)$row['total_classes'];
    $present = (int)$row['present_days'];
    $row['percentage'] = $total > 0 ? round(($present / $total) * 100) : 0;
    $subjects[] = $row;
}

// 5. Current Semester ko Date-wise history
$historySql = "SELECT a.date, a.subject, a.status, COALESCE(u.name, 'Teacher') as teacher_name
               FROM attendance a
               LEFT JOIN users u ON a.teacher_id = u.id
               WHERE a.student_id = $target_student_id $semFilter
               ORDER BY a.date DESC";
$historyRes = $conn->query($historySql);
$history = [];

while ($row = $historyRes->fetch_assoc()) {
    $history[] = $row;
}

echo json_encode([
    "student" => $user,
    "subjects" => $subjects,
    "history" => $history
]);
?>
