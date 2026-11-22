<?php
include 'db.php';

$ledger_id = (int)($_GET['ledger_id'] ?? 0);
$subject = $conn->real_escape_string($_GET['subject'] ?? '');

$lRes = $conn->query("SELECT studentIds FROM ledgers WHERE id = $ledger_id");
if ($lRes->num_rows === 0) {
    echo json_encode([]);
    exit();
}

$studentIds = json_decode($lRes->fetch_assoc()['studentIds'], true);
if (empty($studentIds)) {
    echo json_encode([]);
    exit();
}

$ids = implode(',', array_map('intval', $studentIds));

$sql = "SELECT s.id, s.roll, s.name, 
        COUNT(a.id) as total_classes,
        SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent_days
        FROM admin_students s
        LEFT JOIN attendance a ON s.id = a.student_id AND a.subject = '$subject'
        WHERE s.id IN ($ids)
        GROUP BY s.id
        ORDER BY s.roll ASC";

$result = $conn->query($sql);
$report = [];

while ($row = $result->fetch_assoc()) {
    $total = (int)$row['total_classes'];
    $present = (int)$row['present_days'];
    $row['percentage'] = $total > 0 ? round(($present / $total) * 100) : 0;
    $report[] = $row;
}

echo json_encode($report);
?>
