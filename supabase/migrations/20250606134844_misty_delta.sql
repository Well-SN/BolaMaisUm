/*
  # Add authentication policies

  1. Security
    - Update RLS policies to allow public read access
    - Restrict write operations to authenticated users only
    - Maintain data visibility for all users while protecting write operations

  2. Changes
    - Update all table policies to allow public SELECT
    - Restrict INSERT, UPDATE, DELETE to authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public players access" ON players;
DROP POLICY IF EXISTS "Public teams access" ON teams;
DROP POLICY IF EXISTS "Public team_players access" ON team_players;
DROP POLICY IF EXISTS "Public current_game access" ON current_game;

-- Players table policies
CREATE POLICY "Anyone can read players"
  ON players
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage players"
  ON players
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Teams table policies
CREATE POLICY "Anyone can read teams"
  ON teams
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage teams"
  ON teams
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Team players table policies
CREATE POLICY "Anyone can read team_players"
  ON team_players
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage team_players"
  ON team_players
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Current game table policies
CREATE POLICY "Anyone can read current_game"
  ON current_game
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage current_game"
  ON current_game
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);