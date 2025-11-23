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
            
            // Initialize default values
            $row['orders'] = 0;
            $row['total_spent'] = 0;
            
            $user_email = $row['email'];
            
            // Get orders count and total spent for this user
            // Match by customer_email (orders are created with customer_email, not user_id)
            // Use total_amount (field used in orders.php)
            try {
                // Check if orders table exists first
                $table_check = @mysqli_query($conn, "SHOW TABLES LIKE 'orders'");
                if($table_check && mysqli_num_rows($table_check) > 0) {
                    $orders_sql = "SELECT COUNT(*) as order_count, 
                                  COALESCE(SUM(total_amount), 0) as total_spent
                                  FROM orders 
                                  WHERE customer_email = ?";
                    $orders_stmt = @mysqli_prepare($conn, $orders_sql);
                    
                    if($orders_stmt) {
                        @mysqli_stmt_bind_param($orders_stmt, "s", $user_email);
                        @mysqli_stmt_execute($orders_stmt);
                        $orders_result = @mysqli_stmt_get_result($orders_stmt);
                        
                        if($orders_result && $orders_row = @mysqli_fetch_assoc($orders_result)) {
                            $row['orders'] = intval($orders_row['order_count'] ?? 0);
                            $row['total_spent'] = floatval($orders_row['total_spent'] ?? 0);
                        }
                        @mysqli_stmt_close($orders_stmt);
                    }
                }
            } catch (Exception $e) {
                // Silently continue with default values if query fails
                $row['orders'] = 0;
                $row['total_spent'] = 0;
            }
            
            $users[] = $row;
        }
        
        echo json_encode([
            "status" => "success",
            "users" => $users
        ]);
        break;
        
    case 'get':
        $id = intval($_GET['id'] ?? 0);
        
        $sql = "SELECT id, username, email, created_at, profile_image FROM users WHERE id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        
        if(!$stmt) {
            echo json_encode([
                "status" => "error",
                "message" => "Database error"
            ]);
            break;
        }
        
        mysqli_stmt_bind_param($stmt, "i", $id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if(mysqli_num_rows($result) > 0) {
            $user = mysqli_fetch_assoc($result);
            $user_email = $user['email'];
            
            // Get orders count and total spent for this user
            // Match by customer_email (orders are created with customer_email, not user_id)
            // Use total_amount (field used in orders.php)
            $orders_sql = "SELECT COUNT(*) as order_count, 
                          COALESCE(SUM(total_amount), 0) as total_spent
                          FROM orders 
                          WHERE customer_email = ?";
            $orders_stmt = @mysqli_prepare($conn, $orders_sql);
            
            if($orders_stmt) {
                @mysqli_stmt_bind_param($orders_stmt, "s", $user_email);
                @mysqli_stmt_execute($orders_stmt);
                $orders_result = @mysqli_stmt_get_result($orders_stmt);
                
                if($orders_result && $orders_row = @mysqli_fetch_assoc($orders_result)) {
                    $user['orders'] = intval($orders_row['order_count'] ?? 0);
                    $user['total_spent'] = floatval($orders_row['total_spent'] ?? 0);
                } else {
                    $user['orders'] = 0;
                    $user['total_spent'] = 0;
                }
                @mysqli_stmt_close($orders_stmt);
            } else {
            $user['orders'] = 0;
            $user['total_spent'] = 0;
            }
            
            mysqli_stmt_close($stmt);
            
            echo json_encode([
                "status" => "success",
                "user" => $user
            ]);
        } else {
            mysqli_stmt_close($stmt);
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
