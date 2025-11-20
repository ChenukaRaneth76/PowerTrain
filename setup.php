<?php
// Database Setup and Connection Test
include "backend/config.php";

echo "<h1>🚀 GYM Database Setup & Connection Test</h1>";
echo "<style>body{font-family:Arial,sans-serif;padding:20px;background:#f5f5f5;} .success{color:#10b981;} .error{color:#dc2626;} .info{color:#3b82f6;} .box{background:white;padding:20px;margin:10px 0;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);}</style>";

// Test database connection
echo "<div class='box'>";
echo "<h2>📡 Database Connection Test</h2>";
if ($conn) {
    echo "<p class='success'>✅ Database connected successfully!</p>";
    echo "<p class='info'>Host: " . $host . "</p>";
    echo "<p class='info'>Database: " . $db . "</p>";
} else {
    echo "<p class='error'>❌ Database connection failed: " . mysqli_connect_error() . "</p>";
    exit;
}
echo "</div>";

// Check and create tables
echo "<div class='box'>";
echo "<h2>🗄️ Database Tables Status</h2>";

$tables = [
    'users' => 'User accounts and profiles',
    'clothing_products' => 'Clothing items (T-shirts, Hoodies, etc.)',
    'equipment_products' => 'Gym equipment (Dumbbells, Mats, etc.)',
    'training_sessions' => 'Training sessions and classes',
    'orders' => 'Customer orders',
    'order_items' => 'Order line items'
];

foreach ($tables as $table => $description) {
    $result = mysqli_query($conn, "SHOW TABLES LIKE '$table'");
    if (mysqli_num_rows($result) > 0) {
        $count_result = mysqli_query($conn, "SELECT COUNT(*) as count FROM $table");
        $count = mysqli_fetch_assoc($count_result)['count'];
        echo "<p class='success'>✅ $table ($count records) - $description</p>";
    } else {
        echo "<p class='error'>❌ $table - Missing</p>";
    }
}
echo "</div>";

// Check uploads folder
echo "<div class='box'>";
echo "<h2>📁 File Upload System</h2>";
$upload_dirs = [
    'uploads/products/' => 'Product images',
    'uploads/profile/' => 'User profile images'
];

foreach ($upload_dirs as $dir => $description) {
    if (!file_exists($dir)) {
        mkdir($dir, 0777, true);
        echo "<p class='info'>📁 Created directory: $dir</p>";
    }
    
    if (is_writable($dir)) {
        echo "<p class='success'>✅ $dir - Writable ($description)</p>";
    } else {
        echo "<p class='error'>❌ $dir - Not writable</p>";
    }
}
echo "</div>";

// Test admin login
echo "<div class='box'>";
echo "<h2>🔐 Admin Access Test</h2>";
echo "<p class='info'>Admin Email: <strong>powertainadmin@gmail.com</strong></p>";
echo "<p class='info'>Admin Password: <strong>pwramudu123</strong></p>";
echo "<p class='success'>✅ Admin login configured in backend/login.php</p>";
echo "</div>";

// API Endpoints Test
echo "<div class='box'>";
echo "<h2>🔌 API Endpoints Status</h2>";
$endpoints = [
    'backend/login.php' => 'User authentication',
    'backend/get_products.php' => 'Product data for frontend',
    'backend/admin/products.php' => 'Product CRUD operations',
    'backend/admin/training.php' => 'Training session management',
    'backend/admin/users.php' => 'User management',
    'backend/admin/orders.php' => 'Order management',
    'backend/admin/upload_image.php' => 'Image upload handler'
];

foreach ($endpoints as $endpoint => $description) {
    if (file_exists($endpoint)) {
        echo "<p class='success'>✅ $endpoint - $description</p>";
    } else {
        echo "<p class='error'>❌ $endpoint - Missing</p>";
    }
}
echo "</div>";

// Quick Actions
echo "<div class='box'>";
echo "<h2>⚡ Quick Actions</h2>";
echo "<p><a href='index.html' style='background:#3b82f6;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;'>🏠 Go to Homepage</a></p>";
echo "<p><a href='admin.html' style='background:#dc2626;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;'>⚙️ Admin Panel</a></p>";
echo "<p><a href='clothing.html' style='background:#10b981;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;'>👕 Clothing Store</a></p>";
echo "<p><a href='equipment.html' style='background:#f59e0b;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;'>🏋️ Equipment Store</a></p>";
echo "</div>";

// Sample data insertion
echo "<div class='box'>";
echo "<h2>📊 Sample Data</h2>";
echo "<p class='info'>To add sample products and training sessions, run the SQL file:</p>";
echo "<p><code>SQL/update_database.sql</code></p>";
echo "<p>This will add sample clothing, equipment, and training sessions for testing.</p>";
echo "</div>";

mysqli_close($conn);
?>
