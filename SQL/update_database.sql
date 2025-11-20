-- Update users table to add gender field if it doesn't exist
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `gender` VARCHAR(10) DEFAULT NULL;

-- Insert some sample clothing products for testing
INSERT IGNORE INTO `clothing_products` (`id`, `name`, `category`, `price`, `stock`, `image`, `description`, `sizes`, `status`) VALUES
(1, 'Premium Hoodie Black', 'hoodie', 45.99, 25, 'IMG/clo1.webp', 'Premium quality hoodie perfect for workouts and casual wear. Made with high-quality cotton blend for maximum comfort.', 'S, M, L, XL, XXL', 'new'),
(2, 'Performance T-Shirt', 'tshirt', 24.99, 50, 'IMG/clo2.webp', 'Moisture-wicking performance t-shirt designed for intense workouts. Lightweight and breathable fabric.', 'S, M, L, XL', 'normal'),
(3, 'Training Shorts Pro', 'shorts', 29.99, 30, 'IMG/clo3.webp', 'Comfortable training shorts with side pockets and elastic waistband. Perfect for gym sessions.', 'S, M, L, XL', 'sale'),
(4, 'Oversized T-Shirt', 'tshirt', 22.99, 40, 'IMG/clo4.webp', 'Trendy oversized t-shirt with modern fit. Great for casual wear and light workouts.', 'S, M, L, XL, XXL', 'normal'),
(5, 'Tank Top United', 'tank', 19.99, 35, 'IMG/clo5.webp', 'Breathable tank top for maximum freedom of movement during workouts.', 'S, M, L, XL', 'sale'),
(6, 'Anime Tank Top', 'tank', 21.99, 28, 'IMG/clo6.webp', 'Stylish anime-inspired tank top with unique graphics. Perfect for gym enthusiasts.', 'S, M, L, XL', 'new');

-- Insert some sample equipment products for testing
INSERT IGNORE INTO `equipment_products` (`id`, `name`, `category`, `price`, `stock`, `image`, `description`, `material`, `status`) VALUES
(1, 'Adjustable Dumbbells Set', 'dumbbell', 89.99, 15, 'IMG/iteam1.jpg', 'Professional adjustable dumbbells ranging from 5-50lbs. Perfect for home gym setups.', 'Steel', 'new'),
(2, 'Resistance Bands Kit', 'resistance', 19.99, 40, 'IMG/iteam2.jpg', 'Complete resistance bands set with handles, door anchor, and exercise guide.', 'Latex', 'normal'),
(3, 'Premium Exercise Mat', 'mat', 34.99, 25, 'IMG/iteam3.jpg', 'Non-slip exercise mat with 6mm thickness for maximum comfort during workouts.', 'NBR Foam', 'normal'),
(4, 'Olympic Barbell', 'barbell', 129.99, 8, 'IMG/iteam4.jpg', 'Professional Olympic barbell with rotating sleeves. Built to last for heavy lifting.', 'Steel', 'new'),
(5, 'Kettlebell Set', 'kettlebell', 59.99, 20, 'IMG/iteam5.jpg', 'Cast iron kettlebell with comfortable grip handle. Available in multiple weights.', 'Cast Iron', 'normal'),
(6, 'Adjustable Bench', 'bench', 149.99, 12, 'IMG/gym.jpg', 'Multi-position adjustable bench for various exercises. Sturdy and comfortable.', 'Steel Frame', 'sale');

-- Insert some sample training sessions for testing
INSERT IGNORE INTO `training_sessions` (`id`, `name`, `trainer`, `duration`, `date`, `time`, `capacity`, `enrolled`, `price`, `description`) VALUES
(1, 'HIIT Workout Intensive', 'John Smith', 45, '2025-01-15', '09:00:00', 20, 5, 25.00, 'High-intensity interval training session designed to burn calories and build endurance.'),
(2, 'Strength Training Basics', 'Sarah Johnson', 60, '2025-01-16', '18:00:00', 15, 8, 35.00, 'Full body strength training with weights. Perfect for beginners and intermediate levels.'),
(3, 'Morning Yoga Flow', 'Emma Davis', 75, '2025-01-17', '07:00:00', 25, 12, 20.00, 'Peaceful morning yoga flow for flexibility, mindfulness, and stress relief.'),
(4, 'CrossFit Challenge', 'Mike Wilson', 50, '2025-01-18', '19:00:00', 18, 3, 40.00, 'Intense CrossFit workout combining cardio, strength, and functional movements.'),
(5, 'Pilates Core Focus', 'Lisa Brown', 55, '2025-01-19', '10:00:00', 20, 7, 30.00, 'Core-focused Pilates session to strengthen your abs and improve posture.'),
(6, 'Boxing Fundamentals', 'Carlos Rodriguez', 60, '2025-01-20', '17:00:00', 16, 9, 35.00, 'Learn boxing basics while getting an amazing cardio workout. All levels welcome.');
