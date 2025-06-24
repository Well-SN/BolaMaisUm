<?php
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        getCurrentGame($db);
        break;
    case 'POST':
        updateCurrentGame($db);
        break;
    case 'PUT':
        setWinner($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function getCurrentGame($db) {
    try {
        $query = "SELECT cg.*, 
                         ta.name as team_a_name, ta.is_playing as team_a_playing,
                         tb.name as team_b_name, tb.is_playing as team_b_playing
                  FROM current_game cg
                  LEFT JOIN teams ta ON cg.team_a_id = ta.id
                  LEFT JOIN teams tb ON cg.team_b_id = tb.id
                  WHERE cg.id = 'current-game-id'";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $game = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($game) {
            $result = [
                'id' => $game['id'],
                'teamA' => null,
                'teamB' => null
            ];
            
            if($game['team_a_id']) {
                $result['teamA'] = getTeamWithPlayers($db, $game['team_a_id']);
            }
            
            if($game['team_b_id']) {
                $result['teamB'] = getTeamWithPlayers($db, $game['team_b_id']);
            }
            
            echo json_encode($result);
        } else {
            echo json_encode(['teamA' => null, 'teamB' => null]);
        }
    } catch(PDOException $exception) {
        http_response_code(500);
        echo json_encode(array("message" => "Error: " . $exception->getMessage()));
    }
}

function updateCurrentGame($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    try {
        $query = "UPDATE current_game SET team_a_id = ?, team_b_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 'current-game-id'";
        $stmt = $db->prepare($query);
        $stmt->execute([
            $data->teamAId ?? null,
            $data->teamBId ?? null
        ]);
        
        echo json_encode(array("message" => "Current game updated successfully"));
    } catch(PDOException $exception) {
        http_response_code(500);
        echo json_encode(array("message" => "Error: " . $exception->getMessage()));
    }
}

function setWinner($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if(empty($data->winnerId)) {
        http_response_code(400);
        echo json_encode(array("message" => "Winner ID is required"));
        return;
    }
    
    try {
        $db->beginTransaction();
        
        // Get current game
        $gameQuery = "SELECT team_a_id, team_b_id FROM current_game WHERE id = 'current-game-id'";
        $gameStmt = $db->prepare($gameQuery);
        $gameStmt->execute();
        $currentGame = $gameStmt->fetch(PDO::FETCH_ASSOC);
        
        if(!$currentGame || (!$currentGame['team_a_id'] || !$currentGame['team_b_id'])) {
            http_response_code(400);
            echo json_encode(array("message" => "No complete game in progress"));
            return;
        }
        
        $loserId = ($data->winnerId === $currentGame['team_a_id']) 
            ? $currentGame['team_b_id'] 
            : $currentGame['team_a_id'];
        
        // Update team playing status
        $updateQuery = "UPDATE teams SET is_playing = CASE 
                                        WHEN id = ? THEN TRUE 
                                        WHEN id = ? THEN FALSE 
                                        ELSE is_playing 
                                        END";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->execute([$data->winnerId, $loserId]);
        
        // Get next team in queue
        $nextTeamQuery = "SELECT id FROM teams 
                         WHERE is_playing = FALSE 
                         AND id NOT IN (?, ?) 
                         AND id IN (SELECT DISTINCT team_id FROM team_players)
                         ORDER BY created_at ASC 
                         LIMIT 1";
        $nextTeamStmt = $db->prepare($nextTeamQuery);
        $nextTeamStmt->execute([$data->winnerId, $loserId]);
        $nextTeam = $nextTeamStmt->fetch(PDO::FETCH_ASSOC);
        
        // Update current game
        $newTeamBId = $nextTeam ? $nextTeam['id'] : null;
        if($newTeamBId) {
            $updateTeamQuery = "UPDATE teams SET is_playing = TRUE WHERE id = ?";
            $updateTeamStmt = $db->prepare($updateTeamQuery);
            $updateTeamStmt->execute([$newTeamBId]);
        }
        
        $updateGameQuery = "UPDATE current_game SET team_a_id = ?, team_b_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 'current-game-id'";
        $updateGameStmt = $db->prepare($updateGameQuery);
        $updateGameStmt->execute([$data->winnerId, $newTeamBId]);
        
        $db->commit();
        echo json_encode(array("message" => "Winner set successfully"));
    } catch(PDOException $exception) {
        $db->rollback();
        http_response_code(500);
        echo json_encode(array("message" => "Error: " . $exception->getMessage()));
    }
}

function getTeamWithPlayers($db, $teamId) {
    $query = "SELECT t.*, 
                     p.id as player_id, p.name as player_name
              FROM teams t
              LEFT JOIN team_players tp ON t.id = tp.team_id
              LEFT JOIN players p ON tp.player_id = p.id
              WHERE t.id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$teamId]);
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if(empty($results)) return null;
    
    $team = [
        'id' => $results[0]['id'],
        'name' => $results[0]['name'],
        'isPlaying' => (bool)$results[0]['is_playing'],
        'players' => []
    ];
    
    foreach($results as $row) {
        if($row['player_id']) {
            $team['players'][] = [
                'id' => $row['player_id'],
                'name' => $row['player_name']
            ];
        }
    }
    
    return $team;
}
?>