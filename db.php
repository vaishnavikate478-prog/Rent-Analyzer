<?php
$host = "localhost";
$username = "root";
$password = "";
$database = "rent_analyzer";
$port = 3307;

$conn = new mysqli(
    $host,
    $username,
    $password,
    $database,
    $port
);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "Database connected successfully!";
?>