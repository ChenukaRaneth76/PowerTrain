<?php
include "../config.php";
header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

// Create tables if they don't exist
$createClothingTable = "CREATE TABLE IF NOT EXISTS clothing_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    image TEXT,
    description TEXT,
    sizes VARCHAR(255),
    status VARCHAR(50) DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
mysqli_query($conn, $createClothingTable);

$createEquipmentTable = "CREATE TABLE IF NOT EXISTS equipment_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    image TEXT,
    description TEXT,
    material VARCHAR(255),
    status VARCHAR(50) DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
mysqli_query($conn, $createEquipmentTable);

switch($action) {
    case 'list':
        $type = $_GET['type'] ?? 'clothing';
        $table = $type === 'clothing' ? 'clothing_products' : 'equipment_products';
        
        $sql = "SELECT * FROM $table ORDER BY id DESC";
        $result = mysqli_query($conn, $sql);
        
        $products = [];
        while($row = mysqli_fetch_assoc($result)) {
            $products[] = $row;
        }
        
        echo json_encode([
            "status" => "success",
            "products" => $products
        ]);
        break;
        
    case 'get':
        $type = $_GET['type'] ?? 'clothing';
        $id = intval($_GET['id'] ?? 0);
        
        if ($id <= 0) {
            echo json_encode([
                "status" => "error",
                "message" => "Invalid product ID"
            ]);
            break;
        }
        
        $table = $type === 'clothing' ? 'clothing_products' : 'equipment_products';
        
        $sql = "SELECT * FROM $table WHERE id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "i", $id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if(mysqli_num_rows($result) > 0) {
            $row = mysqli_fetch_assoc($result);
            
            // Format product data with multiple images
            $images = [];
            for ($i = 1; $i <= 6; $i++) {
                if (!empty($row["image$i"])) {
                    $images[] = $row["image$i"];
                }
            }
            
            $product = $row;
            $product['images'] = $images;
            $product['image'] = $row['image1'] ?? $row['image'] ?? '';
            
            // Add size stock info for clothing
            if ($type === 'clothing') {
                $stock_sql = "SELECT size, stock_quantity FROM clothing_stock WHERE product_id = ?";
                $stock_stmt = mysqli_prepare($conn, $stock_sql);
                mysqli_stmt_bind_param($stock_stmt, "i", $id);
                mysqli_stmt_execute($stock_stmt);
                $stock_result = mysqli_stmt_get_result($stock_stmt);
                
                $size_stock = [];
                $total_stock = 0;
                while ($stock_row = mysqli_fetch_assoc($stock_result)) {
                    $size_stock[$stock_row['size']] = intval($stock_row['stock_quantity']);
                    $total_stock += intval($stock_row['stock_quantity']);
                }
                
                $product['size_stock'] = $size_stock;
                $product['total_stock'] = $total_stock;
                
                // Determine stock status
                if ($total_stock == 0) {
                    $product['stock_status'] = 'out';
                } elseif ($total_stock <= 10) {
                    $product['stock_status'] = 'low';
                } else {
                    $product['stock_status'] = 'in';
                }
                
                mysqli_stmt_close($stock_stmt);
            } else {
                // Equipment stock status
                $stock = intval($row['stock'] ?? 0);
                if ($stock == 0) {
                    $product['stock_status'] = 'out';
                } elseif ($stock <= 5) {
                    $product['stock_status'] = 'low';
                } else {
                    $product['stock_status'] = 'in';
                }
            }
            
            echo json_encode([
                "status" => "success",
                "product" => $product
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Product not found"
            ]);
        }
        mysqli_stmt_close($stmt);
        break;
        
    case 'create':
        $data = json_decode(file_get_contents('php://input'), true);
        $table = $data['type'] === 'clothing' ? 'clothing_products' : 'equipment_products';
        
        $name = mysqli_real_escape_string($conn, $data['name']);
        $category = mysqli_real_escape_string($conn, $data['category']);
        $price = floatval($data['price']);
        $description = mysqli_real_escape_string($conn, $data['description'] ?? '');
        $status = mysqli_real_escape_string($conn, $data['status'] ?? 'normal');
        
        // Handle multiple images
        $image1 = mysqli_real_escape_string($conn, $data['image1'] ?? '');
        $image2 = mysqli_real_escape_string($conn, $data['image2'] ?? '');
        $image3 = mysqli_real_escape_string($conn, $data['image3'] ?? '');
        $image4 = mysqli_real_escape_string($conn, $data['image4'] ?? '');
        $image5 = mysqli_real_escape_string($conn, $data['image5'] ?? '');
        $image6 = mysqli_real_escape_string($conn, $data['image6'] ?? '');
        
        if($data['type'] === 'clothing') {
            $sizes = mysqli_real_escape_string($conn, $data['sizes'] ?? '');
            $colors = mysqli_real_escape_string($conn, $data['colors'] ?? '');
            
            $sql = "INSERT INTO $table (name, category, price, description, sizes, colors, status, image, image1, image2, image3, image4, image5, image6) 
                    VALUES ('$name', '$category', $price, '$description', '$sizes', '$colors', '$status', '$image1', '$image1', '$image2', '$image3', '$image4', '$image5', '$image6')";
            
            if(mysqli_query($conn, $sql)) {
                $product_id = mysqli_insert_id($conn);
                
                // Insert size-based stock
                if(isset($data['sizeStock']) && is_array($data['sizeStock'])) {
                    foreach($data['sizeStock'] as $size => $quantity) {
                        $size = mysqli_real_escape_string($conn, $size);
                        $quantity = intval($quantity);
                        
                        $stock_sql = "INSERT INTO clothing_stock (product_id, size, stock_quantity) 
                                     VALUES ($product_id, '$size', $quantity) 
                                     ON DUPLICATE KEY UPDATE stock_quantity = $quantity";
                        mysqli_query($conn, $stock_sql);
                    }
                }
                
                echo json_encode([
                    "status" => "success",
                    "message" => "Clothing product created successfully",
                    "id" => $product_id
                ]);
            } else {
                echo json_encode([
                    "status" => "error",
                    "message" => mysqli_error($conn)
                ]);
            }
        } else {
            $material = mysqli_real_escape_string($conn, $data['material'] ?? '');
            $stock = intval($data['stock']);
            
            $sql = "INSERT INTO $table (name, category, price, stock, description, material, status, image, image1, image2, image3, image4, image5, image6) 
                    VALUES ('$name', '$category', $price, $stock, '$description', '$material', '$status', '$image1', '$image1', '$image2', '$image3', '$image4', '$image5', '$image6')";
            
            if(mysqli_query($conn, $sql)) {
                echo json_encode([
                    "status" => "success",
                    "message" => "Equipment created successfully",
                    "id" => mysqli_insert_id($conn)
                ]);
            } else {
                echo json_encode([
                    "status" => "error",
                    "message" => mysqli_error($conn)
                ]);
            }
        }
        break;
        
    case 'update':
        $data = json_decode(file_get_contents('php://input'), true);
        $table = $data['type'] === 'clothing' ? 'clothing_products' : 'equipment_products';
        $id = intval($data['id']);
        
        $name = mysqli_real_escape_string($conn, $data['name']);
        $category = mysqli_real_escape_string($conn, $data['category']);
        $price = floatval($data['price']);
        $description = mysqli_real_escape_string($conn, $data['description'] ?? '');
        $status = mysqli_real_escape_string($conn, $data['status'] ?? 'normal');
        
        // Handle multiple images
        $image1 = mysqli_real_escape_string($conn, $data['image1'] ?? '');
        $image2 = mysqli_real_escape_string($conn, $data['image2'] ?? '');
        $image3 = mysqli_real_escape_string($conn, $data['image3'] ?? '');
        $image4 = mysqli_real_escape_string($conn, $data['image4'] ?? '');
        $image5 = mysqli_real_escape_string($conn, $data['image5'] ?? '');
        $image6 = mysqli_real_escape_string($conn, $data['image6'] ?? '');
        
        if($data['type'] === 'clothing') {
            $sizes = mysqli_real_escape_string($conn, $data['sizes'] ?? '');
            $colors = mysqli_real_escape_string($conn, $data['colors'] ?? '');
            
            $sql = "UPDATE $table SET 
                    name='$name', category='$category', price=$price, description='$description', 
                    sizes='$sizes', colors='$colors', status='$status',
                    image='$image1', image1='$image1', image2='$image2', image3='$image3', 
                    image4='$image4', image5='$image5', image6='$image6'
                    WHERE id=$id";
            
            if(mysqli_query($conn, $sql)) {
                // Update size-based stock
                if(isset($data['sizeStock']) && is_array($data['sizeStock'])) {
                    // Delete existing stock records
                    mysqli_query($conn, "DELETE FROM clothing_stock WHERE product_id = $id");
                    
                    // Insert new stock records
                    foreach($data['sizeStock'] as $size => $quantity) {
                        $size = mysqli_real_escape_string($conn, $size);
                        $quantity = intval($quantity);
                        
                        if ($quantity > 0) {
                            $stock_sql = "INSERT INTO clothing_stock (product_id, size, stock_quantity) 
                                         VALUES ($id, '$size', $quantity)";
                            mysqli_query($conn, $stock_sql);
                        }
                    }
                }
                
                echo json_encode([
                    "status" => "success",
                    "message" => "Clothing product updated successfully"
                ]);
            } else {
                echo json_encode([
                    "status" => "error",
                    "message" => mysqli_error($conn)
                ]);
            }
        } else {
            $material = mysqli_real_escape_string($conn, $data['material'] ?? '');
            $stock = intval($data['stock']);
            
            $sql = "UPDATE $table SET 
                    name='$name', category='$category', price=$price, stock=$stock, description='$description',
                    material='$material', status='$status',
                    image='$image1', image1='$image1', image2='$image2', image3='$image3', 
                    image4='$image4', image5='$image5', image6='$image6'
                    WHERE id=$id";
            
            if(mysqli_query($conn, $sql)) {
                echo json_encode([
                    "status" => "success",
                    "message" => "Equipment updated successfully"
                ]);
            } else {
                echo json_encode([
                    "status" => "error",
                    "message" => mysqli_error($conn)
                ]);
            }
        }
        break;
        
    case 'delete':
        $type = $_GET['type'] ?? 'clothing';
        $id = intval($_GET['id'] ?? 0);
        
        if ($id <= 0) {
            echo json_encode([
                "status" => "error",
                "message" => "Invalid product ID"
            ]);
            break;
        }
        
        $table = $type === 'clothing' ? 'clothing_products' : 'equipment_products';
        
        // For clothing products, also delete stock records
        if ($type === 'clothing') {
            // Delete stock records first
            $stock_sql = "DELETE FROM clothing_stock WHERE product_id = $id";
            mysqli_query($conn, $stock_sql);
        }
        
        // Delete the product
        $sql = "DELETE FROM $table WHERE id = $id";
        
        if(mysqli_query($conn, $sql)) {
            echo json_encode([
                "status" => "success",
                "message" => "Product deleted successfully"
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
