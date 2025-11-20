<?php
include "config.php";

$email = $_POST['email'];
$password = $_POST['password'];

// Check if admin credentials from users table
if ($email === 'powertainadmin@gmail.com') {
    $adminSql = "SELECT * FROM users WHERE email = ? AND username = 'Admin' LIMIT 1";
    $stmt = mysqli_prepare($conn, $adminSql);
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    $adminResult = mysqli_stmt_get_result($stmt);
    
    if (mysqli_num_rows($adminResult) === 1) {
        $admin = mysqli_fetch_assoc($adminResult);
        
        // Verify hashed password
        if (password_verify($password, $admin['password'])) {
            echo json_encode([
                "status" => "success",
                "username" => $admin['username'],
                "email" => $admin['email'],
                "role" => "admin",
                "profile_image" => null,
                "gender" => null
            ]);
            mysqli_stmt_close($stmt);
            exit();
        }
    }
    
    mysqli_stmt_close($stmt);
    // If we reach here, admin login failed
    echo json_encode(["status" => "wrong_password"]);
    exit();
}

// Regular user login
$sql = "SELECT * FROM users WHERE email='$email'";
$result = mysqli_query($conn, $sql);

if (mysqli_num_rows($result) == 1) {
    $user = mysqli_fetch_assoc($result);

    if (password_verify($password, $user['password'])) {
        $profileImage = isset($user['profile_image']) ? $user['profile_image'] : null;
        $gender = isset($user['gender']) ? $user['gender'] : null;
        echo json_encode([
            "status" => "success",
            "username" => $user['username'],
            "email" => $user['email'],
            "role" => "user",
            "profile_image" => $profileImage,
            "gender" => $gender
        ]);
    } else {
        echo json_encode(["status" => "wrong_password"]);
    }
} else {
    echo json_encode(["status" => "no_user"]);
}
?>
