<?php
include "config.php";

$username = $_POST['username'];

if (!isset($_FILES['profileImage'])) {
    echo json_encode(["status" => "no_file"]);
    exit;
}

$file = $_FILES['profileImage'];
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

if (!in_array(strtolower($ext), $allowed)) {
    echo json_encode(["status" => "invalid_type"]);
    exit;
}

$newName = $username . "_" . time() . "." . $ext;
$targetPath = "../uploads/profile/" . $newName;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    $sql = "UPDATE users SET profile_image='$newName' WHERE username='$username'";
    mysqli_query($conn, $sql);
    echo json_encode(["status" => "success", "filename" => $newName]);
} else {
    echo json_encode(["status" => "error"]);
}
?>
