<?php
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

// Create tables if they don't exist
try {
    // Players table
    $query = "CREATE TABLE IF NOT EXISTS players (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $db->exec($query);

    // Teams table
    $query = "CREATE TABLE IF NOT EXISTS teams (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        is_playing BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $db->exec($query);

    // Team players junction table
    $query = "CREATE TABLE IF NOT EXISTS team_players (
        team_id VARCHAR(36),
        player_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (team_id, player_id),
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
    )";
    $db->exec($query);

    // Current game table
    $query = "CREATE TABLE IF NOT EXISTS current_game (
        id VARCHAR(36) PRIMARY KEY DEFAULT 'current-game-id',
        team_a_id VARCHAR(36) NULL,
        team_b_id VARCHAR(36) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (team_a_id) REFERENCES teams(id) ON DELETE SET NULL,
        FOREIGN KEY (team_b_id) REFERENCES teams(id) ON DELETE SET NULL
    )";
    $db->exec($query);

    // Insert default current game record if it doesn't exist
    $query = "INSERT IGNORE INTO current_game (id, team_a_id, team_b_id) VALUES ('current-game-id', NULL, NULL)";
    $db->exec($query);

    echo json_encode(array("message" => "Database initialized successfully"));
} catch(PDOException $exception) {
    error_log("Database initialization error: " . $exception->getMessage());
    http_response_code(500);
    echo json_encode(array("message" => "Database initialization failed: " . $exception->getMessage()));
}
?>