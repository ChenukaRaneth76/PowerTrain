<?php
include "backend/config.php";

echo "<h2>Adding Sample Data</h2>";

// Add sample equipment products
$equipment_products = [
    [
        'name' => 'Adjustable Dumbbells',
        'category' => 'dumbbell',
        'price' => 89.99,
        'stock' => 15,
        'image' => 'IMG/iteam1.jpg',
        'description' => 'Professional adjustable dumbbells ranging from 5-50lbs. Perfect for home gym setups.',
        'material' => 'Steel',
        'status' => 'new'
    ],
    [
        'name' => 'Exercise Mat Premium',
        'category' => 'mat',
        'price' => 34.99,
        'stock' => 25,
        'image' => 'IMG/iteam2.jpg',
        'description' => 'Non-slip exercise mat with 6mm thickness for maximum comfort during workouts.',
        'material' => 'NBR Foam',
        'status' => 'normal'
    ],
    [
        'name' => 'Resistance Bands Set',
        'category' => 'resistance',
        'price' => 19.99,
        'stock' => 40,
        'image' => 'IMG/iteam3.jpg',
        'description' => 'Complete resistance bands set with handles, door anchor, and exercise guide.',
        'material' => 'Latex',
        'status' => 'sale'
    ]
];

echo "<h3>Adding Equipment Products:</h3>";
foreach ($equipment_products as $product) {
    $sql = "INSERT INTO equipment_products (name, category, price, stock, image, description, material, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "sssissss", 
        $product['name'], 
        $product['category'], 
        $product['price'], 
        $product['stock'], 
        $product['image'], 
        $product['description'], 
        $product['material'], 
        $product['status']
    );
    
    if (mysqli_stmt_execute($stmt)) {
        echo "<p style='color: green;'>✅ Added: {$product['name']}</p>";
    } else {
        echo "<p style='color: red;'>❌ Failed to add: {$product['name']} - " . mysqli_error($conn) . "</p>";
    }
    mysqli_stmt_close($stmt);
}

// Add more clothing products
$clothing_products = [
    [
        'name' => 'Premium Hoodie Black',
        'category' => 'hoodie',
        'price' => 45.99,
        'stock' => 25,
        'image' => 'IMG/clo1.webp',
        'description' => 'Premium quality hoodie perfect for workouts and casual wear. Made with high-quality cotton blend.',
        'sizes' => 'S, M, L, XL, XXL',
        'status' => 'new'
    ],
    [
        'name' => 'Performance T-Shirt',
        'category' => 'tshirt',
        'price' => 24.99,
        'stock' => 50,
        'image' => 'IMG/clo2.webp',
        'description' => 'Moisture-wicking performance t-shirt designed for intense workouts. Lightweight and breathable.',
        'sizes' => 'S, M, L, XL',
        'status' => 'normal'
    ],
    [
        'name' => 'Training Shorts Pro',
        'category' => 'shorts',
        'price' => 29.99,
        'stock' => 30,
        'image' => 'IMG/clo3.webp',
        'description' => 'Comfortable training shorts with side pockets and elastic waistband. Perfect for gym sessions.',
        'sizes' => 'S, M, L, XL',
        'status' => 'sale'
    ]
];

echo "<h3>Adding More Clothing Products:</h3>";
foreach ($clothing_products as $product) {
    $sql = "INSERT INTO clothing_products (name, category, price, stock, image, description, sizes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "sssissss", 
        $product['name'], 
        $product['category'], 
        $product['price'], 
        $product['stock'], 
        $product['image'], 
        $product['description'], 
        $product['sizes'], 
        $product['status']
    );
    
    if (mysqli_stmt_execute($stmt)) {
        echo "<p style='color: green;'>✅ Added: {$product['name']}</p>";
    } else {
        echo "<p style='color: red;'>❌ Failed to add: {$product['name']} - " . mysqli_error($conn) . "</p>";
    }
    mysqli_stmt_close($stmt);
}

echo "<h3>✅ Sample Data Added Successfully!</h3>";
echo "<p><a href='test_product.php'>View Updated Product Test</a></p>";
echo "<p><a href='clothing.html'>Test Clothing Store</a></p>";
echo "<p><a href='equipment.html'>Test Equipment Store</a></p>";

mysqli_close($conn);
?>
