<?php
include "../config.php";
header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

// Create table if it doesn't exist
$createTable = "CREATE TABLE IF NOT EXISTS training_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    trainer VARCHAR(255) NOT NULL,
    duration INT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    capacity INT NOT NULL,
    enrolled INT DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
mysqli_query($conn, $createTable);

switch($action) {
    case 'list':
        $sql = "SELECT * FROM training_sessions ORDER BY date DESC, time DESC";
        $result = mysqli_query($conn, $sql);
        
        $sessions = [];
        while($row = mysqli_fetch_assoc($result)) {
            $sessions[] = $row;
        }
        
        echo json_encode([
            "status" => "success",
            "sessions" => $sessions
        ]);
        break;
        
    case 'get':
        $id = $_GET['id'] ?? 0;
        
        $sql = "SELECT * FROM training_sessions WHERE id = $id";
        $result = mysqli_query($conn, $sql);
        
        if(mysqli_num_rows($result) > 0) {
            $session = mysqli_fetch_assoc($result);
            echo json_encode([
                "status" => "success",
                "session" => $session
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Session not found"
            ]);
        }
        break;
        
    case 'create':
        $data = json_decode(file_get_contents('php://input'), true);
        
        $name = mysqli_real_escape_string($conn, $data['name']);
        $trainer = mysqli_real_escape_string($conn, $data['trainer']);
        $duration = intval($data['duration']);
        $date = mysqli_real_escape_string($conn, $data['date']);
        $time = mysqli_real_escape_string($conn, $data['time']);
        $capacity = intval($data['capacity']);
        $price = floatval($data['price']);
        $description = mysqli_real_escape_string($conn, $data['description'] ?? '');
        
        $sql = "INSERT INTO training_sessions (name, trainer, duration, date, time, capacity, price, description) 
                VALUES ('$name', '$trainer', $duration, '$date', '$time', $capacity, $price, '$description')";
        
        if(mysqli_query($conn, $sql)) {
            echo json_encode([
                "status" => "success",
                "message" => "Training session created successfully",
                "id" => mysqli_insert_id($conn)
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => mysqli_error($conn)
            ]);
        }
        break;
        
    case 'update':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id']);
        
        $name = mysqli_real_escape_string($conn, $data['name']);
        $trainer = mysqli_real_escape_string($conn, $data['trainer']);
        $duration = intval($data['duration']);
        $date = mysqli_real_escape_string($conn, $data['date']);
        $time = mysqli_real_escape_string($conn, $data['time']);
        $capacity = intval($data['capacity']);
        $price = floatval($data['price']);
        $description = mysqli_real_escape_string($conn, $data['description'] ?? '');
        
        $sql = "UPDATE training_sessions SET 
                name='$name', trainer='$trainer', duration=$duration, date='$date',
                time='$time', capacity=$capacity, price=$price, description='$description'
                WHERE id=$id";
        
        if(mysqli_query($conn, $sql)) {
            echo json_encode([
                "status" => "success",
                "message" => "Training session updated successfully"
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
        
        $sql = "DELETE FROM training_sessions WHERE id = $id";
        
        if(mysqli_query($conn, $sql)) {
            echo json_encode([
                "status" => "success",
                "message" => "Training session deleted successfully"
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
