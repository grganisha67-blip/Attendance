<?php
include 'db.php';

$ledger_id = (int)($_GET['ledger_id'] ?? 0);

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
$sql = "SELECT id, name, roll FROM admin_students WHERE id IN ($ids) ORDER BY roll ASC";
$result = $conn->query($sql);

$students = [];
while ($row = $result->fetch_assoc()) {
    $students[] = $row;
}

echo json_encode($students);
?>
