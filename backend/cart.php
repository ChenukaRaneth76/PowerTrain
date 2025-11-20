<?php
error_reporting(0); // Suppress all errors from being output
ini_set('display_errors', 0);

session_start();
header('Content-Type: application/json');
include 'config.php';

// Get session ID for cart
if (!isset($_SESSION['cart_id'])) {
    $_SESSION['cart_id'] = session_id();
}
$session_id = $_SESSION['cart_id'];

$action = $_GET['action'] ?? 'get';

switch($action) {
    case 'add':
        // Add item to cart
        $data = json_decode(file_get_contents('php://input'), true);
        
        $product_id = intval($data['product_id']);
        $product_type = mysqli_real_escape_string($conn, $data['product_type']);
        $product_name = mysqli_real_escape_string($conn, $data['product_name']);
        $product_price = floatval($data['product_price']);
        $product_image = mysqli_real_escape_string($conn, $data['product_image'] ?? '');
        $quantity = intval($data['quantity'] ?? 1);
        $size = mysqli_real_escape_string($conn, $data['size'] ?? '');
        $color = mysqli_real_escape_string($conn, $data['color'] ?? '');
        
        // Check if item already exists in cart
        $check_sql = "SELECT id, quantity FROM cart WHERE session_id = ? AND product_id = ? AND product_type = ?";
        if (!empty($size)) {
            $check_sql .= " AND size = ?";
        }
        
        $stmt = mysqli_prepare($conn, $check_sql);
        if (!empty($size)) {
            mysqli_stmt_bind_param($stmt, "siss", $session_id, $product_id, $product_type, $size);
        } else {
            mysqli_stmt_bind_param($stmt, "sis", $session_id, $product_id, $product_type);
        }
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if (mysqli_num_rows($result) > 0) {
            // Update quantity
            $row = mysqli_fetch_assoc($result);
            $new_quantity = $row['quantity'] + $quantity;
            $update_sql = "UPDATE cart SET quantity = ? WHERE id = ?";
            $update_stmt = mysqli_prepare($conn, $update_sql);
            mysqli_stmt_bind_param($update_stmt, "ii", $new_quantity, $row['id']);
            mysqli_stmt_execute($update_stmt);
            mysqli_stmt_close($update_stmt);
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Cart updated',
                'cart_count' => getCartCount($conn, $session_id)
            ]);
        } else {
            // Insert new item
            $insert_sql = "INSERT INTO cart (session_id, product_id, product_type, product_name, product_price, product_image, quantity, size, color) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $insert_stmt = mysqli_prepare($conn, $insert_sql);
            mysqli_stmt_bind_param($insert_stmt, "sissdsiss", 
                $session_id, $product_id, $product_type, $product_name, 
                $product_price, $product_image, $quantity, $size, $color);
            
            // Debug: Log what we're inserting
            error_log("Cart Insert - Image: $product_image, Type: $product_type, Name: $product_name");
            
            if (mysqli_stmt_execute($insert_stmt)) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Added to cart',
                    'cart_count' => getCartCount($conn, $session_id)
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Failed to add to cart: ' . mysqli_error($conn)
                ]);
            }
            mysqli_stmt_close($insert_stmt);
        }
        mysqli_stmt_close($stmt);
        break;
        
    case 'get':
        // Get all cart items
        $sql = "SELECT * FROM cart WHERE session_id = ? ORDER BY created_at DESC";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "s", $session_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        $items = [];
        $total = 0;
        
        while ($row = mysqli_fetch_assoc($result)) {
            $subtotal = $row['product_price'] * $row['quantity'];
            $total += $subtotal;
            
            $items[] = [
                'id' => $row['id'],
                'product_id' => $row['product_id'],
                'product_type' => $row['product_type'],
                'product_name' => $row['product_name'],
                'product_price' => $row['product_price'],
                'product_image' => $row['product_image'],
                'quantity' => $row['quantity'],
                'size' => $row['size'],
                'color' => $row['color'],
                'subtotal' => $subtotal
            ];
        }
        
        echo json_encode([
            'status' => 'success',
            'items' => $items,
            'total' => $total,
            'count' => count($items)
        ]);
        
        mysqli_stmt_close($stmt);
        break;
        
    case 'update':
        // Update item quantity
        $data = json_decode(file_get_contents('php://input'), true);
        $cart_id = intval($data['cart_id']);
        $quantity = intval($data['quantity']);
        
        if ($quantity <= 0) {
            // Remove item if quantity is 0 or less
            $sql = "DELETE FROM cart WHERE id = ? AND session_id = ?";
            $stmt = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt, "is", $cart_id, $session_id);
        } else {
            // Update quantity
            $sql = "UPDATE cart SET quantity = ? WHERE id = ? AND session_id = ?";
            $stmt = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt, "iis", $quantity, $cart_id, $session_id);
        }
        
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Cart updated',
                'cart_count' => getCartCount($conn, $session_id)
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to update cart'
            ]);
        }
        mysqli_stmt_close($stmt);
        break;
        
    case 'remove':
        // Remove item from cart
        $cart_id = intval($_GET['id'] ?? 0);
        
        $sql = "DELETE FROM cart WHERE id = ? AND session_id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "is", $cart_id, $session_id);
        
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Item removed',
                'cart_count' => getCartCount($conn, $session_id)
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to remove item'
            ]);
        }
        mysqli_stmt_close($stmt);
        break;
        
    case 'clear':
        // Clear entire cart
        $sql = "DELETE FROM cart WHERE session_id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "s", $session_id);
        
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Cart cleared'
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to clear cart'
            ]);
        }
        mysqli_stmt_close($stmt);
        break;
        
    case 'count':
        // Get cart item count
        echo json_encode([
            'status' => 'success',
            'count' => getCartCount($conn, $session_id)
        ]);
        break;
        
    default:
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid action'
        ]);
}

// Helper function to get cart count
function getCartCount($conn, $session_id) {
    $sql = "SELECT COUNT(*) as count FROM cart WHERE session_id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $session_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);
    return $row['count'];
}

mysqli_close($conn);
?>