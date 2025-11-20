<?php
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');

try {
    if(!file_exists("../config.php")) {
        echo json_encode([
            "status" => "success",
            "stats" => [
                "orders" => 0,
                "users" => 0,
                "products" => 0,
                "revenue" => "0.00",
                "pending_orders" => 0
            ],
            "recentOrders" => [],
            "topProducts" => [],
            "notifications" => []
        ]);
        exit;
    }
    
    include "../config.php";
    
    if(!isset($conn) || !$conn) {
        echo json_encode([
            "status" => "success",
            "stats" => [
                "orders" => 0,
                "users" => 0,
                "products" => 0,
                "revenue" => "0.00",
                "pending_orders" => 0
            ],
            "recentOrders" => [],
            "topProducts" => [],
            "notifications" => []
        ]);
        exit;
    }

// Get statistics
$stats = [];

// Total orders (disabled until orders table exists)
$stats['orders'] = 0;

// Total users
$userResult = @mysqli_query($conn, "SELECT COUNT(*) as count FROM users");
if($userResult) {
    $userRow = mysqli_fetch_assoc($userResult);
    $stats['users'] = $userRow['count'];
} else {
    $stats['users'] = 0;
}

// Total products (clothing + equipment)
$clothingResult = @mysqli_query($conn, "SELECT COUNT(*) as count FROM clothing_products");
$equipmentResult = @mysqli_query($conn, "SELECT COUNT(*) as count FROM equipment_products");
$clothingCount = 0;
$equipmentCount = 0;
if($clothingResult) {
    $row = mysqli_fetch_assoc($clothingResult);
    $clothingCount = $row['count'] ?? 0;
}
if($equipmentResult) {
    $row = mysqli_fetch_assoc($equipmentResult);
    $equipmentCount = $row['count'] ?? 0;
}
$stats['products'] = $clothingCount + $equipmentCount;

// Total revenue (disabled until orders table exists)
$stats['revenue'] = '0.00';
$stats['pending_orders'] = 0;

// Recent orders and top products (disabled until orders table exists)
$recentOrders = [];
$topProducts = [];

// Notifications
$notifications = [];

    echo json_encode([
        "status" => "success",
        "stats" => $stats,
        "recentOrders" => $recentOrders,
        "topProducts" => $topProducts,
        "notifications" => $notifications
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "status" => "success",
        "stats" => [
            "orders" => 0,
            "users" => 0,
            "products" => 0,
            "revenue" => "0.00",
            "pending_orders" => 0
        ],
        "recentOrders" => [],
        "topProducts" => [],
        "notifications" => []
    ]);
}
?>
