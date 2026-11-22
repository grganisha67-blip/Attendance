<?php
include 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// 1. Sabai data tanne (GET)
if ($method === 'GET') {
    $data = [
        "programs" => [],
        "semesters" => [],
        "subjects" => [],
        "faculty" => [],
        "students" => [],
        "ledgers" => []
    ];

    $res = $conn->query("SELECT * FROM programs");
    while ($r = $res->fetch_assoc()) { $r['id'] = (int)$r['id']; $data['programs'][] = $r; }

    $res = $conn->query("SELECT * FROM semesters");
    while ($r = $res->fetch_assoc()) { 
        $r['id'] = (int)$r['id']; 
        $r['programId'] = (int)$r['programId']; 
        $r['active'] = (bool)$r['active']; 
        $data['semesters'][] = $r; 
    }

    $res = $conn->query("SELECT * FROM subjects");
    while ($r = $res->fetch_assoc()) { 
        $r['id'] = (int)$r['id']; 
        $r['programId'] = (int)$r['programId']; 
        $r['semesterId'] = (int)$r['semesterId']; 
        $data['subjects'][] = $r; 
    }

    $res = $conn->query("SELECT * FROM faculty");
    while ($r = $res->fetch_assoc()) { $r['id'] = (int)$r['id']; $data['faculty'][] = $r; }

    $res = $conn->query("SELECT * FROM admin_students");
    while ($r = $res->fetch_assoc()) { 
        $r['id'] = (int)$r['id']; 
        $r['semesterId'] = (int)$r['semesterId']; 
        $data['students'][] = $r; 
    }

    $res = $conn->query("SELECT * FROM ledgers");
    while ($r = $res->fetch_assoc()) { 
        $r['id'] = (int)$r['id']; 
        $r['subjectId'] = (int)$r['subjectId']; 
        $r['facultyId'] = (int)$r['facultyId']; 
        $r['studentIds'] = json_decode($r['studentIds']); 
        $data['ledgers'][] = $r; 
    }

    echo json_encode($data);
    exit();
}

// 2. Add, Edit, Delete garne (POST)
$input = json_decode(file_get_contents("php://input"), true);
$action = $input['action']; // 'add', 'edit', 'delete'
$type = $input['type'];

