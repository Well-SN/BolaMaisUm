import { v4 as uuidv4 } from 'uuid';
import { Player, Team, GameState } from '../types';

export const createPlayer = (name: string): Player => ({
  id: uuidv4(),
  name
});

export const createTeam = (name: string, players: Player[]): Team => ({
  id: uuidv4(),
  name,
  players,
  isPlaying: false
});

export const generateTeamName = (players: Player[]): string => {
  if (players.length === 0) return "Empty Team";
  
  const acronym = players
    .map(player => player.name.charAt(0).toUpperCase())
    .join('');
  
  const suffixes = ["Squad", "Crew", "Ballers", "Stars", "Elite", "Force"];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${acronym} ${randomSuffix}`;
};

export const initializeGame = (state: GameState): GameState => {
  // Get all teams that aren't currently in a game
  const availableTeams = state.teams.filter(team => 
    !team.isPlaying && 
    team.id !== state.currentGame.teamA?.id && 
    team.id !== state.currentGame.teamB?.id
  );

  // If we have no current game and at least 2 teams, start a new game
  if (!state.currentGame.teamA && !state.currentGame.teamB && availableTeams.length >= 2) {
    const [teamA, teamB] = availableTeams;
    
    return {
      ...state,
      teams: state.teams.map(team => ({
        ...team,
        isPlaying: team.id === teamA.id || team.id === teamB.id
      })),
      currentGame: {
        teamA: { ...teamA, isPlaying: true },
        teamB: { ...teamB, isPlaying: true }
      }
    };
  }

  // If we have one slot open and available teams, fill it
  if (!state.currentGame.teamA && availableTeams.length > 0) {
    const [nextTeam] = availableTeams;
    return {
      ...state,
      teams: state.teams.map(team => ({
        ...team,
        isPlaying: team.id === nextTeam.id || team.id === state.currentGame.teamB?.id
      })),
      currentGame: {
        ...state.currentGame,
        teamA: { ...nextTeam, isPlaying: true }
      }
    };
  }

  if (!state.currentGame.teamB && availableTeams.length > 0) {
    const [nextTeam] = availableTeams;
    return {
      ...state,
      teams: state.teams.map(team => ({
        ...team,
        isPlaying: team.id === nextTeam.id || team.id === state.currentGame.teamA?.id
      })),
      currentGame: {
        ...state.currentGame,
        teamB: { ...nextTeam, isPlaying: true }
      }
    };
  }

  return state;
};

export const handleGameWinner = (state: GameState, winnerTeamId: string): GameState => {
  const loserTeam = 
    state.currentGame.teamA?.id === winnerTeamId 
      ? state.currentGame.teamB 
      : state.currentGame.teamA;
  
  const winnerTeam = state.teams.find(team => team.id === winnerTeamId);
  
  if (!winnerTeam || !loserTeam) return state;
  
  // Find the next available team
  const nextTeam = state.teams.find(team => 
    !team.isPlaying && 
    team.id !== winnerTeamId && 
    team.id !== loserTeam.id
  );
  
  const updatedTeams = state.teams.map(team => ({
    ...team,
    isPlaying: team.id === winnerTeamId || team.id === nextTeam?.id
  }));
  
  return {
    ...state,
    teams: updatedTeams,
    currentGame: {
      teamA: { ...winnerTeam, isPlaying: true },
      teamB: nextTeam || null
    }
  };
};