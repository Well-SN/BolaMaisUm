import { v4 as uuidv4 } from 'uuid';
import { Player, Team, GameState } from '../types';

/**
 * Creates a new player with the given name
 */
export const createPlayer = (name: string): Player => ({
  id: uuidv4(),
  name
});

/**
 * Creates a new team with the given name and players
 */
export const createTeam = (name: string, players: Player[]): Team => ({
  id: uuidv4(),
  name,
  players
});

/**
 * Generates a team name based on the first letter of each player's name
 */
export const generateTeamName = (players: Player[]): string => {
  if (players.length === 0) return "Empty Team";
  
  // Use first letter of each player's name to create an acronym
  const acronym = players
    .map(player => player.name.charAt(0).toUpperCase())
    .join('');
  
  // Add a random suffix to make it more unique
  const suffixes = ["Squad", "Crew", "Ballers", "Stars", "Elite", "Force"];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${acronym} ${randomSuffix}`;
};

/**
 * Forms teams from unassigned players
 */
export const formTeamsFromUnassigned = (players: Player[]): Team[] => {
  const teams: Team[] = [];
  
  // Copy and shuffle the players array
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
  
  // Create teams of 3 players
  for (let i = 0; i < shuffledPlayers.length; i += 3) {
    if (i + 3 <= shuffledPlayers.length) {
      const teamPlayers = shuffledPlayers.slice(i, i + 3);
      const teamName = generateTeamName(teamPlayers);
      teams.push(createTeam(teamName, teamPlayers));
    }
  }
  
  return teams;
};

/**
 * Initializes a game with teams from unassigned players
 */
export const initializeGame = (state: GameState): GameState => {
  // First, try to form teams from unassigned players
  const newTeams = formTeamsFromUnassigned(state.unassignedPlayers);
  
  // Combine with existing teams
  const allTeams = [...state.teams, ...newTeams];
  
  // If we have at least 2 teams, set up the current game
  let currentGame = { ...state.currentGame };
  let remainingTeams = [...allTeams];
  
  if (!currentGame.teamA && remainingTeams.length > 0) {
    currentGame.teamA = remainingTeams[0];
    remainingTeams[0] = { ...remainingTeams[0], isPlaying: true };
    remainingTeams = remainingTeams.slice(1);
  }
  
  if (!currentGame.teamB && remainingTeams.length > 0) {
    currentGame.teamB = remainingTeams[0];
    remainingTeams[0] = { ...remainingTeams[0], isPlaying: true };
    remainingTeams = remainingTeams.slice(1);
  }
  
  // Return the new state
  return {
    ...state,
    teams: allTeams.map(team => ({
      ...team,
      isPlaying: team.id === currentGame.teamA?.id || team.id === currentGame.teamB?.id
    })),
    currentGame,
    unassignedPlayers: state.unassignedPlayers.filter(player => 
      !allTeams.some(team => team.players.some(p => p.id === player.id))
    )
  };
};

/**
 * Updates the game state after a winner is determined
 */
export const handleGameWinner = (state: GameState, winnerTeamId: string): GameState => {
  // Find the loser team (the one that's not the winner)
  const loserTeam = 
    state.currentGame.teamA?.id === winnerTeamId 
      ? state.currentGame.teamB 
      : state.currentGame.teamA;
  
  // Find the winner team
  const winnerTeam = state.teams.find(team => team.id === winnerTeamId);
  
  if (!winnerTeam || !loserTeam) return state;
  
  // Move the loser team to the end of the queue
  const updatedTeams = state.teams
    .map(team => ({
      ...team,
      isPlaying: team.id === winnerTeamId || team.id === state.teams[0]?.id
    }))
    .filter(team => team.id !== loserTeam.id)
    .concat({ ...loserTeam, isPlaying: false });
  
  // Get the next team from the queue (first team not playing)
  const nextTeam = updatedTeams.find(team => 
    !team.isPlaying && team.id !== winnerTeamId && team.id !== loserTeam.id
  );
  
  // Update the current game
  const currentGame = {
    teamA: winnerTeam,
    teamB: nextTeam || null
  };
  
  // If we found a next team, mark it as playing
  const finalTeams = updatedTeams.map(team => ({
    ...team,
    isPlaying: team.id === winnerTeamId || team.id === nextTeam?.id
  }));
  
  return {
    ...state,
    teams: finalTeams,
    currentGame
  };
};

/**
 * Gets the next available players to form a team
 */
export const getNextAvailablePlayers = (state: GameState): Player[] => {
  return state.unassignedPlayers.slice(0, 3);
};

/**
 * Saves the game state to localStorage
 */
export const saveGameState = (state: GameState): void => {
  try {
    localStorage.setItem('basketballQueueState', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

/**
 * Loads the game state from localStorage
 */
export const loadGameState = (): GameState | null => {
  try {
    const savedState = localStorage.getItem('basketballQueueState');
    return savedState ? JSON.parse(savedState) : null;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
};