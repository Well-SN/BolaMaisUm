<?php
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        getPlayers($db);
        break;
    case 'POST':
        createPlayer($db);
        break;
    case 'DELETE':
        deletePlayer($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function getPlayers($db) {
    try {
        $query = "SELECT * FROM players ORDER BY created_at ASC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $players = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($players);
    } catch(PDOException $exception) {
        http_response_code(500);
        echo json_encode(array("message" => "Error: " . $exception->getMessage()));
    }
}

function createPlayer($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if(empty($data->name)) {
        http_response_code(400);
        echo json_encode(array("message" => "Player name is required"));
        return;
    }
    
    try {
        // Check if player already exists
        $checkQuery = "SELECT id FROM players WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute([trim($data->name)]);
        
        if($checkStmt->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(array("message" => "Player already exists"));
            return;
        }
        
        $id = generateUUID();
        $query = "INSERT INTO players (id, name) VALUES (?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([$id, trim($data->name)]);
        
        echo json_encode(array(
            "message" => "Player created successfully",
            "player" => array(
                "id" => $id,
                "name" => trim($data->name)
            )
        ));
    } catch(PDOException $exception) {
        http_response_code(500);
        echo json_encode(array("message" => "Error: " . $exception->getMessage()));
    }
}

function deletePlayer($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if(empty($data->id)) {
        http_response_code(400);
        echo json_encode(array("message" => "Player ID is required"));
        return;
    }
    
    try {
        $query = "DELETE FROM players WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$data->id]);
        
        echo json_encode(array("message" => "Player deleted successfully"));
    } catch(PDOException $exception) {
        http_response_code(500);
        echo json_encode(array("message" => "Error: " . $exception->getMessage()));
    }
}

function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}
?>