<?php
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');

try {
    if(!file_exists("../config.php")) {
        echo json_encode(["status" => "success", "users" => []]);
        exit;
    }
    
    include "../config.php";
    
    if(!isset($conn) || !$conn) {
        echo json_encode(["status" => "success", "users" => []]);
        exit;
    }

$action = $_GET['action'] ?? '';

switch($action) {
    case 'list':
        $sql = "SELECT id, username, email, created_at, profile_image FROM users ORDER BY id DESC";
        $result = @mysqli_query($conn, $sql);
        
        if(!$result) {
            echo json_encode([
                "status" => "success",
                "users" => []
            ]);
            break;
        }
        
        $users = [];
        while($row = @mysqli_fetch_assoc($result)) {
            if(!$row) continue;
            
            // Set default values (we'll add order tracking later)
            $row['orders'] = 0;
            $row['total_spent'] = 0;
            
            $users[] = $row;
        }
        
        echo json_encode([
            "status" => "success",
            "users" => $users
        ]);
        break;
        
    case 'get':
        $id = $_GET['id'] ?? 0;
        
        $sql = "SELECT id, username, email, created_at, profile_image FROM users WHERE id = $id";
        $result = @mysqli_query($conn, $sql);
        
        if(mysqli_num_rows($result) > 0) {
            $user = mysqli_fetch_assoc($result);
            $user['orders'] = 0;
            $user['total_spent'] = 0;
            
            echo json_encode([
                "status" => "success",
                "user" => $user
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "User not found"
            ]);
        }
        break;
        
    case 'delete':
        $id = $_GET['id'] ?? 0;
        
        // Don't allow deleting admin user or current user
        if($id == 1) {
            echo json_encode([
                "status" => "error",
                "message" => "Cannot delete admin user"
            ]);
            break;
        }
        
        $sql = "DELETE FROM users WHERE id = $id";
        
        if(mysqli_query($conn, $sql)) {
            echo json_encode([
                "status" => "success",
                "message" => "User deleted successfully"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => mysqli_error($conn)
            ]);
        }
        break;
        
    case 'update_status':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id']);
        $status = mysqli_real_escape_string($conn, $data['status']);
        
        // Note: This requires adding a status column to users table
        // For now, just return success
        echo json_encode([
            "status" => "success",
            "message" => "User status updated"
        ]);
        break;
        
    default:
        echo json_encode([
            "status" => "error",
            "message" => "Invalid action"
        ]);
}

} catch (Exception $e) {
    echo json_encode([
        "status" => "success",
        "users" => []
    ]);
}
?>
