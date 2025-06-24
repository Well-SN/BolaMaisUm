<?php
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        getTeams($db);
        break;
    case 'POST':
        createTeam($db);
        break;
    case 'PUT':
        updateTeam($db);
        break;
    case 'DELETE':
        deleteTeam($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function getTeams($db) {
    try {
        $query = "SELECT t.*, 
                         p.id as player_id, p.name as player_name
                  FROM teams t
                  LEFT JOIN team_players tp ON t.id = tp.team_id
                  LEFT JOIN players p ON tp.player_id = p.id
                  ORDER BY t.created_at ASC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $teams = [];
        
        foreach($results as $row) {
            $teamId = $row['id'];
            if(!isset($teams[$teamId])) {
                $teams[$teamId] = [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'isPlaying' => (bool)$row['is_playing'],
                    'created_at' => $row['created_at'],
                    'players' => []
                ];
            }
            
            if($row['player_id']) {
                $teams[$teamId]['players'][] = [
                    'id' => $row['player_id'],
                    'name' => $row['player_name']
                ];
            }
        }
        
        echo json_encode(array_values($teams));
    } catch(PDOException $exception) {
        http_response_code(500);
        echo json_encode(array("message" => "Error: " . $exception->getMessage()));
    }
}

function createTeam($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if(empty($data->name) || empty($data->playerIds)) {
        http_response_code(400);
        echo json_encode(array("message" => "Team name and player IDs are required"));
        return;
    }
    
    try {
        $db->beginTransaction();
        
        $teamId = generateUUID();
        $query = "INSERT INTO teams (id, name) VALUES (?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([$teamId, trim($data->name)]);
        
        // Add players to team
        $playerQuery = "INSERT INTO team_players (team_id, player_id) VALUES (?, ?)";
        $playerStmt = $db->prepare($playerQuery);
        
        foreach($data->playerIds as $playerId) {
            $playerStmt->execute([$teamId, $playerId]);
        }
        
        $db->commit();
        
        echo json_encode(array(
            "message" => "Team created successfully",
            "team" => array(
                "id" => $teamId,
                "name" => trim($data->name)
            )
        ));
    } catch(PDOException $exception) {
        $db->rollback();
        http_response_code(500);
        echo json_encode(array("message" => "Error: " . $exception->getMessage()));
    }
}

function updateTeam($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if(empty($data->id)) {
        http_response_code(400);
        echo json_encode(array("message" => "Team ID is required"));
        return;
    }
    
    try {
        $db->beginTransaction();
        
        // Update team name if provided
        if(!empty($data->name)) {
            $query = "UPDATE teams SET name = ? WHERE id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([trim($data->name), $data->id]);
        }
        
        // Update players if provided
        if(isset($data->playerIds)) {
            // Remove existing players
            $deleteQuery = "DELETE FROM team_players WHERE team_id = ?";
            $deleteStmt = $db->prepare($deleteQuery);
            $deleteStmt->execute([$data->id]);
            
            // Add new players
            if(!empty($data->playerIds)) {
                $playerQuery = "INSERT INTO team_players (team_id, player_id) VALUES (?, ?)";
                $playerStmt = $db->prepare($playerQuery);
                
                foreach($data->playerIds as $playerId) {
                    $playerStmt->execute([$data->id, $playerId]);
                }
            }
        }
        
        $db->commit();
        echo json_encode(array("message" => "Team updated successfully"));
    } catch(PDOException $exception) {
        $db->rollback();
        http_response_code(500);
        echo json_encode(array("message" => "Error: " . $exception->getMessage()));
    }
}

function deleteTeam($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if(empty($data->id)) {
        http_response_code(400);
        echo json_encode(array("message" => "Team ID is required"));
        return;
    }
    
    try {
        $query = "DELETE FROM teams WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$data->id]);
        
        echo json_encode(array("message" => "Team deleted successfully"));
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