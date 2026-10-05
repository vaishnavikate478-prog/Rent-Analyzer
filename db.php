<?php
$conn = mysqli_connect("localhost", "root", "", "rent_analyzer");
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
?>