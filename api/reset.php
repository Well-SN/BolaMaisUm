<?php
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if($method !== 'POST') {
    http_response_code(405);
    echo json_encode(array("message" => "Method not allowed"));
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if(empty($data->password) || $data->password !== 'admin123') {
    http_response_code(401);
    echo json_encode(array("message" => "Invalid password"));
    exit;
}

try {
    $db->beginTransaction();
    
    // Clear all data
    $db->exec("DELETE FROM team_players");
    $db->exec("DELETE FROM teams");
    $db->exec("DELETE FROM players");
    $db->exec("UPDATE current_game SET team_a_id = NULL, team_b_id = NULL WHERE id = 'current-game-id'");
    
    $db->commit();
    echo json_encode(array("message" => "Database reset successfully"));
} catch(PDOException $exception) {
    $db->rollback();
    http_response_code(500);
    echo json_encode(array("message" => "Error: " . $exception->getMessage()));
}
?>