if ($action === 'add') {
    if ($type === 'programs') {
        $name = $conn->real_escape_string($input['name']);
        $dur = $conn->real_escape_string($input['duration']);
        $conn->query("INSERT INTO programs (name, duration) VALUES ('$name', '$dur')");
    } elseif ($type === 'semesters') {
        $pid = (int)$input['programId'];
        $name = $conn->real_escape_string($input['name']);
        $start = $conn->real_escape_string($input['start']);
        $end = $conn->real_escape_string($input['end']);
        $act = $input['active'] ? 1 : 0;
        $conn->query("INSERT INTO semesters (programId, name, start, end, active) VALUES ($pid, '$name', '$start', '$end', $act)");
    } elseif ($type === 'subjects') {
        $pid = (int)$input['programId'];
        $sid = (int)$input['semesterId'];
        $name = $conn->real_escape_string($input['name']);
        $conn->query("INSERT INTO subjects (programId, semesterId, name) VALUES ($pid, $sid, '$name')");
    } elseif ($type === 'faculty') {
        $name = $conn->real_escape_string($input['name']);
        $phone = $conn->real_escape_string($input['phone']);
        $email = $conn->real_escape_string($input['email']);
        $conn->query("INSERT INTO faculty (name, phone, email) VALUES ('$name', '$phone', '$email')");
    } elseif ($type === 'students') {
        $name = $conn->real_escape_string($input['name']);
        $roll = $conn->real_escape_string($input['roll']);
        $sid = (int)$input['semesterId'];
        $conn->query("INSERT INTO admin_students (name, roll, semesterId) VALUES ('$name', '$roll', $sid)");
    } elseif ($type === 'ledgers') {
        $subId = (int)$input['subjectId'];
        $facId = (int)$input['facultyId'];
        $stIds = $conn->real_escape_string(json_encode($input['studentIds']));
        $conn->query("INSERT INTO ledgers (subjectId, facultyId, studentIds) VALUES ($subId, $facId, '$stIds')");
    }
} elseif ($action === 'edit') {
    $id = (int)$input['id'];
    if ($type === 'programs') {
        $name = $conn->real_escape_string($input['name']);
        $dur = $conn->real_escape_string($input['duration']);
        $conn->query("UPDATE programs SET name='$name', duration='$dur' WHERE id=$id");
    } elseif ($type === 'semesters') {
        $name = $conn->real_escape_string($input['name']);
        $start = $conn->real_escape_string($input['start']);
        $end = $conn->real_escape_string($input['end']);
        $conn->query("UPDATE semesters SET name='$name', start='$start', end='$end' WHERE id=$id");
    } elseif ($type === 'subjects') {
        $name = $conn->real_escape_string($input['name']);
        $conn->query("UPDATE subjects SET name='$name' WHERE id=$id");
        } elseif ($type === 'faculty') {
        $oldFac = $conn->query("SELECT email FROM faculty WHERE id=$id")->fetch_assoc();
        $oldEmail = $conn->real_escape_string($oldFac['email'] ?? '');

        $name = $conn->real_escape_string($input['name']);
        $phone = $conn->real_escape_string($input['phone']);
        $email = $conn->real_escape_string($input['email']);
        $conn->query("UPDATE faculty SET name='$name', phone='$phone', email='$email' WHERE id=$id");

        // Teacher ko login account (users table) ma pani naam ra email sync garne
        if ($oldEmail !== '') {
            $conn->query("UPDATE users SET name='$name', email='$email', username='$email' WHERE email='$oldEmail' AND role='teacher'");
        }
    } elseif ($type === 'students') {
        $name = $conn->real_escape_string($input['name']);
        $roll = $conn->real_escape_string($input['roll']);
        $sid = (int)$input['semesterId'];
        $conn->query("UPDATE admin_students SET name='$name', roll='$roll', semesterId=$sid WHERE id=$id");

        // 1. Semester change vayepaxi purano semester ko ledgers bata automatic remove garne
        $lRes = $conn->query("SELECT l.id, l.studentIds, s.semesterId FROM ledgers l JOIN subjects s ON l.subjectId = s.id");
        while ($row = $lRes->fetch_assoc()) {
            $stIds = json_decode($row['studentIds'], true) ?: [];
            if ((int)$row['semesterId'] !== $sid && in_array($id, $stIds)) {
                $updatedIds = array_values(array_diff($stIds, [$id]));
                $newJson = $conn->real_escape_string(json_encode($updatedIds));
                $lid = (int)$row['id'];
                $conn->query("UPDATE ledgers SET studentIds='$newJson' WHERE id=$lid");
            }
        }

        // 2. Student ko login account (users table) ma pani naya semester ra program sync garne
        $semInfo = $conn->query("SELECT sem.name as sem_name, p.name as prog_name FROM semesters sem JOIN programs p ON sem.programId = p.id WHERE sem.id = $sid")->fetch_assoc();
        if ($semInfo) {
            $newSemName = $conn->real_escape_string($semInfo['sem_name']);
            $newProgName = $conn->real_escape_string($semInfo['prog_name']);
            $conn->query("UPDATE users SET semester='$newSemName', faculty='$newProgName' WHERE name='$name' AND role='student'");
        }
    }

    elseif ($type === 'ledgers') {
        $subId = (int)$input['subjectId'];
        $facId = (int)$input['facultyId'];
        $stIds = $conn->real_escape_string(json_encode($input['studentIds']));
        $conn->query("UPDATE ledgers SET subjectId=$subId, facultyId=$facId, studentIds='$stIds' WHERE id=$id");
    }
} elseif ($action === 'delete') {
    $id = (int)$input['id'];
    if ($type === 'programs') {
        $conn->query("DELETE FROM subjects WHERE programId=$id");
        $conn->query("DELETE FROM semesters WHERE programId=$id");
        $conn->query("DELETE FROM programs WHERE id=$id");
    } elseif ($type === 'semesters') {
        $conn->query("DELETE FROM subjects WHERE semesterId=$id");
        $conn->query("DELETE FROM admin_students WHERE semesterId=$id");
        $conn->query("DELETE FROM semesters WHERE id=$id");
    } elseif ($type === 'subjects') {
        $conn->query("DELETE FROM ledgers WHERE subjectId=$id");
        $conn->query("DELETE FROM subjects WHERE id=$id");
    } elseif ($type === 'faculty') {
        $conn->query("DELETE FROM ledgers WHERE facultyId=$id");
        $conn->query("DELETE FROM faculty WHERE id=$id");
    } elseif ($type === 'students') {
        $conn->query("DELETE FROM admin_students WHERE id=$id");
    } elseif ($type === 'ledgers') {
        $conn->query("DELETE FROM ledgers WHERE id=$id");
    }
}


echo json_encode(["status" => "success"]);
?>
