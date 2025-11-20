<?php
include "config.php";
header('Content-Type: application/json');

$type = $_GET['type'] ?? 'clothing';
$limit = $_GET['limit'] ?? null;
$category = $_GET['category'] ?? null;

// Determine table name
$table = '';
if ($type === 'clothing') {
    $table = 'clothing_products';
} elseif ($type === 'equipment') {
    $table = 'equipment_products';
} elseif ($type === 'training') {
    $table = 'training_sessions';
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid product type"
    ]);
    exit;
}

// Build query
if ($type === 'clothing') {
    // Use the view that includes stock information
    $sql = "SELECT cp.*, 
                   COALESCE(SUM(cs.stock_quantity), 0) as total_stock,
                   GROUP_CONCAT(CONCAT(cs.size, ':', cs.stock_quantity) ORDER BY 
                       FIELD(cs.size, 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL') SEPARATOR ',') as size_stock_info
            FROM clothing_products cp
            LEFT JOIN clothing_stock cs ON cp.id = cs.product_id
            GROUP BY cp.id
            ORDER BY cp.id DESC";
} elseif ($type === 'equipment') {
    $sql = "SELECT * FROM equipment_products ORDER BY id DESC";
} elseif ($type === 'training') {
    $sql = "SELECT * FROM training_sessions ORDER BY id DESC";
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid product type'
    ]);
    exit;
}

// Add category filter if specified
if ($category && $category !== 'all') {
    $category = mysqli_real_escape_string($conn, $category);
    if ($type === 'clothing') {
        $sql .= " HAVING cp.category = '$category'";
    } else {
        $sql .= " WHERE category = '$category'";
    }
}

// Add limit if specified
if ($limit) {
    $limit = intval($limit);
    $sql .= " LIMIT $limit";
}

$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode([
        "status" => "error",
        "message" => "Database query failed: " . mysqli_error($conn)
    ]);
    exit;
}

$products = [];
while ($row = mysqli_fetch_assoc($result)) {
    // Format the data based on type
    if ($type === 'training') {
        $products[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'trainer' => $row['trainer'],
            'duration' => $row['duration'],
            'date' => $row['date'],
            'time' => $row['time'],
            'capacity' => $row['capacity'],
            'enrolled' => $row['enrolled'] ?? 0,
            'price' => $row['price'],
            'description' => $row['description'] ?? '',
            'type' => 'training'
        ];
    } else {
        // Collect all available images
        $images = [];
        for ($i = 1; $i <= 6; $i++) {
            if (!empty($row["image$i"])) {
                $images[] = $row["image$i"];
            }
        }
        
        $product = [
            'id' => $row['id'],
            'name' => $row['name'],
            'category' => $row['category'],
            'price' => $row['price'],
            'image' => $row['image1'] ?? $row['image'] ?? '', // Main image
            'images' => $images, // All images
            'description' => $row['description'] ?? '',
            'status' => $row['status'] ?? 'normal',
            'type' => $type,
            'created_at' => $row['created_at'] ?? ''
        ];
        
        if ($type === 'clothing') {
            $product['sizes'] = $row['sizes'] ?? '';
            $product['colors'] = $row['colors'] ?? '';
            $product['total_stock'] = $row['total_stock'] ?? 0;
            $product['size_stock_info'] = $row['size_stock_info'] ?? '';
            
            // Parse size stock info into array
            $sizeStock = [];
            if (!empty($row['size_stock_info'])) {
                $stockPairs = explode(',', $row['size_stock_info']);
                foreach ($stockPairs as $pair) {
                    if (strpos($pair, ':') !== false) {
                        list($size, $quantity) = explode(':', $pair);
                        $sizeStock[trim($size)] = intval($quantity);
                    }
                }
            }
            $product['size_stock'] = $sizeStock;
            
            // Determine stock status for clothing
            $totalStock = intval($row['total_stock'] ?? 0);
            if ($totalStock == 0) {
                $product['stock_status'] = 'out';
            } elseif ($totalStock <= 10) {
                $product['stock_status'] = 'low';
            } else {
                $product['stock_status'] = 'in';
            }
            
        } elseif ($type === 'equipment') {
            $product['material'] = $row['material'] ?? '';
            $product['stock'] = $row['stock'] ?? 0;
            
            // Determine stock status for equipment
            $stock = intval($row['stock'] ?? 0);
            if ($stock == 0) {
                $product['stock_status'] = 'out';
            } elseif ($stock <= 5) {
                $product['stock_status'] = 'low';
            } else {
                $product['stock_status'] = 'in';
            }
        }
        
        $products[] = $product;
    }
}

echo json_encode([
    "status" => "success",
    "products" => $products,
    "count" => count($products)
]);
?>
