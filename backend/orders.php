<?php
session_start();
header('Content-Type: application/json');
include 'config.php';

$action = $_GET['action'] ?? 'list';

switch($action) {
    case 'create':
        try {
            // Get POST data
            if (!isset($_POST['customer_name']) || !isset($_POST['customer_email'])) {
                throw new Exception('Missing required fields');
            }
            
            $customer_name = mysqli_real_escape_string($conn, $_POST['customer_name']);
            $customer_email = mysqli_real_escape_string($conn, $_POST['customer_email']);
            $customer_phone = mysqli_real_escape_string($conn, $_POST['customer_phone']);
            $customer_address = mysqli_real_escape_string($conn, $_POST['customer_address']);
            $postal_code = mysqli_real_escape_string($conn, $_POST['postal_code']);
            $total_amount = floatval($_POST['total_amount']);
            $cart_items = json_decode($_POST['cart_items'], true);
            
            if (empty($cart_items)) {
                throw new Exception('Cart is empty');
            }
            
            // Handle payment slip upload
            $payment_slip_path = '';
            if (isset($_FILES['payment_slip']) && $_FILES['payment_slip']['error'] == 0) {
                $upload_dir = '../uploads/payment_slips/';
                if (!file_exists($upload_dir)) {
                    if (!mkdir($upload_dir, 0777, true)) {
                        throw new Exception('Failed to create upload directory');
                    }
                }
                
                $file_extension = strtolower(pathinfo($_FILES['payment_slip']['name'], PATHINFO_EXTENSION));
                $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                if (!in_array($file_extension, $allowed)) {
                    throw new Exception('Invalid file type. Only images allowed.');
                }
                
                $file_name = 'slip_' . time() . '_' . uniqid() . '.' . $file_extension;
                if (!move_uploaded_file($_FILES['payment_slip']['tmp_name'], $upload_dir . $file_name)) {
                    throw new Exception('Failed to upload payment slip');
                }
                $payment_slip_path = 'uploads/payment_slips/' . $file_name;
            } else {
                throw new Exception('Payment slip is required');
            }
            
            // Generate order number
            $order_number = 'ORD-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            
            // Insert order
            $sql = "INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, 
                    customer_address, postal_code, total_amount, payment_slip_image, status) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')";
            $stmt = mysqli_prepare($conn, $sql);
            if (!$stmt) {
                throw new Exception('Database error: ' . mysqli_error($conn));
            }
            
            mysqli_stmt_bind_param($stmt, "ssssssds", $order_number, $customer_name, $customer_email, 
                $customer_phone, $customer_address, $postal_code, $total_amount, $payment_slip_path);
            
            if (!mysqli_stmt_execute($stmt)) {
                throw new Exception('Failed to create order: ' . mysqli_stmt_error($stmt));
            }
            
            $order_id = mysqli_insert_id($conn);
            if (!$order_id) {
                throw new Exception('Failed to get order ID');
            }
            
            // Insert order items
            $sql2 = "INSERT INTO order_items (order_id, product_id, product_type, product_name, 
                    product_price, product_image, quantity, size, color, subtotal) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt2 = mysqli_prepare($conn, $sql2);
            if (!$stmt2) {
                throw new Exception('Database error: ' . mysqli_error($conn));
            }
            
            // Validate and reduce stock
            foreach ($cart_items as $item) {
                $product_id = intval($item['product_id']);
                $quantity = intval($item['quantity']);
                $product_type = $item['product_type'];
                $size = $item['size'] ?? '';
                
                // Check and reduce stock based on product type
                if ($product_type === 'clothing' && !empty($size)) {
                    // Check clothing stock by size
                    $check_stock_sql = "SELECT stock_quantity FROM clothing_stock WHERE product_id = ? AND size = ?";
                    $check_stmt = mysqli_prepare($conn, $check_stock_sql);
                    mysqli_stmt_bind_param($check_stmt, "is", $product_id, $size);
                    mysqli_stmt_execute($check_stmt);
                    $stock_result = mysqli_stmt_get_result($check_stmt);
                    
                    if ($stock_row = mysqli_fetch_assoc($stock_result)) {
                        $available_stock = intval($stock_row['stock_quantity']);
                        if ($available_stock < $quantity) {
                            mysqli_stmt_close($check_stmt);
                            throw new Exception("Insufficient stock for {$item['product_name']} (Size: $size). Only $available_stock available.");
                        }
                        
                        // Reduce stock
                        $reduce_sql = "UPDATE clothing_stock SET stock_quantity = stock_quantity - ? WHERE product_id = ? AND size = ?";
                        $reduce_stmt = mysqli_prepare($conn, $reduce_sql);
                        mysqli_stmt_bind_param($reduce_stmt, "iis", $quantity, $product_id, $size);
                        if (!mysqli_stmt_execute($reduce_stmt)) {
                            mysqli_stmt_close($reduce_stmt);
                            mysqli_stmt_close($check_stmt);
                            throw new Exception("Failed to update stock for {$item['product_name']}");
                        }
                        mysqli_stmt_close($reduce_stmt);
                    } else {
                        mysqli_stmt_close($check_stmt);
                        throw new Exception("Stock record not found for {$item['product_name']} (Size: $size)");
                    }
                    mysqli_stmt_close($check_stmt);
                    
                } elseif ($product_type === 'equipment') {
                    // Check equipment stock
                    $check_stock_sql = "SELECT stock FROM equipment_products WHERE id = ?";
                    $check_stmt = mysqli_prepare($conn, $check_stock_sql);
                    mysqli_stmt_bind_param($check_stmt, "i", $product_id);
                    mysqli_stmt_execute($check_stmt);
                    $stock_result = mysqli_stmt_get_result($check_stmt);
                    
                    if ($stock_row = mysqli_fetch_assoc($stock_result)) {
                        $available_stock = intval($stock_row['stock']);
                        if ($available_stock < $quantity) {
                            mysqli_stmt_close($check_stmt);
                            throw new Exception("Insufficient stock for {$item['product_name']}. Only $available_stock available.");
                        }
                        
                        // Reduce stock
                        $reduce_sql = "UPDATE equipment_products SET stock = stock - ? WHERE id = ?";
                        $reduce_stmt = mysqli_prepare($conn, $reduce_sql);
                        mysqli_stmt_bind_param($reduce_stmt, "ii", $quantity, $product_id);
                        if (!mysqli_stmt_execute($reduce_stmt)) {
                            mysqli_stmt_close($reduce_stmt);
                            mysqli_stmt_close($check_stmt);
                            throw new Exception("Failed to update stock for {$item['product_name']}");
                        }
                        mysqli_stmt_close($reduce_stmt);
                    } else {
                        mysqli_stmt_close($check_stmt);
                        throw new Exception("Product not found: {$item['product_name']}");
                    }
                    mysqli_stmt_close($check_stmt);
                }
                
                // Insert order item
                $subtotal = $item['product_price'] * $item['quantity'];
                $color = $item['color'] ?? '';
                
                mysqli_stmt_bind_param($stmt2, "iissdsissd", $order_id, $item['product_id'], 
                    $item['product_type'], $item['product_name'], $item['product_price'], 
                    $item['product_image'], $item['quantity'], $size, $color, $subtotal);
                
                if (!mysqli_stmt_execute($stmt2)) {
                    throw new Exception('Failed to add order items: ' . mysqli_stmt_error($stmt2));
                }
            }
            
            // Send professional order confirmation email
            try {
                $to = $customer_email;
                $subject = "Order Confirmation #$order_number - Powertain.Fitness";
                $headers = "MIME-Version: 1.0" . "\r\n";
                $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
                $headers .= "From: Powertain.Fitness <powertainfitnesslk@gmail.com>" . "\r\n";
                
                // Build items HTML
                $items_html = '';
                foreach ($cart_items as $item) {
                    $item_subtotal = $item['product_price'] * $item['quantity'];
                    $size_color = '';
                    if (!empty($item['size'])) {
                        $size_color .= '<span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 5px;">Size: ' . htmlspecialchars($item['size']) . '</span>';
                    }
                    if (!empty($item['color'])) {
                        $size_color .= '<span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Color: ' . htmlspecialchars($item['color']) . '</span>';
                    }
                    
                    $items_html .= '
                    <tr>
                        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                            <div style="font-weight: 600; margin-bottom: 5px;">' . htmlspecialchars($item['product_name']) . '</div>
                            <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">' . $size_color . '</div>
                            <div style="color: #6b7280; font-size: 14px;">Rs.' . number_format($item['product_price'], 2) . ' × ' . $item['quantity'] . '</div>
                        </td>
                        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">Rs.' . number_format($item_subtotal, 2) . '</td>
                    </tr>';
                }
                
                $body = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"><tr><td style="background: linear-gradient(135deg, #000000 0%, #333333 100%); padding: 40px 30px; text-align: center;"><h1 style="color: #ffffff; margin: 0; font-size: 28px;">ORDER CONFIRMED!</h1><p style="color: #e5e7eb; margin: 10px 0 0 0; font-size: 16px;">Thank you for your purchase</p></td></tr><tr><td style="padding: 30px;"><p style="font-size: 16px; color: #1f2937; margin: 0 0 20px 0;">Dear <strong>' . htmlspecialchars($customer_name) . '</strong>,</p><p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">Your order has been successfully placed! We have received your payment slip and will review it shortly. You will receive a confirmation email once your payment is verified.</p><table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;"><tr><td style="padding-bottom: 10px;"><span style="color: #6b7280; font-size: 14px;">Order Number:</span><span style="color: #1f2937; font-weight: 700; font-size: 16px; float: right;">' . $order_number . '</span></td></tr><tr><td style="padding-bottom: 10px;"><span style="color: #6b7280; font-size: 14px;">Order Date:</span><span style="color: #1f2937; font-weight: 600; float: right;">' . date('F j, Y') . '</span></td></tr><tr><td><span style="color: #6b7280; font-size: 14px;">Status:</span><span style="background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; float: right;">PENDING VERIFICATION</span></td></tr></table><h2 style="font-size: 18px; color: #1f2937; margin: 0 0 15px 0; border-bottom: 2px solid #000; padding-bottom: 10px;">ORDER DETAILS</h2><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">' . $items_html . '</table><table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;"><tr><td style="padding: 10px 0; text-align: right; color: #6b7280;">Subtotal:</td><td style="padding: 10px 0; text-align: right; font-weight: 600; width: 120px;">Rs.' . number_format($total_amount - 500, 2) . '</td></tr><tr><td style="padding: 10px 0; text-align: right; color: #6b7280;">Shipping:</td><td style="padding: 10px 0; text-align: right; font-weight: 600;">Rs.500.00</td></tr><tr><td style="padding: 15px 0; text-align: right; font-size: 18px; font-weight: 700; border-top: 2px solid #e5e7eb;">TOTAL:</td><td style="padding: 15px 0; text-align: right; font-size: 18px; font-weight: 700; color: #10b981; border-top: 2px solid #e5e7eb;">Rs.' . number_format($total_amount, 2) . '</td></tr></table><div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;"><h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">📦 Delivery Information</h3><p style="margin: 0; color: #1f2937; font-size: 14px; line-height: 1.6;"><strong>' . htmlspecialchars($customer_name) . '</strong><br>' . htmlspecialchars($customer_phone) . '<br>' . htmlspecialchars($customer_address) . '</p></div></td></tr><tr><td style="padding: 0 30px 30px 30px;"><h3 style="font-size: 16px; color: #1f2937; margin: 0 0 15px 0;">What happens next?</h3><ol style="color: #6b7280; font-size: 14px; line-height: 1.8; padding-left: 20px;"><li>We will verify your payment slip</li><li>Once confirmed, your order will be processed</li><li>You will receive shipping updates via email</li><li>Track your order status in your account</li></ol></td></tr><tr><td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;"><p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Need help? Contact us at <a href="mailto:support@powertain.com" style="color: #3b82f6; text-decoration: none;">support@powertain.com</a></p><p style="margin: 0; color: #9ca3af; font-size: 12px;">© 2024 Powertain.Fitness. All rights reserved.</p></td></tr></table></td></tr></table></body></html>';
                
                // Send email
                @mail($to, $subject, $body, $headers);
            } catch (Exception $e) {
                // Email failed but order succeeded - log but don't throw
                error_log('Email failed: ' . $e->getMessage());
            }
            
            echo json_encode(['status' => 'success', 'order_number' => $order_number]);
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;
        
    case 'list':
        $result = mysqli_query($conn, "SELECT * FROM orders ORDER BY created_at DESC");
        $orders = [];
        while ($row = mysqli_fetch_assoc($result)) $orders[] = $row;
        echo json_encode(['status' => 'success', 'orders' => $orders]);
        break;
        
    case 'user_orders':
        // Get orders by user email
        $email = mysqli_real_escape_string($conn, $_GET['email']);
        $sql = "SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "s", $email);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        $orders = [];
        while ($row = mysqli_fetch_assoc($result)) $orders[] = $row;
        echo json_encode(['status' => 'success', 'orders' => $orders]);
        mysqli_stmt_close($stmt);
        break;
        
    case 'get':
        // Get single order with items
        $order_id = intval($_GET['id']);
        $sql = "SELECT * FROM orders WHERE id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "i", $order_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if (mysqli_num_rows($result) > 0) {
            $order = mysqli_fetch_assoc($result);
            
            // Get order items
            $items_sql = "SELECT * FROM order_items WHERE order_id = ?";
            $items_stmt = mysqli_prepare($conn, $items_sql);
            mysqli_stmt_bind_param($items_stmt, "i", $order_id);
            mysqli_stmt_execute($items_stmt);
            $items_result = mysqli_stmt_get_result($items_stmt);
            
            $items = [];
            while ($item = mysqli_fetch_assoc($items_result)) $items[] = $item;
            $order['items'] = $items;
            
            echo json_encode(['status' => 'success', 'order' => $order]);
            mysqli_stmt_close($items_stmt);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Order not found']);
        }
        mysqli_stmt_close($stmt);
        break;
        
    case 'update_status':
        // Update order status
        $order_id = intval($_POST['order_id']);
        $status = mysqli_real_escape_string($conn, $_POST['status']);
        $notes = mysqli_real_escape_string($conn, $_POST['notes'] ?? '');
        
        $sql = "UPDATE orders SET status = ?, notes = ? WHERE id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssi", $status, $notes, $order_id);
        
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['status' => 'success', 'message' => 'Status updated']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to update']);
        }
        mysqli_stmt_close($stmt);
        break;
}
mysqli_close($conn);
?>