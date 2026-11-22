<?php
header("Content-Type: application/json");
include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (($data["action"] ?? "") === "edit_subject") {
    $oldName = $conn->real_escape_string($data["old_name"]);
    $newName = $conn->real_escape_string(trim($data["new_name"]));

    if ($newName === "") {
        echo json_encode(["status" => "error", "message" => "Subject name cannot be empty!"]);
        exit;
    }

    $conn->query("UPDATE subjects SET name='$newName' WHERE name='$oldName'");
    $conn->query("UPDATE attendance SET subject='$newName' WHERE subject='$oldName'");

    echo json_encode(["status" => "success", "message" => "Subject updated successfully!"]);
}
?>
