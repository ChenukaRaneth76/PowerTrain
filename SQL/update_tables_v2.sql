-- Update database tables for multiple images, colors, and size-based stock

-- Add multiple image columns to clothing_products table
ALTER TABLE clothing_products 
ADD COLUMN image1 VARCHAR(255) DEFAULT NULL,
ADD COLUMN image2 VARCHAR(255) DEFAULT NULL,
ADD COLUMN image3 VARCHAR(255) DEFAULT NULL,
ADD COLUMN image4 VARCHAR(255) DEFAULT NULL,
ADD COLUMN image5 VARCHAR(255) DEFAULT NULL,
ADD COLUMN image6 VARCHAR(255) DEFAULT NULL,
ADD COLUMN colors VARCHAR(255) DEFAULT NULL;

-- Add multiple image columns to equipment_products table
ALTER TABLE equipment_products 
ADD COLUMN image1 VARCHAR(255) DEFAULT NULL,
ADD COLUMN image2 VARCHAR(255) DEFAULT NULL,
ADD COLUMN image3 VARCHAR(255) DEFAULT NULL,
ADD COLUMN image4 VARCHAR(255) DEFAULT NULL,
ADD COLUMN image5 VARCHAR(255) DEFAULT NULL,
ADD COLUMN image6 VARCHAR(255) DEFAULT NULL;

-- Create size-based stock table for clothing
CREATE TABLE IF NOT EXISTS clothing_stock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    size VARCHAR(10) NOT NULL,
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES clothing_products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_size (product_id, size)
);

-- Copy existing image to image1 for existing products
UPDATE clothing_products SET image1 = image WHERE image IS NOT NULL AND image != '';
UPDATE equipment_products SET image1 = image WHERE image IS NOT NULL AND image != '';

-- Add some sample colors to existing clothing products
UPDATE clothing_products SET colors = 'Black,White,Gray' WHERE id = 1;

-- Insert sample size-based stock for existing clothing products
INSERT INTO clothing_stock (product_id, size, stock_quantity) VALUES
(1, 'S', 15),
(1, 'M', 25),
(1, 'L', 20),
(1, 'XL', 10),
(1, 'XXL', 5)
ON DUPLICATE KEY UPDATE stock_quantity = VALUES(stock_quantity);

-- Add sample clothing products with multiple images and size stocks
INSERT INTO clothing_products (name, category, price, description, sizes, colors, status, image1, image2, image3) VALUES
('Premium Hoodie Pro', 'hoodie', 59.99, 'Premium quality hoodie with advanced moisture-wicking technology', 'S,M,L,XL,XXL', 'Black,White,Navy,Gray', 'new', 'IMG/clo1.webp', 'IMG/clo2.webp', 'IMG/clo3.webp'),
('Athletic T-Shirt Elite', 'tshirt', 29.99, 'High-performance athletic t-shirt for intense workouts', 'S,M,L,XL', 'Black,White,Red,Blue', 'normal', 'IMG/clo2.webp', 'IMG/clo1.webp', 'IMG/clo3.webp'),
('Training Shorts Max', 'shorts', 39.99, 'Professional training shorts with compression technology', 'S,M,L,XL,XXL', 'Black,Navy,Gray', 'sale', 'IMG/clo3.webp', 'IMG/clo1.webp', 'IMG/clo2.webp');

-- Get the IDs of the newly inserted products and add stock
SET @hoodie_id = (SELECT id FROM clothing_products WHERE name = 'Premium Hoodie Pro' LIMIT 1);
SET @tshirt_id = (SELECT id FROM clothing_products WHERE name = 'Athletic T-Shirt Elite' LIMIT 1);
SET @shorts_id = (SELECT id FROM clothing_products WHERE name = 'Training Shorts Max' LIMIT 1);

-- Add size-based stock for new products
INSERT INTO clothing_stock (product_id, size, stock_quantity) VALUES
-- Premium Hoodie Pro stock
(@hoodie_id, 'S', 12),
(@hoodie_id, 'M', 18),
(@hoodie_id, 'L', 25),
(@hoodie_id, 'XL', 15),
(@hoodie_id, 'XXL', 8),

-- Athletic T-Shirt Elite stock
(@tshirt_id, 'S', 20),
(@tshirt_id, 'M', 30),
(@tshirt_id, 'L', 25),
(@tshirt_id, 'XL', 12),

-- Training Shorts Max stock
(@shorts_id, 'S', 10),
(@shorts_id, 'M', 15),
(@shorts_id, 'L', 20),
(@shorts_id, 'XL', 18),
(@shorts_id, 'XXL', 6)
ON DUPLICATE KEY UPDATE stock_quantity = VALUES(stock_quantity);

-- Add sample equipment with multiple images
INSERT INTO equipment_products (name, category, price, stock, description, material, status, image1, image2, image3) VALUES
('Professional Dumbbells Set', 'dumbbell', 129.99, 25, 'Complete adjustable dumbbell set for home gym', 'Steel', 'new', 'IMG/iteam1.jpg', 'IMG/iteam2.jpg', 'IMG/iteam3.jpg'),
('Premium Yoga Mat', 'mat', 49.99, 40, 'High-quality non-slip yoga mat with alignment guides', 'NBR Foam', 'normal', 'IMG/iteam2.jpg', 'IMG/iteam1.jpg', 'IMG/iteam3.jpg'),
('Resistance Band Kit', 'resistance', 24.99, 60, 'Complete resistance band set with multiple resistance levels', 'Latex', 'sale', 'IMG/iteam3.jpg', 'IMG/iteam1.jpg', 'IMG/iteam2.jpg');

-- Create a view to get clothing products with total stock
CREATE OR REPLACE VIEW clothing_products_with_stock AS
SELECT 
    cp.*,
    COALESCE(SUM(cs.stock_quantity), 0) as total_stock,
    GROUP_CONCAT(CONCAT(cs.size, ':', cs.stock_quantity) ORDER BY 
        FIELD(cs.size, 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL') SEPARATOR ',') as size_stock_info
FROM clothing_products cp
LEFT JOIN clothing_stock cs ON cp.id = cs.product_id
GROUP BY cp.id;

-- Show the updated structure
DESCRIBE clothing_products;
DESCRIBE equipment_products;
DESCRIBE clothing_stock;

-- Show sample data
SELECT * FROM clothing_products_with_stock LIMIT 3;
SELECT * FROM equipment_products LIMIT 3;
SELECT * FROM clothing_stock LIMIT 10;
