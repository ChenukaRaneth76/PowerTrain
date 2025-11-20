<?php
header('Content-Type: application/json');
include "../config.php";

// Get action from request
$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'change_password':
        changePassword($conn);
        break;
    case 'get_admin_info':
        getAdminInfo($conn);
        break;
    case 'initialize_admin':
        initializeAdmin($conn);
        break;
    default:
        echo json_encode(["status" => "error", "message" => "Invalid action"]);
}

function changePassword($conn) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            $data = $_POST;
        }
        
        $currentPassword = $data['current_password'] ?? '';
        $newPassword = $data['new_password'] ?? '';
        $confirmPassword = $data['confirm_password'] ?? '';
        
        // Validation
        if (empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
            echo json_encode(["status" => "error", "message" => "All fields are required"]);
            return;
        }
        
        if ($newPassword !== $confirmPassword) {
            echo json_encode(["status" => "error", "message" => "New passwords do not match"]);
            return;
        }
        
        if (strlen($newPassword) < 8) {
            echo json_encode(["status" => "error", "message" => "Password must be at least 8 characters long"]);
            return;
        }
        
        // Get current admin password from users table
        $sql = "SELECT * FROM users WHERE email = 'powertainadmin@gmail.com' AND username = 'Admin' LIMIT 1";
        $result = mysqli_query($conn, $sql);
        
        if (mysqli_num_rows($result) === 0) {
            echo json_encode(["status" => "error", "message" => "Admin not found in users table."]);
            return;
        }
        
        $admin = mysqli_fetch_assoc($result);
        
        // Verify current password
        if (!password_verify($currentPassword, $admin['password'])) {
            echo json_encode(["status" => "error", "message" => "Current password is incorrect"]);
            return;
        }
        
        // Hash new password
        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
        
        // Update password in users table
        $updateSql = "UPDATE users SET password = ? WHERE email = 'powertainadmin@gmail.com' AND username = 'Admin'";
        $stmt = mysqli_prepare($conn, $updateSql);
        mysqli_stmt_bind_param($stmt, "s", $hashedPassword);
        
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status" => "success",
                "message" => "Password changed successfully!"
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to update password"]);
        }
        
        mysqli_stmt_close($stmt);
        
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
    }
}

function getAdminInfo($conn) {
    $sql = "SELECT email, username, created_at FROM users WHERE email = 'powertainadmin@gmail.com' AND username = 'Admin' LIMIT 1";
    $result = mysqli_query($conn, $sql);
    
    if (mysqli_num_rows($result) > 0) {
        $admin = mysqli_fetch_assoc($result);
        echo json_encode([
            "status" => "success",
            "admin" => $admin
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Admin not found"]);
    }
}

function initializeAdmin($conn) {
    // Check if admin exists in users table
    $checkAdmin = "SELECT * FROM users WHERE email = 'powertainadmin@gmail.com' AND username = 'Admin' LIMIT 1";
    $result = mysqli_query($conn, $checkAdmin);
    
    if (mysqli_num_rows($result) === 0) {
        // Create default admin with hashed password in users table
        $defaultPassword = 'pwramudu123'; // This will be hashed
        $hashedPassword = password_hash($defaultPassword, PASSWORD_BCRYPT);
        
        $insertAdmin = "INSERT INTO users (email, username, password) VALUES (?, ?, ?)";
        $stmt = mysqli_prepare($conn, $insertAdmin);
        $email = 'powertainadmin@gmail.com';
        $username = 'Admin';
        mysqli_stmt_bind_param($stmt, "sss", $email, $username, $hashedPassword);
        
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                "status" => "success",
                "message" => "Admin initialized successfully in users table with default password"
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to create admin: " . mysqli_error($conn)]);
        }
        
        mysqli_stmt_close($stmt);
    } else {
        echo json_encode(["status" => "info", "message" => "Admin already exists in users table"]);
    }
}

mysqli_close($conn);
?>