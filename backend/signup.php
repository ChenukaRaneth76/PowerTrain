<?php
include "config.php";

$username = $_POST['username'];
$email = $_POST['email'];
$password = $_POST['password'];

if (!$username || !$email || !$password) {
    echo "All fields required";
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$sql = "INSERT INTO users (username,email,password) VALUES ('$username','$email','$hashedPassword')";
if (mysqli_query($conn, $sql)) {
    echo "success";
} else {
    echo "Email already exists";
}
?>
