<?php
include "../config.php";
header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

// Create orders table if it doesn't exist
$createOrdersTable = "CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";
mysqli_query($conn, $createOrdersTable);

$createOrderItemsTable = "CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
)";
mysqli_query($conn, $createOrderItemsTable);

switch($action) {
    case 'list':
        $filter = $_GET['filter'] ?? 'all';
        
        $sql = "SELECT o.*, u.username as customer_name, u.email as customer_email,
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id";
        
        if($filter !== 'all') {
            $sql .= " WHERE o.status = '$filter'";
        }
        
        $sql .= " ORDER BY o.id DESC";
        
        $result = mysqli_query($conn, $sql);
        
        $orders = [];
        while($row = mysqli_fetch_assoc($result)) {
            // Get items for this order
            $itemsSql = "SELECT product_name, quantity FROM order_items WHERE order_id = {$row['id']}";
            $itemsResult = mysqli_query($conn, $itemsSql);
            $items = [];
            while($item = mysqli_fetch_assoc($itemsResult)) {
                $items[] = $item['product_name'] . ' x' . $item['quantity'];
            }
            
            $orders[] = [
                'id' => $row['id'],
                'customer' => $row['customer_name'] ?? 'Guest',
                'email' => $row['customer_email'] ?? 'N/A',
                'items' => implode(', ', $items),
                'item_count' => $row['item_count'],
                'total' => $row['total'],
                'status' => $row['status'],
                'date' => date('Y-m-d', strtotime($row['created_at']))
            ];
        }
        
        echo json_encode([
            "status" => "success",
            "orders" => $orders
        ]);
        break;
        
    case 'get':
        $id = $_GET['id'] ?? 0;
        
        $sql = "SELECT o.*, u.username as customer_name, u.email as customer_email
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                WHERE o.id = $id";
        $result = mysqli_query($conn, $sql);
        
        if(mysqli_num_rows($result) > 0) {
            $order = mysqli_fetch_assoc($result);
            
            // Get order items
            $itemsSql = "SELECT * FROM order_items WHERE order_id = $id";
            $itemsResult = mysqli_query($conn, $itemsSql);
            $products = [];
            while($item = mysqli_fetch_assoc($itemsResult)) {
                $products[] = [
                    'name' => $item['product_name'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price']
                ];
            }
            
            echo json_encode([
                "status" => "success",
                "order" => [
                    'id' => $order['id'],
                    'customer' => $order['customer_name'] ?? 'Guest',
                    'email' => $order['customer_email'] ?? 'N/A',
                    'total' => $order['total'],
                    'status' => $order['status'],
                    'date' => date('Y-m-d H:i', strtotime($order['created_at'])),
                    'products' => $products
                ]
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Order not found"
            ]);
        }
        break;
        
    case 'update_status':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id']);
        $status = mysqli_real_escape_string($conn, $data['status']);
        
        $validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if(!in_array($status, $validStatuses)) {
            echo json_encode([
                "status" => "error",
                "message" => "Invalid status"
            ]);
            break;
        }
        
        $sql = "UPDATE orders SET status = '$status' WHERE id = $id";
        
        if(mysqli_query($conn, $sql)) {
            echo json_encode([
                "status" => "success",
                "message" => "Order status updated successfully"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => mysqli_error($conn)
            ]);
        }
        break;
        
    case 'delete':
        $id = $_GET['id'] ?? 0;
        
        // Delete order items first (CASCADE should handle this, but just in case)
        mysqli_query($conn, "DELETE FROM order_items WHERE order_id = $id");
        
        $sql = "DELETE FROM orders WHERE id = $id";
        
        if(mysqli_query($conn, $sql)) {
            echo json_encode([
                "status" => "success",
                "message" => "Order deleted successfully"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => mysqli_error($conn)
            ]);
        }
        break;
        
    case 'create':
        // For future implementation - creating orders from admin panel
        $data = json_decode(file_get_contents('php://input'), true);
        
        $userId = intval($data['user_id'] ?? 0);
        $total = floatval($data['total']);
        $status = mysqli_real_escape_string($conn, $data['status'] ?? 'pending');
        
        $sql = "INSERT INTO orders (user_id, total, status) VALUES ($userId, $total, '$status')";
        
        if(mysqli_query($conn, $sql)) {
            $orderId = mysqli_insert_id($conn);
            
            // Insert order items
            if(isset($data['items']) && is_array($data['items'])) {
                foreach($data['items'] as $item) {
                    $productName = mysqli_real_escape_string($conn, $item['product_name']);
                    $productType = mysqli_real_escape_string($conn, $item['product_type']);
                    $quantity = intval($item['quantity']);
                    $price = floatval($item['price']);
                    
                    $itemSql = "INSERT INTO order_items (order_id, product_name, product_type, quantity, price) 
                               VALUES ($orderId, '$productName', '$productType', $quantity, $price)";
                    mysqli_query($conn, $itemSql);
                }
            }
            
            echo json_encode([
                "status" => "success",
                "message" => "Order created successfully",
                "id" => $orderId
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => mysqli_error($conn)
            ]);
        }
        break;
        
    default:
        echo json_encode([
            "status" => "error",
            "message" => "Invalid action"
        ]);
}
?>
