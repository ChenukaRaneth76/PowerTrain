<?php
// Increase upload limits
@ini_set('upload_max_filesize', '100M');
@ini_set('post_max_size', '100M');
@ini_set('memory_limit', '128M');
@ini_set('max_execution_time', '300');

header('Content-Type: application/json');

// Debug information
error_log("Upload request received. Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Files array: " . print_r($_FILES, true));
error_log("Current upload_max_filesize: " . ini_get('upload_max_filesize'));
error_log("Current post_max_size: " . ini_get('post_max_size'));
error_log("Current memory_limit: " . ini_get('memory_limit'));

// Create uploads directory if it doesn't exist
$uploadDir = '../../uploads/products/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
    error_log("Created upload directory: " . $uploadDir);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
    $file = $_FILES['image'];
    
    // Log file details
    error_log("File name: " . $file['name']);
    error_log("File size: " . $file['size'] . " bytes (" . round($file['size'] / 1024 / 1024, 2) . " MB)");
    error_log("File type: " . $file['type']);
    error_log("File error code: " . $file['error']);
    
    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'File is too large. Maximum upload size is 100MB. Please compress or resize your image.',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds the maximum allowed size.',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded. Please try again.',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded.',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder.',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
            UPLOAD_ERR_EXTENSION => 'File upload stopped by extension.'
        ];
        
        $message = isset($errorMessages[$file['error']]) 
            ? $errorMessages[$file['error']] 
            : 'Upload failed with error code: ' . $file['error'];
        
        // Add debugging info
        $currentUploadLimit = ini_get('upload_max_filesize');
        $currentPostLimit = ini_get('post_max_size');
        
        $debugInfo = [
            'file_size' => round($file['size'] / 1024 / 1024, 2) . ' MB',
            'upload_max_filesize' => $currentUploadLimit,
            'post_max_size' => $currentPostLimit,
            'error_code' => $file['error']
        ];
        
        error_log("Upload error details: " . print_r($debugInfo, true));
        
        // Add specific instructions for error code 1
        if ($file['error'] == UPLOAD_ERR_INI_SIZE) {
            $message = "File exceeds server limit ({$currentUploadLimit}). To fix: \n" .
                      "1. Click WAMP icon → PHP → php.ini\n" .
                      "2. Find and change: upload_max_filesize = 100M\n" .
                      "3. Find and change: post_max_size = 100M\n" .
                      "4. Save and Restart WAMP\n" .
                      "OR compress your image to under {$currentUploadLimit}";
        }
            
        echo json_encode([
            'status' => 'error',
            'message' => $message,
            'current_limit' => $currentUploadLimit,
            'debug' => $debugInfo
        ]);
        exit;
    }
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'
        ]);
        exit;
    }
    
    // Validate file size (max 100MB)
    $maxSize = 100 * 1024 * 1024; // 100MB
    if ($file['size'] > $maxSize) {
        echo json_encode([
            'status' => 'error',
            'message' => 'File too large. Maximum size is 100MB. Please compress or resize your image.'
        ]);
        exit;
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('product_') . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . $filename;
    
    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        echo json_encode([
            'status' => 'success',
            'filename' => $filename,
            'path' => 'uploads/products/' . $filename,
            'message' => 'Image uploaded successfully'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to move uploaded file'
        ]);
    }
} else {
    // More detailed error for debugging
    $errorDetails = [
        'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'],
        'FILES_isset' => isset($_FILES['image']),
        'FILES_array' => $_FILES,
        'POST_data' => $_POST
    ];
    
    error_log('No file upload - Details: ' . print_r($errorDetails, true));
    
    echo json_encode([
        'status' => 'error',
        'message' => 'No file uploaded. Make sure you selected an image file.',
        'debug' => $errorDetails
    ]);
}
?>
