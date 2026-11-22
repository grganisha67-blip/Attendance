<?php
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "attendance";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection failed"]));
}
header("Content-Type: application/json");
?>
